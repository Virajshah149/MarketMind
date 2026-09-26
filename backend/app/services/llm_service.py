from google import genai

from app.core.config import settings
from app.schemas.news_analysis import NewsAnalysis


client = genai.Client(
    api_key=settings.gemini_api_key
)


def analyze_news(
    news_title: str,
    news_content: str,
    companies: list[dict],
) -> NewsAnalysis:

    company_context = "\n".join(
        [
            f"{company['company_id']}: "
            f"{company['company_name']} "
            f"({company['ticker']})"
            for company in companies
        ]
    )

    prompt = f"""
You are the news intelligence engine for MarketMind.

Analyze the following news article involving Indian listed
companies.

AVAILABLE COMPANIES:

{company_context}

NEWS TITLE:
{news_title}

NEWS CONTENT:
{news_content}

RULES:

1. Identify the company primarily affected by the news.
2. company_id MUST come from the supplied company list.
3. If no supplied company is clearly affected, use null.
4. Identify the event type.
5. Classify the news as positive, negative, or neutral.
6. Estimate event severity from 0 to 1.
7. Estimate analysis confidence from 0 to 1.
8. Give a short factual summary.
9. Do NOT calculate supply-chain impact.
10. Do NOT calculate stock-price impact.
11. Do NOT invent relationships between companies.
12. Severity represents the significance of the EVENT itself,
    not the expected stock-price movement.
"""

    response = client.models.generate_content(
        model=settings.gemini_model,
        contents=prompt,
        config={
            "response_mime_type": "application/json",
            "response_schema": NewsAnalysis,
        },
    )

    if response.parsed is None:
        raise ValueError(
            "Gemini did not return structured analysis"
        )

    return response.parsed
