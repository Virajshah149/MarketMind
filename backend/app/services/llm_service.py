import json

from google import genai
from google.genai.errors import ClientError

from app.core.config import settings
from app.schemas.news_analysis import BatchNewsAnalysis, NewsAnalysis


client = genai.Client(
    api_key=settings.gemini_api_key
)


def mock_analyze_news(article: dict) -> NewsAnalysis:
    """
    Simple fallback when Gemini is unavailable.

    This is NOT AI reasoning.
    It only creates a safe placeholder analysis so that
    the rest of the supply-chain pipeline can be tested.
    """

    companies_text = article.get("companies", "")

    company_id = None

    if companies_text:
        first_line = companies_text.splitlines()[0]

        if "|" in first_line:
            company_id = first_line.split("|")[0].strip()

    title = article["title"].lower()

    if any(
        word in title
        for word in [
            "deal",
            "pact",
            "agreement",
            "contract",
            "project",
            "expansion",
        ]
    ):
        event_type = "business_development"
    elif any(
        word in title
        for word in [
            "award",
            "honoured",
            "honored",
            "recognition",
        ]
    ):
        event_type = "award_recognition"
    else:
        event_type = "company_event"

    return NewsAnalysis(
        news_id=article["news_id"],
        company_id=company_id,
        event_type=event_type,
        sentiment="neutral",
        severity=0.3,
        confidence=0.3,
        summary="Fallback analysis used because Gemini was unavailable.",
    )


def analyze_news_batch(
    articles: list[dict],
) -> BatchNewsAnalysis:
    """
    Try Gemini first.

    If Gemini fails for any reason, automatically use
    the mock fallback so the rest of the pipeline can continue.
    """

    if not articles:
        return BatchNewsAnalysis(
            analyses=[]
        )

    article_blocks = []

    for article in articles:
        article_blocks.append(
            f"""
NEWS ID: {article["news_id"]}

TITLE:
{article["title"]}

CONTENT:
{article["content"]}

POSSIBLE COMPANIES:
{article["companies"]}
"""
        )

    prompt = f"""
Classify these financial news articles.

For each article return:
- news_id
- company_id: directly affected supported company, else null
- event_type
- sentiment: positive, negative, or neutral
- severity: 0-1
- confidence: 0-1
- summary: one short sentence
- relationship_change: none, create, strengthen, weaken, or remove
- related_company_id: other supported company, else null
- relationship_type: supplier, customer, partner, contract, etc., else null
- relationship_change_strength: 0-1

Rules:
- Use only information in the article.
- Do not invent companies or relationships.
- Do not calculate supply-chain impact.
- Do not predict stock prices.
- "create" = new business relationship.
- "strengthen" = existing relationship becomes stronger.
- "weaken" = existing relationship becomes weaker.
- "remove" = relationship explicitly ends.
- Use "none" when no relationship changes.
- For market commentary with no real company event:
  company_id=null, event_type="market_commentary",
  sentiment="neutral", severity=0, relationship_change="none".

ARTICLES:
{"".join(article_blocks)}
"""

    try:
        response = client.models.generate_content(
            model=settings.gemini_model,
            contents=prompt,
            config={
                "response_mime_type": "application/json",
                "response_schema": BatchNewsAnalysis,
            },
        )

        if not response.text:
            raise RuntimeError(
                "Gemini returned an empty response."
            )

        data = json.loads(response.text)

        return BatchNewsAnalysis.model_validate(data)

    except Exception as error:
        print(
            f"Gemini unavailable. Using mock fallback. "
            f"Reason: {error}"
        )

        return BatchNewsAnalysis(
            analyses=[
                mock_analyze_news(article)
                for article in articles
            ]
        )


def analyze_news(
    news_title: str,
    news_content: str,
    companies: list[dict],
):
    """
    Analyze one article using the batch pipeline.
    """

    article = {
        "news_id": 0,
        "title": news_title,
        "content": news_content,
        "companies": "\n".join(
            (
                f"{company['company_id']} | "
                f"{company['company_name']} | "
                f"{company['ticker']}"
            )
            for company in companies
        ),
    }

    result = analyze_news_batch(
        [article]
    )

    if not result.analyses:
        raise RuntimeError(
            "No analysis returned."
        )

    return result.analyses[0]