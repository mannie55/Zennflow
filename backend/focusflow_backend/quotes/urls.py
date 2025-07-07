from django.urls import path
from .views import DailyQuoteView

app_name = "quotes"

urlpatterns = [
    path("daily/", DailyQuoteView.as_view(), name="daily-quote"),
]