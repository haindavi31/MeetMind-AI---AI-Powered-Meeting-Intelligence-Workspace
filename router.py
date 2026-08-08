
from pathlib import Path
from uuid import uuid4
import json
from datetime import datetime, timezone

from fastapi import APIRouter, File, HTTPException, UploadFile, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Meeting

from ..analysis.action_items import extract_action_items
from ..analysis.key_points import extract_key_points
from ..analysis.service import generate_summary
from ..chat.service import answer_meeting_question
from ..transcription.service import transcribe_audio


router = APIRouter(
    prefix="/meetings",
    tags=["Meetings"],
)


# ============================================================
# UPLOAD DIRECTORY
# ============================================================

UPLOAD_DIR = Path("uploads/meetings")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


# ============================================================
# SUPPORTED FILE FORMATS
# ============================================================

ALLOWED_EXTENSIONS = {
    ".mp3",
    ".wav",
    ".m4a",
    ".mp4",
}


# ============================================================
# CHAT REQUEST SCHEMA
# ============================================================

class MeetingChatRequest(BaseModel):
    question: str


# ============================================================
# UPLOAD MEETING
# ============================================================

@router.post("/upload")
async def upload_meeting(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Upload a meeting audio/video file
    and create a database record.
    """

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file was provided.",
        )

    extension = Path(file.filename).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported file type. "
                "Allowed formats: MP3, WAV, M4A, MP4."
            ),
        )

    # Generate unique meeting ID
    meeting_id = str(uuid4())

    safe_filename = f"{meeting_id}{extension}"
    file_path = UPLOAD_DIR / safe_filename

    # Save uploaded file
    try:
        with file_path.open("wb") as buffer:

            while True:
                chunk = await file.read(1024 * 1024)

                if not chunk:
                    break

                buffer.write(chunk)

    except Exception as error:

        if file_path.exists():
            file_path.unlink()

        raise HTTPException(
            status_code=500,
            detail=f"Could not save uploaded file: {error}",
        )

    finally:
        await file.close()

    # Create database record
    meeting = Meeting(
        meeting_id=meeting_id,
        filename=file.filename,
        status="uploaded",
    )

    try:
        db.add(meeting)
        db.commit()
        db.refresh(meeting)

    except Exception as error:

        db.rollback()

        if file_path.exists():
            file_path.unlink()

        raise HTTPException(
            status_code=500,
            detail=f"Could not save meeting to database: {error}",
        )

    return {
        "message": "Meeting uploaded successfully.",
        "meeting_id": meeting_id,
        "filename": file.filename,
        "stored_filename": safe_filename,
        "file_type": extension.replace(".", ""),
        "status": "uploaded",
    }


# ============================================================
# TRANSCRIBE MEETING
# ============================================================

@router.post("/{meeting_id}/transcribe")
async def transcribe_meeting(
    meeting_id: str,
    db: Session = Depends(get_db),
):
    """
    Transcribe an uploaded meeting using Whisper.
    """

    matching_files = list(
        UPLOAD_DIR.glob(f"{meeting_id}.*")
    )

    if not matching_files:
        raise HTTPException(
            status_code=404,
            detail="Meeting file not found.",
        )

    file_path = matching_files[0]

    try:
        result = transcribe_audio(
            str(file_path)
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Transcription failed: {error}",
        )

    # Find database record
    meeting = (
        db.query(Meeting)
        .filter(Meeting.meeting_id == meeting_id)
        .first()
    )

    if not meeting:
        raise HTTPException(
            status_code=404,
            detail="Meeting record not found in database.",
        )

    meeting.transcript = result["text"]
    meeting.language = result["language"]
    meeting.status = "transcribed"

    db.commit()

    return {
        "message": "Meeting transcribed successfully.",
        "meeting_id": meeting_id,
        "transcript": result["text"],
        "language": result["language"],
        "status": "transcribed",
    }


# ============================================================
# ANALYZE MEETING
# ============================================================

@router.post("/{meeting_id}/analyze")
async def analyze_meeting(
    meeting_id: str,
    db: Session = Depends(get_db),
):
    """
    Transcribe and analyze an uploaded meeting.
    """

    matching_files = list(
        UPLOAD_DIR.glob(f"{meeting_id}.*")
    )

    if not matching_files:
        raise HTTPException(
            status_code=404,
            detail="Meeting file not found.",
        )

    file_path = matching_files[0]

    # Find meeting in database
    meeting = (
        db.query(Meeting)
        .filter(Meeting.meeting_id == meeting_id)
        .first()
    )

    if not meeting:
        raise HTTPException(
            status_code=404,
            detail="Meeting record not found in database.",
        )

    try:

        # -----------------------------------------------------
        # STEP 1: TRANSCRIBE
        # -----------------------------------------------------

        transcription = transcribe_audio(
            str(file_path)
        )

        transcript = transcription["text"]

        # -----------------------------------------------------
        # STEP 2: GENERATE SUMMARY
        # -----------------------------------------------------

        summary = generate_summary(
            transcript
        )

        # -----------------------------------------------------
        # STEP 3: EXTRACT ACTION ITEMS
        # -----------------------------------------------------

        action_items = extract_action_items(
            transcript
        )

        # -----------------------------------------------------
        # STEP 4: EXTRACT KEY POINTS
        # -----------------------------------------------------

        key_points = extract_key_points(
            transcript
        )

        # -----------------------------------------------------
        # STEP 5: SAVE ANALYSIS TO DATABASE
        # -----------------------------------------------------

        meeting.language = transcription["language"]

        meeting.transcript = transcript

        meeting.summary = json.dumps(
            summary,
            ensure_ascii=False,
        )

        meeting.key_points = json.dumps(
            key_points,
            ensure_ascii=False,
        )

        meeting.action_items = json.dumps(
            action_items,
            ensure_ascii=False,
        )

        meeting.status = "analyzed"

        meeting.analyzed_at = datetime.now(
            timezone.utc
        )

        db.commit()
        db.refresh(meeting)

    except Exception as error:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Meeting analysis failed: {error}",
        )

    return {
        "message": "Meeting analyzed successfully.",
        "meeting_id": meeting_id,
        "language": transcription["language"],
        "transcript": transcript,
        "summary": summary,
        "key_points": key_points,
        "action_items": action_items,
        "status": "analyzed",
    }


# ============================================================
# CHAT WITH MEETING
# ============================================================

@router.post("/{meeting_id}/chat")
async def chat_with_meeting(
    meeting_id: str,
    request: MeetingChatRequest,
    db: Session = Depends(get_db),
):
    """
    Ask a question about a specific meeting.

    The answer is generated using only the transcript
    belonging to the requested meeting.
    """

    # ---------------------------------------------------------
    # STEP 1: FIND MEETING
    # ---------------------------------------------------------

    meeting = (
        db.query(Meeting)
        .filter(Meeting.meeting_id == meeting_id)
        .first()
    )

    if not meeting:
        raise HTTPException(
            status_code=404,
            detail="Meeting not found.",
        )

    # ---------------------------------------------------------
    # STEP 2: CHECK TRANSCRIPT
    # ---------------------------------------------------------

    if not meeting.transcript:
        raise HTTPException(
            status_code=400,
            detail=(
                "This meeting has no transcript yet. "
                "Please analyze the meeting first."
            ),
        )

    # ---------------------------------------------------------
    # STEP 3: VALIDATE QUESTION
    # ---------------------------------------------------------

    if not request.question or not request.question.strip():
        raise HTTPException(
            status_code=400,
            detail="Please enter a question.",
        )

    # ---------------------------------------------------------
    # STEP 4: ANSWER QUESTION
    # ---------------------------------------------------------

    try:

        result = answer_meeting_question(
            transcript=meeting.transcript,
            question=request.question,
        )

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"Could not answer meeting question: {error}",
        )

    # ---------------------------------------------------------
    # STEP 5: RETURN ANSWER
    # ---------------------------------------------------------

    return {
        "meeting_id": meeting.meeting_id,
        "question": request.question,
        "answer": result["answer"],
        "sources": result["sources"],
    }


# ============================================================
# GET MEETING
# ============================================================

@router.get("/{meeting_id}")
async def get_meeting(
    meeting_id: str,
    db: Session = Depends(get_db),
):
    """
    Get a previously analyzed meeting.
    """

    meeting = (
        db.query(Meeting)
        .filter(Meeting.meeting_id == meeting_id)
        .first()
    )

    if not meeting:
        raise HTTPException(
            status_code=404,
            detail="Meeting not found.",
        )

    # ---------------------------------------------------------
    # Parse summary
    # ---------------------------------------------------------

    try:
        summary = (
            json.loads(meeting.summary)
            if meeting.summary
            else None
        )

    except Exception:
        summary = meeting.summary

    # ---------------------------------------------------------
    # Parse key points
    # ---------------------------------------------------------

    try:
        key_points = (
            json.loads(meeting.key_points)
            if meeting.key_points
            else []
        )

    except Exception:
        key_points = []

    # ---------------------------------------------------------
    # Parse action items
    # ---------------------------------------------------------

    try:
        action_items = (
            json.loads(meeting.action_items)
            if meeting.action_items
            else []
        )

    except Exception:
        action_items = []

    return {
        "meeting_id": meeting.meeting_id,
        "filename": meeting.filename,
        "language": meeting.language,
        "transcript": meeting.transcript,
        "summary": summary,
        "key_points": key_points,
        "action_items": action_items,
        "status": meeting.status,
        "created_at": meeting.created_at,
        "analyzed_at": meeting.analyzed_at,
    }


# ============================================================
# GET ALL MEETINGS
# ============================================================

@router.get("/")
async def get_all_meetings(
    db: Session = Depends(get_db),
):
    """
    Get all meetings for the dashboard.
    """

    meetings = (
        db.query(Meeting)
        .order_by(Meeting.created_at.desc())
        .all()
    )

    return [
        {
            "meeting_id": meeting.meeting_id,
            "filename": meeting.filename,
            "language": meeting.language,
            "status": meeting.status,
            "created_at": meeting.created_at,
            "analyzed_at": meeting.analyzed_at,
        }
        for meeting in meetings
    ]


# ============================================================
# DELETE MEETING
# ============================================================

@router.delete("/{meeting_id}")
async def delete_meeting(
    meeting_id: str,
    db: Session = Depends(get_db),
):
    """
    Delete a meeting from both:
    1. The database
    2. The uploaded audio/video file
    """

    # ---------------------------------------------------------
    # STEP 1: FIND DATABASE RECORD
    # ---------------------------------------------------------

    meeting = (
        db.query(Meeting)
        .filter(Meeting.meeting_id == meeting_id)
        .first()
    )

    if not meeting:
        raise HTTPException(
            status_code=404,
            detail="Meeting not found.",
        )

    # Save filename before deleting database object
    original_filename = meeting.filename

    # ---------------------------------------------------------
    # STEP 2: FIND UPLOADED FILE
    # ---------------------------------------------------------

    matching_files = list(
        UPLOAD_DIR.glob(f"{meeting_id}.*")
    )

    # ---------------------------------------------------------
    # STEP 3: DELETE PHYSICAL FILE
    # ---------------------------------------------------------

    deleted_file = False

    for file_path in matching_files:

        try:

            if file_path.exists():
                file_path.unlink()
                deleted_file = True

        except Exception as error:

            raise HTTPException(
                status_code=500,
                detail=(
                    f"Could not delete uploaded file: {error}"
                ),
            )

    # ---------------------------------------------------------
    # STEP 4: DELETE DATABASE RECORD
    # ---------------------------------------------------------

    try:

        db.delete(meeting)
        db.commit()

    except Exception as error:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=(
                "Could not delete meeting from database: "
                f"{error}"
            ),
        )

    # ---------------------------------------------------------
    # STEP 5: RETURN SUCCESS
    # ---------------------------------------------------------

    return {
        "message": "Meeting deleted successfully.",
        "meeting_id": meeting_id,
        "filename": original_filename,
        "file_deleted": deleted_file,
        "database_record_deleted": True,
    }
