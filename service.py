import whisper


# Load Whisper model once when the backend starts.
# "base" gives a good balance between speed and accuracy.
model = whisper.load_model("base")


def transcribe_audio(file_path: str) -> dict:
    """
    Transcribe an audio/video file using Whisper.
    """

    result = model.transcribe(
        file_path,
        fp16=False,
    )

    return {
        "text": result["text"].strip(),
        "language": result.get("language"),
    }