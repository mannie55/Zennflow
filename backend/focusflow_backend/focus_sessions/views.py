from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.utils import timezone
from drf_spectacular.utils import extend_schema

from .models import FocusSession
from .serializers import FocusSessionSerializer



class StartSessionView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = FocusSessionSerializer
    
    @extend_schema(
    summary="Create a focus session",
    description="Starts a new focus session and returns its ID.",
    responses={201: FocusSessionSerializer},
)
    def post(self, request):
        if FocusSession.objects.filter(user=request.user, is_active=True).exists():
            return Response({"detail": "You already have an active session."}, status=status.HTTP_400_BAD_REQUEST)
        
        session = FocusSession.objects.create(user=request.user)
        serializer = self.serializer_class(session)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class StopSessionView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = FocusSessionSerializer
    
    @extend_schema(
    summary="Stop a focus session",
    description="Stops the ongoing focus session.",
    responses={201: FocusSessionSerializer},
)
    def post(self, request):
        try:
            session = FocusSession.objects.get(user=request.user, is_active=True)
            session.end_time = timezone.now()
            session.is_active = False
            session.save()
            serializer = self.serializer_class(session)
            return Response(serializer.data)
        except FocusSession.DoesNotExist:
            return Response({"detail": "No active session found."}, status=status.HTTP_404_NOT_FOUND)


class ActiveSessionView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = FocusSessionSerializer

    @extend_schema(
    summary="View active focus session",
    description="Retrieves the currently active focus session.",
    responses={200: FocusSessionSerializer},
)
    def get(self, request):
        session = FocusSession.objects.filter(user=request.user, is_active=True).first()
        if not session:
            return Response({"detail": "No active session."}, status=status.HTTP_200_OK)
        serializer = self.serializer_class(session)
        return Response(serializer.data)


class SessionHistoryView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = FocusSessionSerializer

    @extend_schema(
    summary="View focus session history",
    description="Retrieves the history of completed focus sessions.",
    responses={200: FocusSessionSerializer},
)
    def get(self, request):
        sessions = FocusSession.objects.filter(user=request.user, is_active=False).order_by('-start_time')
        serializer = self.serializer_class(sessions, many=True)
        return Response(serializer.data)




