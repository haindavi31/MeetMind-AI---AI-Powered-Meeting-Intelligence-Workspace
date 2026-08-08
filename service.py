from typing import Any


def answer_meeting_question(
    transcript: str,
    question: str,
) -> dict[str, Any]:
    """
    Answer a question using only the provided meeting transcript.

    This is the initial deterministic version.
    An LLM can be connected later without changing
    the router interface.
    """

    if not transcript or not transcript.strip():
        return {
            "answer": "No meeting transcript is available.",
            "sources": [],
        }

    if not question or not question.strip():
        return {
            "answer": "Please enter a question.",
            "sources": [],
        }

    transcript = " ".join(transcript.split()).strip()
    question = " ".join(question.split()).strip()

    question_words = {
        word.lower().strip(".,!?")
        for word in question.split()
        if len(word) > 2
    }

    sentences = [
        sentence.strip()
        for sentence in transcript.replace("?", ".")
        .replace("!", ".")
        .split(".")
        if sentence.strip()
    ]

    matches = []

    for sentence in sentences:
        sentence_words = {
            word.lower().strip(".,!?")
            for word in sentence.split()
            if len(word) > 2
        }

        overlap = len(
            question_words.intersection(sentence_words)
        )

        if overlap > 0:
            matches.append(
                (overlap, sentence)
            )

    matches.sort(
        key=lambda item: item[0],
        reverse=True,
    )

    selected = [
        sentence
        for _, sentence in matches[:3]
    ]

    if not selected:
        return {
            "answer": (
                "I couldn't find relevant information "
                "in this meeting."
            ),
            "sources": [],
        }

    answer = " ".join(selected)

    return {
        "answer": answer,
        "sources": selected,
    }