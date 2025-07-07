import requests
from .models import Quote
from datetime import date
from random import randint
from django.db.models import Count

ZEN_QUOTES_API = "https://zenquotes.io/api/today"


def get_random_quote():
    count = Quote.objects.count()
    if count == 0:
        return None
    random_index = randint(0, count - 1)
    return Quote.objects.all()[random_index]


def fetch_daily_quote():
    today = date.today()

    existing_quote = Quote.objects.filter(date=today).first()
    if existing_quote:
        return existing_quote

    try:
        res = requests.get(ZEN_QUOTES_API, timeout=5)
        data = res.json()

        quote_text = data[0]['q']
        quote_author = data[0]['a']

        quote = Quote.objects.create(
            text=quote_text,
            author=quote_author,
            date=today
        )
        return quote

    except Exception as e:
        fallback = get_random_quote()
        return fallback