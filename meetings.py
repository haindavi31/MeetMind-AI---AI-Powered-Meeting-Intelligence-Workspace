from pathlib import Path
from uuid import uuid4
import json
from datetime import datetime, timezone

from fastapi import APIRouter, File, HTTPException, UploadFile, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Meeting

from ..analysis.action_items import extract_action_items
from ..analysis.key_points import extract_key_points
from ..analysis.service import generate_summary
from ..transcription.service import transcribe_audio


router = APIRouter(
    prefix="/meetings",
    tags=["Meetings"],
)


# =========================================================
# UPLOAD DIRECTORY
# =========================================================

UPLOAD_DIR = Path("uploads/meetings")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


# =========================================================
# SUPPORTED FILE FORMATS
# =========================================================

ALLOWED_EXTENSIONS = {
    ".mp3",
    ".wav",
    ".m4a",
    ".mp4",
}


# =========================================================
# UPLOAD MEETING
# =========================================================

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


# =========================================================
# TRANSCRIBE MEETING
# =========================================================

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

    try:
        result = transcribe_audio(
            str(file_path)
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Transcription failed: {error}",
        )

    meeting.transcript = result["text"]
    meeting.language = result["language"]
    meeting.status = "transcribed"

    try:
        db.commit()
        db.refresh(meeting)

    except Exception as error:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Could not save transcription: {error}",
        )

    return {
        "message": "Meeting transcribed successfully.",
        "meeting_id": meeting_id,
        "transcript": result["text"],
        "language": result["language"],
        "status": "transcribed",
    }


# =========================================================
# ANALYZE MEETING
# =========================================================

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

        # -------------------------------------------------
        # STEP 1: TRANSCRIBE
        # -------------------------------------------------

        transcription = transcribe_audio(
            str(file_path)
        )

        transcript = transcription["text"]

        # -------------------------------------------------
        # STEP 2: GENERATE SUMMARY
        # -------------------------------------------------

        summary = generate_summary(
            transcript
        )

        # -------------------------------------------------
        # STEP 3: EXTRACT ACTION ITEMS
        # -------------------------------------------------

        action_items = extract_action_items(
            transcript
        )

        # -------------------------------------------------
        # STEP 4: EXTRACT KEY POINTS
        # -------------------------------------------------

        key_points = extract_key_points(
            transcript
        )

        # -------------------------------------------------
        # STEP 5: SAVE ANALYSIS
        # -------------------------------------------------

        meeting.language = transcription["language"]

        meeting.transcript = transcript

        meeting.summary = summary

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


# =========================================================
# GET MEETING
# =========================================================

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

    try:
        key_points = (
            json.loads(meeting.key_points)
            if meeting.key_points
            else []
        )
    except Exception:
        key_points = []

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
        "summary": meeting.summary,
        "key_points": key_points,
        "action_items": action_items,
        "status": meeting.status,
        "created_at": meeting.created_at,
        "analyzed_at": meeting.analyzed_at,
    }


# =========================================================
# GET ALL MEETINGS
# =========================================================

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


# =========================================================
# DELETE MEETING
# =========================================================

@router.delete("/{meeting_id}")
async def delete_meeting(
    meeting_id: str,
    db: Session = Depends(get_db),
):
    """
    Delete a meeting completely.

    This removes:
    1. The meeting record from the database.
    2. The uploaded audio/video file.
    """

    # -----------------------------------------------------
    # STEP 1: Find meeting in database
    # -----------------------------------------------------

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

    # -----------------------------------------------------
    # STEP 2: Find uploaded file
    # -----------------------------------------------------

    matching_files = list(
        UPLOAD_DIR.glob(f"{meeting_id}.*")
    )

    # -----------------------------------------------------
    # STEP 3: Delete database record
    # -----------------------------------------------------

    filename = meeting.filename

    try:
        db.delete(meeting)
        db.commit()

    except Exception as error:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Could not delete meeting from database: {error}",
        )

    # -----------------------------------------------------
    # STEP 4: Delete uploaded file
    # -----------------------------------------------------

    deleted_files = []

    for file_path in matching_files:

        try:

            if file_path.exists():
                file_path.unlink()
                deleted_files.append(file_path.name)

        except Exception as error:

            # Database record is already deleted.
            # Return a warning instead of failing the
            # entire request.

            return {
                "message": "Meeting deleted from database, but uploaded file could not be deleted.",
                "meeting_id": meeting_id,
                "filename": filename,
                "deleted_files": deleted_files,
                "file_delete_error": str(error),
            }

    # -----------------------------------------------------
    # STEP 5: Success response
    # -----------------------------------------------------

    return {
        "message": "Meeting deleted successfully.",
        "meeting_id": meeting_id,
        "filename": filename,
        "deleted_files": deleted_files,
    }