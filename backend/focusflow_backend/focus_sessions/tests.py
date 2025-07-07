import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.utils import timezone
from users.models import User
from focus_sessions.models import FocusSession

pytestmark = pytest.mark.django_db

@pytest.fixture
def user():
    return User.objects.create_user(username="testuser", email="test@example.com", password="testpass123")

@pytest.fixture
def client(user):
    client = APIClient()
    client.force_authenticate(user=user)
    return client

def test_start_focus_session(client, user):
    # Test that a user can successfully start a new focus session
    url = reverse("focus_sessions:start-session")
    response = client.post(url)

    assert response.status_code == status.HTTP_201_CREATED
    assert FocusSession.objects.filter(user=user, is_active=True).count() == 1

def test_cannot_start_multiple_sessions(client, user):
    # Test that a user cannot start a new session if one is already active
    FocusSession.objects.create(user=user, is_active=True)
    
    url = reverse("focus_sessions:start-session")
    response = client.post(url)

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.data["detail"] == "You already have an active session."

def test_stop_focus_session(client, user):
    # Test that a user can stop an active session and it is marked as inactive with an end time
    session = FocusSession.objects.create(user=user, is_active=True)
    url = reverse("focus_sessions:stop-session")

    response = client.post(url)
    session.refresh_from_db()

    assert response.status_code == status.HTTP_200_OK
    assert session.is_active is False
    assert session.end_time is not None

def test_stop_no_active_session_returns_404(client):
    # Test that stopping a session when none is active returns 404 and appropriate error message
    url = reverse("focus_sessions:stop-session")
    response = client.post(url)

    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.data["detail"] == "No active session found."

def test_get_active_session(client, user):
    # Test retrieving the currently active session for the user
    session = FocusSession.objects.create(user=user, is_active=True)
    url = reverse("focus_sessions:active-session")
    response = client.get(url)

    assert response.status_code == status.HTTP_200_OK
    assert response.data["id"] == session.id

def test_get_active_session_none(client):
    # Test retrieving active session when there is none returns 200 (empty or null response)
    url = reverse("focus_sessions:active-session")
    response = client.get(url)

    assert response.status_code == status.HTTP_200_OK

def test_session_history(client, user):
    # Test that session history endpoint returns all completed (inactive) sessions for the user
    FocusSession.objects.create(user=user, start_time=timezone.now(), end_time=timezone.now(), is_active=False)
    FocusSession.objects.create(user=user, start_time=timezone.now(), end_time=timezone.now(), is_active=False)

    url = reverse("focus_sessions:session-history")
    response = client.get(url)

    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 2
