
import re
from typing import List, Dict


# ============================================================
# ACTION VERBS
# ============================================================

ACTION_VERBS = (
    "prepare",
    "send",
    "create",
    "complete",
    "finish",
    "review",
    "update",
    "check",
    "call",
    "contact",
    "schedule",
    "submit",
    "upload",
    "download",
    "share",
    "write",
    "build",
    "test",
    "implement",
    "deploy",
    "fix",
    "meet",
    "organize",
    "collect",
    "analyze",
    "verify",
    "confirm",
    "present",
    "provide",
    "deliver",
    "design",
    "develop",
    "document",
    "draft",
    "refine",
    "investigate",
    "resolve",
    "address",
    "monitor",
    "track",
    "assign",
    "allocate",
    "communicate",
    "notify",
    "brief",
    "recheck",
    "patch",
    "retest",
    "add",
    "remove",
    "replace",
    "select",
    "choose",
    "pick",
    "include",
    "compare",
    "finalize",
    "validate",
)


# ============================================================
# DISCUSSION / SPECULATION PHRASES
# ============================================================

DISCUSSION_PHRASES = (
    "let's discuss",
    "let us discuss",
    "we should discuss",
    "i think we should",
    "we could",
    "could we",
    "should we",
    "what do you think",
    "any suggestions",
    "i suggest",
    "perhaps we could",
    "maybe we could",
    "i would say",
    "i'd say",
    "it would be good",
    "would be good",
    "might be",
    "could be",
    "i don't know",
    "i'm not sure",
    "not sure",
)


# ============================================================
# WEAK ACTION PHRASES
# These often look like actions but are not actual tasks.
# ============================================================

WEAK_ACTION_PHRASES = (
    "i'll share one thing",
    "i will share one thing",
    "i'll say",
    "i will say",
    "i'll mention",
    "i will mention",
    "i'll show",
    "i will show",
    "i'll tell",
    "i will tell",
    "let's see",
    "let us see",
    "i'll go through",
    "i will go through",
)


# ============================================================
# DEADLINE PATTERNS
# ============================================================

DEADLINE_PATTERNS = [
    r"\bby\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b",
    r"\bby\s+(tomorrow|today|tonight|next week|next month)\b",
    r"\bbefore\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b",
    r"\bbefore\s+(tomorrow|today|tonight|next week|next month)\b",
    r"\bwithin\s+\d+\s+(day|days|week|weeks|month|months)\b",
    r"\bin\s+\d+\s+(day|days|week|weeks|month|months)\b",
    r"\bdue\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b",
    r"\bdue\s+(tomorrow|today|tonight|next week|next month)\b",
    r"\bdue\s+in\s+\d+\s+(day|days|week|weeks|month|months)\b",
    r"\bby\s+\d{1,2}(?:st|nd|rd|th)?\b",
]


# ============================================================
# SENTENCE SPLITTING
# ============================================================

def _split_sentences(text: str) -> List[str]:
    """
    Split transcript into reasonably sized sentences.
    """

    if not text:
        return []

    text = re.sub(
        r"\s+",
        " ",
        text.strip(),
    )

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
# DEADLINE EXTRACTION
# ============================================================

def _extract_deadline(sentence: str) -> str:
    """
    Extract a simple deadline from a sentence.
    """

    for pattern in DEADLINE_PATTERNS:

        match = re.search(
            pattern,
            sentence,
            re.IGNORECASE,
        )

        if match:
            return match.group(0).strip()

    return "Not specified"


# ============================================================
# OWNER EXTRACTION
# ============================================================

def _extract_owner(sentence: str) -> str:
    """
    Try to identify the person responsible for an action.
    """

    # --------------------------------------------------------
    # Assigned to John
    # --------------------------------------------------------

    match = re.search(
        r"\bassigned\s+to\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b",
        sentence,
        re.IGNORECASE,
    )

    if match:
        return match.group(1).strip()

    # --------------------------------------------------------
    # John is responsible for...
    # --------------------------------------------------------

    match = re.search(
        r"\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)"
        r"\s+is\s+responsible\s+for\b",
        sentence,
        re.IGNORECASE,
    )

    if match:
        return match.group(1).strip()

    # --------------------------------------------------------
    # John will...
    # John should...
    # John must...
    # John needs to...
    # John has to...
    # --------------------------------------------------------

    match = re.search(
        r"\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)"
        r"\s+(?:will|should|must|needs\s+to|has\s+to)\b",
        sentence,
    )

    if match:
        return match.group(1).strip()

    # --------------------------------------------------------
    # John, please...
    # --------------------------------------------------------

    match = re.search(
        r"^\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)"
        r",?\s+please\b",
        sentence,
    )

    if match:
        return match.group(1).strip()

    # --------------------------------------------------------
    # I'll...
    # --------------------------------------------------------

    if re.search(
        r"\bI['’]ll\b",
        sentence,
        re.IGNORECASE,
    ):
        return "Me"

    # --------------------------------------------------------
    # I will...
    # --------------------------------------------------------

    if re.search(
        r"\bI\s+will\b",
        sentence,
        re.IGNORECASE,
    ):
        return "Me"

    # --------------------------------------------------------
    # I need to...
    # --------------------------------------------------------

    if re.search(
        r"\bI\s+need\s+to\b",
        sentence,
        re.IGNORECASE,
    ):
        return "Me"

    # --------------------------------------------------------
    # I have to...
    # --------------------------------------------------------

    if re.search(
        r"\bI\s+have\s+to\b",
        sentence,
        re.IGNORECASE,
    ):
        return "Me"

    return "Not specified"


# ============================================================
# ACTION VERB REGEX
# ============================================================

_ESCAPED_ACTION_VERBS = "|".join(
    re.escape(verb)
    for verb in ACTION_VERBS
)


# ============================================================
# ACTION DETECTION
# ============================================================

def _contains_action(sentence: str) -> bool:
    """
    Detect strong, explicit action language.
    """

    normalized = sentence.lower().strip()

    # --------------------------------------------------------
    # Reject discussion/speculation.
    # --------------------------------------------------------

    if any(
        phrase in normalized
        for phrase in DISCUSSION_PHRASES
    ):
        return False

    # --------------------------------------------------------
    # Reject weak conversational actions.
    # --------------------------------------------------------

    if any(
        phrase in normalized
        for phrase in WEAK_ACTION_PHRASES
    ):
        return False

    patterns = [

        # ----------------------------------------------------
        # I will / I'll
        # ----------------------------------------------------

        rf"\bI['’]ll\s+(?:{_ESCAPED_ACTION_VERBS})\b",

        rf"\bI\s+will\s+(?:{_ESCAPED_ACTION_VERBS})\b",

        # ----------------------------------------------------
        # I need to / I have to
        # ----------------------------------------------------

        rf"\bI\s+need\s+to\s+(?:{_ESCAPED_ACTION_VERBS})\b",

        rf"\bI\s+have\s+to\s+(?:{_ESCAPED_ACTION_VERBS})\b",

        # ----------------------------------------------------
        # We will / We need to / We have to
        # ----------------------------------------------------

        rf"\bWe\s+will\s+(?:{_ESCAPED_ACTION_VERBS})\b",

        rf"\bWe\s+need\s+to\s+(?:{_ESCAPED_ACTION_VERBS})\b",

        rf"\bWe\s+have\s+to\s+(?:{_ESCAPED_ACTION_VERBS})\b",

        # ----------------------------------------------------
        # Let's
        # ----------------------------------------------------

        rf"\bLet['’]s\s+(?:{_ESCAPED_ACTION_VERBS})\b",

        # ----------------------------------------------------
        # Please
        # ----------------------------------------------------

        rf"\bPlease\s+(?:{_ESCAPED_ACTION_VERBS})\b",

        # ----------------------------------------------------
        # Named person
        # ----------------------------------------------------

        rf"\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?"
        rf"\s+will\s+(?:{_ESCAPED_ACTION_VERBS})\b",

        rf"\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?"
        rf"\s+should\s+(?:{_ESCAPED_ACTION_VERBS})\b",

        rf"\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?"
        rf"\s+must\s+(?:{_ESCAPED_ACTION_VERBS})\b",

        rf"\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?"
        rf"\s+needs\s+to\s+(?:{_ESCAPED_ACTION_VERBS})\b",

        rf"\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?"
        rf"\s+has\s+to\s+(?:{_ESCAPED_ACTION_VERBS})\b",

        # ----------------------------------------------------
        # Explicit assignment
        # ----------------------------------------------------

        r"\bassigned\s+to\s+[A-Z][a-z]+\b",

        # ----------------------------------------------------
        # Explicit action item
        # ----------------------------------------------------

        r"\baction\s+item\b",
        r"\baction\s+items\b",

        # ----------------------------------------------------
        # Explicit follow-up
        # ----------------------------------------------------

        r"\bfollow[- ]?up\b",

        # ----------------------------------------------------
        # Explicit task
        # ----------------------------------------------------

        r"\bthe\s+task\s+is\s+to\b",
        r"\btask\s+is\s+to\b",
    ]

    return any(
        re.search(
            pattern,
            sentence,
            re.IGNORECASE,
        )
        for pattern in patterns
    )


# ============================================================
# TASK QUALITY CHECK
# ============================================================

def _is_meaningful_task(sentence: str) -> bool:
    """
    Additional quality filter.
    """

    normalized = sentence.lower().strip()

    # --------------------------------------------------------
    # Questions are not action items.
    # --------------------------------------------------------

    if sentence.endswith("?"):
        return False

    # --------------------------------------------------------
    # Reject weak conversational starters.
    # --------------------------------------------------------

    weak_starters = (
        "i think",
        "i don't think",
        "maybe",
        "perhaps",
        "could we",
        "should we",
        "what if",
        "do we",
        "would it",
        "what do you think",
        "i guess",
        "i'm not sure",
    )

    if normalized.startswith(weak_starters):
        return False

    # --------------------------------------------------------
    # Reject weak conversational statements.
    # --------------------------------------------------------

    if any(
        phrase in normalized
        for phrase in WEAK_ACTION_PHRASES
    ):
        return False

    # --------------------------------------------------------
    # Require reasonable length.
    # --------------------------------------------------------

    word_count = len(sentence.split())

    if word_count < 5:
        return False

    # --------------------------------------------------------
    # Avoid huge transcript fragments.
    # --------------------------------------------------------

    if word_count > 60:
        return False

    return True


# ============================================================
# TASK CLEANING
# ============================================================

def _clean_task(sentence: str) -> str:
    """
    Clean unnecessary whitespace.
    """

    task = re.sub(
        r"\s+",
        " ",
        sentence,
    ).strip()

    return task


# ============================================================
# NORMALIZE TASK
# ============================================================

def _normalize_task(task: str) -> str:
    """
    Normalize task for duplicate detection.
    """

    normalized = task.lower()

    normalized = re.sub(
        r"[^\w\s]",
        "",
        normalized,
    )

    normalized = re.sub(
        r"\s+",
        " ",
        normalized,
    )

    return normalized.strip()


# ============================================================
# MAIN ACTION ITEM EXTRACTION
# ============================================================

def extract_action_items(
    text: str,
) -> List[Dict[str, str]]:
    """
    Extract high-confidence action items from a transcript.

    Returns:

        [
            {
                "task": "...",
                "owner": "...",
                "deadline": "...",
                "status": "Pending"
            }
        ]

    The extractor intentionally favors precision over recall.
    """

    if not text or not text.strip():
        return []

    sentences = _split_sentences(text)

    action_items: List[Dict[str, str]] = []

    seen_tasks: set[str] = set()

    for sentence in sentences:

        sentence = sentence.strip()

        if not sentence:
            continue

        # ----------------------------------------------------
        # Basic length checks
        # ----------------------------------------------------

        word_count = len(sentence.split())

        if word_count < 5:
            continue

        if word_count > 60:
            continue

        # ----------------------------------------------------
        # Action detection
        # ----------------------------------------------------

        if not _contains_action(sentence):
            continue

        # ----------------------------------------------------
        # Quality check
        # ----------------------------------------------------

        if not _is_meaningful_task(sentence):
            continue

        # ----------------------------------------------------
        # Clean task
        # ----------------------------------------------------

        task = _clean_task(sentence)

        # ----------------------------------------------------
        # Duplicate detection
        # ----------------------------------------------------

        normalized_task = _normalize_task(task)

        if not normalized_task:
            continue

        if normalized_task in seen_tasks:
            continue

        seen_tasks.add(normalized_task)

        # ----------------------------------------------------
        # Extract metadata
        # ----------------------------------------------------

        owner = _extract_owner(sentence)

        deadline = _extract_deadline(sentence)

        # ----------------------------------------------------
        # Add action item
        # ----------------------------------------------------

        action_items.append(
            {
                "task": task,
                "owner": owner,
                "deadline": deadline,
                "status": "Pending",
            }
        )

    # --------------------------------------------------------
    # Keep dashboard manageable
    # --------------------------------------------------------

    return action_items[:10]
