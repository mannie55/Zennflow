from rest_framework import serializers
from .models import FocusSession
from drf_spectacular.utils import extend_schema_field


class FocusSessionSerializer(serializers.ModelSerializer):
    duration = serializers.SerializerMethodField()

    @extend_schema_field(serializers.IntegerField())
    def get_duration(self, obj) -> int:
        if obj.end_time and obj.start_time:
            return int((obj.end_time - obj.start_time).total_seconds())
    class Meta:
        model = FocusSession
        fields = ['id', 'start_time', 'end_time', 'is_active', 'duration']
        read_only_fields = ['id', 'start_time', 'duration']
