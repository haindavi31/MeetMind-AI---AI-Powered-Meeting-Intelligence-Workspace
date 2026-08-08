import re


# ============================================================
# IMPORTANCE PATTERNS
# ============================================================

HIGH_IMPORTANCE_PATTERNS = [
    r"\bagreed\b",
    r"\bdecided\b",
    r"\bdecision\b",
    r"\bapproved\b",
    r"\bresolved\b",
    r"\baction\b",
    r"\bdeadline\b",
    r"\bdue\b",
    r"\bmust\b",
    r"\brequired\b",
    r"\bnext step\b",
    r"\bnext steps\b",
    r"\bwe will\b",
    r"\bwe need to\b",
    r"\bwe have to\b",
    r"\bshould\b",
    r"\bconfirmed\b",
    r"\bcommit\b",
    r"\bcommitted\b",
]

MEDIUM_IMPORTANCE_PATTERNS = [
    r"\bdiscussed\b",
    r"\bdiscussion\b",
    r"\bproblem\b",
    r"\bissue\b",
    r"\bconcern\b",
    r"\brecommend\b",
    r"\brecommended\b",
    r"\bsuggest\b",
    r"\bsuggested\b",
    r"\bplan\b",
    r"\bplanned\b",
    r"\bproposal\b",
    r"\bproposed\b",
    r"\bgoal\b",
    r"\btarget\b",
    r"\bupdate\b",
    r"\bimportant\b",
    r"\bchange\b",
    r"\bincrease\b",
    r"\bdecrease\b",
    r"\bimprove\b",
    r"\bimproved\b",
    r"\bfeature\b",
    r"\bproject\b",
    r"\bcustomer\b",
    r"\bteam\b",
]

# ============================================================
# FILLER PATTERNS
# ============================================================

FILLER_PATTERNS = [
    r"^welcome\b",
    r"^hello\b",
    r"^hi\b",
    r"^thanks?\b",
    r"^thank you\b",
    r"^good morning\b",
    r"^good afternoon\b",
    r"^good evening\b",
    r"^in this recording\b",
    r"^in this video\b",
    r"^today we will\b",
    r"^today we're\b",
    r"^let us begin\b",
    r"^let's begin\b",
    r"^let us move on\b",
    r"^let's move on\b",
    r"^as you can see\b",
    r"^this recording\b",
    r"^this video\b",
    r"^cool\b",
    r"^okay\b",
    r"^yeah\b",
    r"^yep\b",
]

# ============================================================
# WEAK / CONVERSATIONAL PATTERNS
# ============================================================

WEAK_PATTERNS = [
    r"^i think\b",
    r"^i guess\b",
    r"^i don't know\b",
    r"^i'm not sure\b",
    r"^maybe\b",
    r"^perhaps\b",
    r"^what do you think\b",
    r"^do you think\b",
    r"^could we\b",
    r"^should we\b",
    r"^would it\b",
    r"^can i\b",
    r"^are we\b",
    r"^is that\b",
    r"^does that\b",
]

# ============================================================
# SENTENCE SPLITTING
# ============================================================

def _split_sentences(text: str) -> list[str]:
    """
    Split transcript into readable sentences.
    """

    if not text:
        return []

    text = re.sub(r"\s+", " ", text.strip())

    sentences = re.split(
        r"(?<=[.!?])\s+",
        text,
    )

    return [
        sentence.strip()
        for sentence in sentences
        if sentence.strip()
    ]


# ============================================================
# FILLER CHECK
# ============================================================

def _is_filler(sentence: str) -> bool:
    """
    Detect obvious conversational filler.
    """

    normalized = sentence.lower().strip()

    return any(
        re.search(pattern, normalized)
        for pattern in FILLER_PATTERNS
    )


# ============================================================
# WEAK SENTENCE CHECK
# ============================================================

def _is_weak(sentence: str) -> bool:
    """
    Detect speculative or conversational sentences.
    """

    normalized = sentence.lower().strip()

    if sentence.endswith("?"):
        return True

    return any(
        re.search(pattern, normalized)
        for pattern in WEAK_PATTERNS
    )


# ============================================================
# SCORE SENTENCE
# ============================================================

def _score_sentence(sentence: str) -> int:
    """
    Calculate importance score.
    """

    normalized = sentence.lower()
    score = 0

    # --------------------------------------------------------
    # High importance
    # --------------------------------------------------------

    for pattern in HIGH_IMPORTANCE_PATTERNS:
        if re.search(pattern, normalized):
            score += 5

    # --------------------------------------------------------
    # Medium importance
    # --------------------------------------------------------

    for pattern in MEDIUM_IMPORTANCE_PATTERNS:
        if re.search(pattern, normalized):
            score += 2

    # --------------------------------------------------------
    # Numbers
    # --------------------------------------------------------

    if re.search(r"\b\d+(?:\.\d+)?\b", sentence):
        score += 2

    # --------------------------------------------------------
    # Percentage
    # --------------------------------------------------------

    if re.search(r"\b\d+(?:\.\d+)?\s*%", sentence):
        score += 2

    # --------------------------------------------------------
    # Dates
    # --------------------------------------------------------

    if re.search(
        r"\b(?:monday|tuesday|wednesday|thursday|"
        r"friday|saturday|sunday)\b",
        normalized,
    ):
        score += 2

    # --------------------------------------------------------
    # Deadline expressions
    # --------------------------------------------------------

    if re.search(
        r"\b(?:by|before|due|within)\b",
        normalized,
    ):
        score += 2

    # --------------------------------------------------------
    # Reasonable sentence length
    # --------------------------------------------------------

    word_count = len(sentence.split())

    if 10 <= word_count <= 40:
        score += 1

    # --------------------------------------------------------
    # Penalize transcript artifacts
    # --------------------------------------------------------

    if word_count > 60:
        score -= 3

    if word_count > 90:
        score -= 5

    return score


# ============================================================
# CLEAN SENTENCE
# ============================================================

def _clean_sentence(sentence: str) -> str:
    """
    Clean sentence formatting.
    """

    sentence = re.sub(
        r"\s+",
        " ",
        sentence,
    ).strip()

    sentence = sentence.replace(
        " .",
        ".",
    )

    if sentence and sentence[-1] not in ".!?":
        sentence += "."

    return sentence


# ============================================================
# SIMILARITY CHECK
# ============================================================

def _is_similar(first: str, second: str) -> bool:
    """
    Detect duplicate or highly similar points.
    """

    first_words = set(
        re.findall(
            r"\b[a-zA-Z0-9]+\b",
            first.lower(),
        )
    )

    second_words = set(
        re.findall(
            r"\b[a-zA-Z0-9]+\b",
            second.lower(),
        )
    )

    if not first_words or not second_words:
        return False

    intersection = first_words & second_words

    smaller = min(
        len(first_words),
        len(second_words),
    )

    similarity = len(intersection) / smaller

    return similarity >= 0.75


# ============================================================
# EXTRACT KEY POINTS
# ============================================================

def extract_key_points(text: str) -> list[str]:
    """
    Extract important points from a meeting transcript.

    Returns up to 8 meaningful key points.
    """

    if not text or not text.strip():
        return []

    # --------------------------------------------------------
    # Normalize transcript
    # --------------------------------------------------------

    text = re.sub(
        r"\s+",
        " ",
        text.strip(),
    )

    sentences = _split_sentences(text)

    if not sentences:
        return []

    scored = []

    # --------------------------------------------------------
    # Score sentences
    # --------------------------------------------------------

    for index, sentence in enumerate(sentences):

        word_count = len(sentence.split())

        # Ignore extremely short sentences
        if word_count < 8:
            continue

        # Ignore extremely long transcription artifacts
        if word_count > 90:
            continue

        # Ignore filler
        if _is_filler(sentence):
            continue

        # Ignore questions/speculation
        if _is_weak(sentence):
            continue

        score = _score_sentence(sentence)

        # Only keep meaningful sentences
        if score < 2:
            continue

        scored.append(
            {
                "score": score,
                "index": index,
                "sentence": sentence,
            }
        )

    # --------------------------------------------------------
    # Fallback
    # --------------------------------------------------------

    if not scored:

        fallback = []

        for sentence in sentences:

            if len(sentence.split()) < 10:
                continue

            if _is_filler(sentence):
                continue

            if _is_weak(sentence):
                continue

            fallback.append(
                _clean_sentence(sentence)
            )

            if len(fallback) >= 5:
                break

        return fallback

    # --------------------------------------------------------
    # Sort by importance
    # --------------------------------------------------------

    scored.sort(
        key=lambda item: (
            item["score"],
            -item["index"],
        ),
        reverse=True,
    )

    # --------------------------------------------------------
    # Select unique points
    # --------------------------------------------------------

    selected = []

    for item in scored:

        cleaned = _clean_sentence(
            item["sentence"]
        )

        duplicate = False

        for existing in selected:

            if _is_similar(
                existing,
                cleaned,
            ):
                duplicate = True
                break

        if duplicate:
            continue

        selected.append(cleaned)

        if len(selected) >= 8:
            break

    # --------------------------------------------------------
    # Restore original transcript order
    # --------------------------------------------------------

    selected_normalized = {
        point.lower()
        for point in selected
    }

    ordered = []

    for sentence in sentences:

        cleaned = _clean_sentence(sentence)

        if cleaned.lower() in selected_normalized:
            ordered.append(cleaned)

    return ordered[:8]