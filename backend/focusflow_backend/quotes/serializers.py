from .models import Quote
from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field

class QuoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quote
        fields = ['text', 'author', 'date', 'created_at']
        read_only_fields = ['id', 'date']
