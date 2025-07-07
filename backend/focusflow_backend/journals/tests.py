import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from users.models import User
from journals.models import JournalEntry
from focus_sessions.models import FocusSession

pytestmark = pytest.mark.django_db

# ---------- Fixtures ----------
@pytest.fixture
def user():
    return User.objects.create_user(username="testuser", email="test@example.com", password="testpass123")

@pytest.fixture
def client(user):
    client = APIClient()
    client.force_authenticate(user=user)
    return client

@pytest.fixture
def session(user):
    return FocusSession.objects.create(user=user, is_active=False)

@pytest.fixture
def session_journal(user, session):
    return JournalEntry.objects.create(user=user, content="Session journal", session=session)

@pytest.fixture
def freestyle_journal(user):
    return JournalEntry.objects.create(user=user, content="Freestyle journal")



def test_create_freestyle_journal(client):
    # Test creating a freestyle (not session-tied) journal entry
    url = reverse("journals:create-journal")
    data = {"content": "Today I focused hard."}
    response = client.post(url, data)

    assert response.status_code == status.HTTP_201_CREATED
    assert response.data["content"] == data["content"]

def test_list_user_journals(client, freestyle_journal, session_journal):
    # Test listing all journals for the authenticated user (both freestyle and session-tied)
    url = reverse("journals:list-journals")
    response = client.get(url)

    assert response.status_code == 200
    assert len(response.data) == 2

def test_get_specific_journal(client, freestyle_journal):
    # Test retrieving a specific freestyle journal entry by ID
    url = reverse("journals:journal-detail", args=[freestyle_journal.id])
    response = client.get(url)

    assert response.status_code == 200
    assert response.data["content"] == freestyle_journal.content

def test_update_freestyle_journal(client, freestyle_journal):
    # Test updating a freestyle journal entry's content
    url = reverse("journals:journal-detail", args=[freestyle_journal.id])
    data = {"content": "Updated reflection"}
    response = client.put(url, data)

    assert response.status_code == 200
    assert response.data["content"] == "Updated reflection"

def test_cannot_update_session_journal(client, session_journal):
    # Test that updating a session-tied journal entry is forbidden
    url = reverse("journals:journal-detail", args=[session_journal.id])
    response = client.put(url, {"content": "Attempt to change"})

    assert response.status_code == 403
    assert response.data["detail"] == "Cannot edit a journal tied to a session."

def test_delete_freestyle_journal(client, freestyle_journal):
    # Test deleting a freestyle journal entry
    url = reverse("journals:journal-detail", args=[freestyle_journal.id])
    response = client.delete(url)

    assert response.status_code == 204
    assert JournalEntry.objects.filter(id=freestyle_journal.id).count() == 0

def test_cannot_delete_session_journal(client, session_journal):
    # Test that deleting a session-tied journal entry is forbidden
    url = reverse("journals:journal-detail", args=[session_journal.id])
    response = client.delete(url)

    assert response.status_code == 403
    assert response.data["detail"] == "Cannot delete a journal tied to a session."
