from django.db import models
from django.conf import settings
from focus_sessions.models import FocusSession

class JournalEntry(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="journals")
    content = models.TextField()
    session = models.ForeignKey(FocusSession, on_delete=models.SET_NULL, null=True, blank=True, related_name="journals")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def is_session_tied(self):
        return self.session is not None

    def __str__(self):
        return f"Journal by {self.user.email} on {self.created_at.strftime('%Y-%m-%d')}"
