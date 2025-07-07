from django.urls import path
from .views import CreateJournalView, ListJournalView, JournalDetailView

app_name = "journals"

urlpatterns = [
    path("create/", CreateJournalView.as_view(), name="create-journal"),
    path("", ListJournalView.as_view(), name="list-journals"),
    path("<int:pk>/", JournalDetailView.as_view(), name="journal-detail"),
]
