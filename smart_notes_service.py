
import re
from typing import Any


# ============================================================
# SMART NOTES SERVICE
# ============================================================


def generate_smart_notes(
    transcript: str,
    key_points: list[str] | None = None,
    action_items: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    """
    Generate organized meeting notes from a transcript.

    The current version is deterministic and does not require
    an external AI API.

    Returns:
        {
            "overview": "...",
            "discussion_points": [...],
            "decisions": [...],
            "key_points": [...],
            "action_items": [...],
            "next_steps": [...]
        }
    """

    if not transcript or not transcript.strip():
        return {
            "overview": "No meeting transcript is available.",
            "discussion_points": [],
            "decisions": [],
            "key_points": [],
            "action_items": [],
            "next_steps": [],
        }

    transcript = " ".join(
        transcript.split()
    ).strip()

    sentences = _split_sentences(transcript)

    if not sentences:
        return {
            "overview": transcript,
            "discussion_points": [],
            "decisions": [],
            "key_points": key_points or [],
            "action_items": action_items or [],
            "next_steps": [],
        }

    # --------------------------------------------------------
    # KEY POINTS
    # --------------------------------------------------------

    final_key_points = _prepare_key_points(
        sentences,
        key_points,
    )

    # --------------------------------------------------------
    # DISCUSSION POINTS
    # --------------------------------------------------------

    discussion_points = _extract_discussion_points(
        sentences
    )

    # --------------------------------------------------------
    # DECISIONS
    # --------------------------------------------------------

    decisions = _extract_decisions(
        sentences
    )

    # --------------------------------------------------------
    # ACTION ITEMS
    # --------------------------------------------------------

    final_action_items = action_items or []

    # --------------------------------------------------------
    # NEXT STEPS
    # --------------------------------------------------------

    next_steps = _extract_next_steps(
        sentences,
        final_action_items,
        decisions,
    )

    # --------------------------------------------------------
    # OVERVIEW
    # --------------------------------------------------------

    overview = _build_overview(
        sentences,
        final_key_points,
        decisions,
    )

    return {
        "overview": overview,
        "discussion_points": discussion_points,
        "decisions": decisions,
        "key_points": final_key_points,
        "action_items": final_action_items,
        "next_steps": next_steps,
    }


# ============================================================
# SENTENCE SPLITTING
# ============================================================


def _split_sentences(text: str) -> list[str]:
    """
    Split transcript into clean sentences.
    """

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
# KEY POINT PREPARATION
# ============================================================


def _prepare_key_points(
    sentences: list[str],
    existing_points: list[str] | None,
) -> list[str]:
    """
    Use previously extracted key points when available.

    Otherwise create simple important points from the
    transcript.
    """

    if existing_points:

        cleaned = []

        for point in existing_points:

            if not isinstance(point, str):
                continue

            point = _clean_text(point)

            if point:
                cleaned.append(point)

        if cleaned:
            return _remove_duplicates(cleaned)[:8]

    # Fallback extraction
    candidates = []

    important_words = (
        "important",
        "decided",
        "decision",
        "agreed",
        "problem",
        "issue",
        "goal",
        "plan",
        "deadline",
        "required",
        "need",
        "next",
        "update",
        "project",
        "customer",
        "client",
        "release",
        "launch",
    )

    for sentence in sentences:

        if len(sentence.split()) < 6:
            continue

        lower = sentence.lower()

        score = 0

        for word in important_words:

            if word in lower:
                score += 1

        if re.search(
            r"\b\d+(?:\.\d+)?%?\b",
            sentence,
        ):
            score += 1

        if score > 0:
            candidates.append(
                (score, sentence)
            )

    candidates.sort(
        key=lambda item: item[0],
        reverse=True,
    )

    points = [
        _clean_text(sentence)
        for _, sentence in candidates[:8]
    ]

    return _remove_duplicates(points)


# ============================================================
# DISCUSSION POINTS
# ============================================================


def _extract_discussion_points(
    sentences: list[str],
) -> list[str]:
    """
    Extract sentences that represent meaningful discussion.
    """

    discussion_words = (
        "discuss",
        "discussion",
        "issue",
        "problem",
        "challenge",
        "concern",
        "question",
        "consider",
        "review",
        "feedback",
        "suggest",
        "proposal",
        "option",
        "alternative",
        "approach",
        "compare",
        "evaluate",
    )

    candidates = []

    for sentence in sentences:

        if len(sentence.split()) < 7:
            continue

        lower = sentence.lower()

        if any(
            word in lower
            for word in discussion_words
        ):
            candidates.append(
                _clean_text(sentence)
            )

    return _remove_duplicates(
        candidates
    )[:8]


# ============================================================
# DECISION EXTRACTION
# ============================================================


def _extract_decisions(
    sentences: list[str],
) -> list[str]:
    """
    Extract sentences containing decisions,
    agreements, approvals, or resolutions.
    """

    decision_patterns = [
        r"\bagreed\b",
        r"\bwe decided\b",
        r"\bdecided to\b",
        r"\bdecision\b",
        r"\bapproved\b",
        r"\bresolved\b",
        r"\bwill proceed\b",
        r"\bwe will\b",
        r"\blet's go with\b",
        r"\bwe are going with\b",
        r"\bthe plan is\b",
        r"\bfinal decision\b",
        r"\bconfirmed\b",
    ]

    decisions = []

    for sentence in sentences:

        lower = sentence.lower()

        if any(
            re.search(
                pattern,
                lower,
            )
            for pattern in decision_patterns
        ):
            decisions.append(
                _clean_text(sentence)
            )

    return _remove_duplicates(
        decisions
    )[:8]


# ============================================================
# NEXT STEPS
# ============================================================


def _extract_next_steps(
    sentences: list[str],
    action_items: list[dict[str, Any]],
    decisions: list[str],
) -> list[str]:
    """
    Generate concise next steps from action items and
    decision-related transcript sentences.
    """

    next_steps = []

    # --------------------------------------------------------
    # ACTION ITEMS
    # --------------------------------------------------------

    for item in action_items:

        if not isinstance(item, dict):
            continue

        task = item.get("task")

        if not task:
            continue

        task = _clean_text(
            str(task)
        )

        if task:
            next_steps.append(task)

    # --------------------------------------------------------
    # DECISION SENTENCES
    # --------------------------------------------------------

    for decision in decisions:

        if len(next_steps) >= 8:
            break

        decision_lower = decision.lower()

        if any(
            phrase in decision_lower
            for phrase in (
                "next",
                "will",
                "proceed",
                "plan",
                "follow",
                "implement",
                "complete",
                "deliver",
            )
        ):
            next_steps.append(
                decision
            )

    # --------------------------------------------------------
    # FALLBACK
    # --------------------------------------------------------

    if not next_steps:

        next_words = (
            "next",
            "follow up",
            "follow-up",
            "will",
            "need to",
            "needs to",
            "should",
            "deadline",
        )

        for sentence in sentences:

            lower = sentence.lower()

            if any(
                word in lower
                for word in next_words
            ):
                next_steps.append(
                    _clean_text(sentence)
                )

            if len(next_steps) >= 5:
                break

    return _remove_duplicates(
        next_steps
    )[:8]


# ============================================================
# OVERVIEW
# ============================================================


def _build_overview(
    sentences: list[str],
    key_points: list[str],
    decisions: list[str],
) -> str:
    """
    Build a short readable overview.
    """

    parts = []

    # Prefer important extracted points.
    for point in key_points[:3]:

        if point:
            parts.append(
                point.rstrip(".!?") + "."
            )

    # Add a decision if available.
    if decisions:

        decision = decisions[0]

        if decision not in parts:
            parts.append(
                decision.rstrip(".!?") + "."
            )

    # Fallback to transcript.
    if not parts:

        words = " ".join(
            sentences
        ).split()

        if len(words) <= 80:
            return " ".join(words)

        return (
            " ".join(words[:80])
            .rstrip(".,!?")
            + "..."
        )

    return " ".join(parts)


# ============================================================
# TEXT CLEANING
# ============================================================


def _clean_text(text: str) -> str:
    """
    Clean unnecessary whitespace.
    """

    return re.sub(
        r"\s+",
        " ",
        text,
    ).strip()


# ============================================================
# DUPLICATE REMOVAL
# ============================================================


def _remove_duplicates(
    items: list[str],
) -> list[str]:
    """
    Remove exact and highly similar duplicate items.
    """

    result = []

    for item in items:

        item = _clean_text(item)

        if not item:
            continue

        duplicate = False

        for existing in result:

            if item.lower() == existing.lower():
                duplicate = True
                break

            first_words = set(
                re.findall(
                    r"\b[a-zA-Z0-9]+\b",
                    item.lower(),
                )
            )

            second_words = set(
                re.findall(
                    r"\b[a-zA-Z0-9]+\b",
                    existing.lower(),
                )
            )

            if not first_words or not second_words:
                continue

            overlap = (
                len(
                    first_words.intersection(
                        second_words
                    )
                )
                / min(
                    len(first_words),
                    len(second_words),
                )
            )

            if overlap >= 0.80:
                duplicate = True
                break

        if not duplicate:
            result.append(item)

    return result
