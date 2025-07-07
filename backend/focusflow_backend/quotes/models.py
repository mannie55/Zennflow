# quotes/models.py

from django.db import models
from datetime import date

class Quote(models.Model):
    text = models.TextField()
    author = models.CharField(max_length=255, blank=True)
    date = models.DateField(default=date.today, unique=True)  # Ensure only 1 per day
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'"{self.text[:40]}..." - {self.author or "Unknown"}'
