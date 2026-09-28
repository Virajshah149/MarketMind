import json

from google import genai

from app.core.config import settings
from app.schemas.news_analysis import (
    BatchNewsAnalysis,
)


client = genai.Client(
    api_key=settings.gemini_api_key
)


def analyze_news_batch(
    articles: list[dict],
) -> BatchNewsAnalysis:

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
You are a financial news classification system.

Analyze the following news articles.

Your job is ONLY to classify each article.

Do NOT:
- calculate supply-chain impact
- calculate dependency impact
- predict stock prices
- invent facts
- infer relationships between companies

For every article return exactly one analysis.

Rules:
- news_id must match the supplied NEWS ID.
- company_id must be one of the supplied possible company IDs or null.
- Select the company directly affected by the event.
- event_type should describe the actual event.
- sentiment must be positive, negative, or neutral.
- severity must be between 0 and 1.
- confidence must be between 0 and 1.
- summary must be one short sentence.
- If the article is only market commentary and contains no meaningful company event, use:
  event_type = "market_commentary"
  sentiment = "neutral"
  severity = 0
  confidence = 1
  company_id = null

ARTICLES:
{"".join(article_blocks)}
"""

    response = client.models.generate_content(
        model=settings.gemini_model,
        contents=prompt,
        config={
            "response_mime_type": "application/json",
            "response_schema": BatchNewsAnalysis,
        },
    )

    if not response.text:
        raise ValueError(
            "Gemini returned an empty response"
        )

    data = json.loads(response.text)

    return BatchNewsAnalysis.model_validate(data)


# Keep the old function available for the existing
# single-news endpoint.
def analyze_news(
    news_title: str,
    news_content: str,
    companies: list[dict],
):
    article = {
        "news_id": 0,
        "title": news_title,
        "content": news_content,
        "companies": "\n".join(
            f"{company['company_id']} | "
            f"{company['company_name']} | "
            f"{company['ticker']}"
            for company in companies
        ),
    }

    result = analyze_news_batch([article])

    if not result.analyses:
        raise ValueError(
            "Gemini returned no analysis"
        )

    return result.analyses[0]