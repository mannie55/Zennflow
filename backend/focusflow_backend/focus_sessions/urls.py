from django.urls import path
from .views import (
    StartSessionView,
    StopSessionView,
    ActiveSessionView,
    SessionHistoryView,
)

app_name = "focus_sessions"

urlpatterns = [
    path('start/', StartSessionView.as_view(), name='start-session'),
    path('stop/', StopSessionView.as_view(), name='stop-session'),
    path('active/', ActiveSessionView.as_view(), name='active-session'),
    path('history/', SessionHistoryView.as_view(), name='session-history'),
]
