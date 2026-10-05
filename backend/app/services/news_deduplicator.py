import re
from difflib import SequenceMatcher

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.news import News


# Words that carry little meaning when comparing news stories.
STOP_WORDS = {
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
    "this",
    "that",
    "these",
    "those",
    "gets",
    "get",
    "new",
    "latest",
    "news",
}


def normalize_title(title: str) -> str:
    """
    Normalize a news title for similarity comparison.
    """

    text = title.lower()

    # Remove punctuation.
    text = re.sub(r"[^a-z0-9\s]", " ", text)

    # Normalize whitespace.
    text = re.sub(r"\s+", " ", text).strip()

    words = text.split()

    filtered_words = [
        word
        for word in words
        if word not in STOP_WORDS
    ]

    return " ".join(filtered_words)


def title_similarity(title_a: str, title_b: str) -> float:
    """
    Compare two normalized titles using sequence similarity.
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


def keyword_set(text: str) -> set[str]:
    """
    Convert text into meaningful keywords.
    """

    normalized = normalize_title(text)

    return {
        word
        for word in normalized.split()
        if len(word) >= 3
    }


def keyword_overlap(text_a: str, text_b: str) -> float:
    """
    Calculate Jaccard-style keyword overlap.

    Example:

    A = {tata, steel, dutch, deal}
    B = {tata, steel, dutch, pact}

    overlap = 3 / 5 = 0.60
    """

    keywords_a = keyword_set(text_a)
    keywords_b = keyword_set(text_b)

    if not keywords_a or not keywords_b:
        return 0.0

    intersection = keywords_a.intersection(keywords_b)
    union = keywords_a.union(keywords_b)

    return len(intersection) / len(union)


def same_company_topic(title_a: str, title_b: str) -> bool:
    """
    Detect whether two headlines appear to concern
    the same company and major topic.

    This is intentionally conservative.
    """

    text_a = normalize_title(title_a)
    text_b = normalize_title(title_b)

    company_keywords = {
        "tata",
        "reliance",
        "infosys",
        "tcs",
        "hdfc",
        "icici",
        "axis",
        "bajaj",
        "maruti",
        "mahindra",
        "hindalco",
        "jsw",
        "ntpc",
        "itc",
        "ultratech",
        "larsen",
        "titan",
    }

    topic_keywords = {
        "deal",
        "pact",
        "agreement",
        "contract",
        "plant",
        "project",
        "expansion",
        "acquisition",
        "merger",
        "shutdown",
        "production",
        "supply",
        "supplier",
        "shortage",
        "regulatory",
        "environmental",
        "steel",
        "green",
        "coal",
        "capacity",
    }

    companies_a = {
        word
        for word in text_a.split()
        if word in company_keywords
    }

    companies_b = {
        word
        for word in text_b.split()
        if word in company_keywords
    }

    topics_a = {
        word
        for word in text_a.split()
        if word in topic_keywords
    }

    topics_b = {
        word
        for word in text_b.split()
        if word in topic_keywords
    }

    same_company = bool(companies_a.intersection(companies_b))
    same_topic = bool(topics_a.intersection(topics_b))

    return same_company and same_topic


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
    Check whether a very similar headline already exists.
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


def is_same_story_duplicate(
    db: Session,
    title: str,
    threshold: float = 0.45,
) -> bool:
    """
    Detect different headlines describing the same underlying story.

    This catches cases such as:

    "Tata Steel gets more time on Dutch deal..."

    and

    "Tata Steel extends Dutch green steel pact..."

    where exact title similarity may be too low.
    """

    statement = select(
        News.title,
        News.content,
    )

    existing_articles = db.execute(statement).all()

    for existing_title, existing_content in existing_articles:

        # First check whether the company/topic combination
        # strongly suggests the same story.
        if same_company_topic(
            title,
            existing_title,
        ):
            overlap = keyword_overlap(
                title,
                existing_title,
            )

            if overlap >= threshold:
                return True

        # More general keyword overlap check.
        overlap = keyword_overlap(
            title,
            existing_title,
        )

        if overlap >= 0.70:
            return True

    return False


def is_duplicate_news(
    db: Session,
    title: str,
    source_url: str | None = None,
    threshold: float = 0.88,
) -> dict:
    """
    Complete duplicate detection pipeline.

    Order:

    1. Exact URL
    2. Very similar headline
    3. Same underlying story
    """

    # ---------------------------------------------------------
    # LEVEL 1: Exact URL
    # ---------------------------------------------------------

    if is_exact_url_duplicate(
        db=db,
        source_url=source_url,
    ):
        return {
            "is_duplicate": True,
            "duplicate_type": "exact_url",
        }

    # ---------------------------------------------------------
    # LEVEL 2: Similar title
    # ---------------------------------------------------------

    if is_similar_title_duplicate(
        db=db,
        title=title,
        threshold=threshold,
    ):
        return {
            "is_duplicate": True,
            "duplicate_type": "similar_title",
        }

    # ---------------------------------------------------------
    # LEVEL 3: Same underlying story
    # ---------------------------------------------------------

    if is_same_story_duplicate(
        db=db,
        title=title,
    ):
        return {
            "is_duplicate": True,
            "duplicate_type": "same_story",
        }

    # ---------------------------------------------------------
    # Not a duplicate
    # ---------------------------------------------------------

    return {
        "is_duplicate": False,
        "duplicate_type": None,
    }