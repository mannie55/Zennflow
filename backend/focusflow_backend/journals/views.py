from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import JournalEntry
from .serializers import JournalEntrySerializer
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema
from rest_framework.generics import RetrieveUpdateDestroyAPIView

class CreateJournalView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = JournalEntrySerializer

    @extend_schema(
    summary="Create a journal entry",
    description="Creates a new journal entry.",
    responses={201: JournalEntrySerializer},
)
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ListJournalView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = JournalEntrySerializer

    @extend_schema(
    summary="List journal entries",
    description="Retrieves a list of journal entries for the authenticated user.",
    responses={200: JournalEntrySerializer},
)
    def get(self, request):
        journals = JournalEntry.objects.filter(user=request.user).order_by('-created_at')
        serializer = self.serializer_class(journals, many=True)
        return Response(serializer.data)

@extend_schema(
    summary="View and manage a journal entry",
    description="Retrieves, updates, or deletes a specific journal entry.",
    responses={200: JournalEntrySerializer},
)
class JournalDetailView(RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = JournalEntrySerializer
    queryset = JournalEntry.objects.all()

    def get_object(self):
        obj = super().get_object()
        if obj.user != self.request.user:
            raise PermissionDenied("Not your journal.")
        return obj

    def perform_update(self, serializer):
        if self.get_object().is_session_tied():
            raise PermissionDenied("Cannot edit a journal tied to a session.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.is_session_tied():
            raise PermissionDenied("Cannot delete a journal tied to a session.")
        instance.delete()
