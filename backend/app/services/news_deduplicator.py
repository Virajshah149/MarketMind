import re
from difflib import SequenceMatcher

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.news import News


def normalize_title(title: str) -> str:
    """
    Normalize a news title so small formatting differences
    do not create separate stories.
    """

    text = title.lower()

    # Remove punctuation
    text = re.sub(r"[^a-z0-9\s]", " ", text)

    # Remove common news-site filler words
    stop_words = {
        "the",
        "a",
        "an",
        "and",
        "or",
        "of",
        "to",
        "in",
        "on",
        "for",
        "with",
        "as",
        "at",
        "by",
        "from",
        "is",
        "are",
        "was",
        "were",
    }

    words = text.split()

    filtered_words = [
        word for word in words
        if word not in stop_words
    ]

    return " ".join(filtered_words)


def title_similarity(title_a: str, title_b: str) -> float:
    """
    Return similarity between two normalized titles.
    1.0 = identical
    0.0 = completely different
    """

    normalized_a = normalize_title(title_a)
    normalized_b = normalize_title(title_b)

    if not normalized_a or not normalized_b:
        return 0.0

    return SequenceMatcher(
        None,
        normalized_a,
        normalized_b,
    ).ratio()


def is_exact_url_duplicate(
    db: Session,
    source_url: str | None,
) -> bool:
    """
    Check whether the exact article URL already exists.
    """

    if not source_url:
        return False

    statement = select(News.id).where(
        News.source_url == source_url
    )

    existing_id = db.scalar(statement)

    return existing_id is not None


def is_similar_title_duplicate(
    db: Session,
    title: str,
    threshold: float = 0.88,
) -> bool:
    """
    Check whether a sufficiently similar title already exists.

    A threshold of 0.88 is intentionally conservative.
    """

    statement = select(News.title)

    existing_titles = db.scalars(statement).all()

    for existing_title in existing_titles:
        similarity = title_similarity(
            title,
            existing_title,
        )

        if similarity >= threshold:
            return True

    return False


def is_duplicate_news(
    db: Session,
    title: str,
    source_url: str | None = None,
    threshold: float = 0.88,
) -> dict:
    """
    Run all cheap duplicate checks.

    Returns information about why an article was considered
    a duplicate.
    """

    if is_exact_url_duplicate(
        db=db,
        source_url=source_url,
    ):
        return {
            "is_duplicate": True,
            "duplicate_type": "exact_url",
        }

    if is_similar_title_duplicate(
        db=db,
        title=title,
        threshold=threshold,
    ):
        return {
            "is_duplicate": True,
            "duplicate_type": "similar_title",
        }

    return {
        "is_duplicate": False,
        "duplicate_type": None,
    }