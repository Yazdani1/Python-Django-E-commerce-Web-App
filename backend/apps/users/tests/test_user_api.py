"""
User API tests — register, profile, change-password.
Every endpoint has: happy path, auth/permission check, validation error path.
"""

import pytest
from rest_framework import status
from rest_framework.test import APIClient

from apps.users.tests.factories import UserFactory


@pytest.fixture
def api_client() -> APIClient:
    return APIClient()


@pytest.fixture
def user(db):
    return UserFactory()


@pytest.fixture
def auth_client(user):
    client = APIClient()
    client.force_authenticate(user=user)
    return client


# ── Registration ───────────────────────────────────────────────────────────────
@pytest.mark.django_db
class TestRegisterView:
    url = "/api/v1/users/register/"

    def test_register_success(self, api_client: APIClient) -> None:
        payload = {
            "email": "new@example.com",
            "password": "StrongPass123!",
            "password_confirm": "StrongPass123!",
            "first_name": "Jane",
            "last_name": "Doe",
        }
        response = api_client.post(self.url, payload, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["success"] is True
        assert response.data["data"]["email"] == "new@example.com"
        assert response.data["data"]["full_name"] == "Jane Doe"

    def test_register_password_mismatch(self, api_client: APIClient) -> None:
        payload = {
            "email": "new@example.com",
            "password": "StrongPass123!",
            "password_confirm": "WrongPass!",
        }
        response = api_client.post(self.url, payload, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data["success"] is False

    def test_register_duplicate_email(self, api_client: APIClient, user) -> None:
        payload = {
            "email": user.email,
            "password": "StrongPass123!",
            "password_confirm": "StrongPass123!",
        }
        response = api_client.post(self.url, payload, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_register_missing_email(self, api_client: APIClient) -> None:
        payload = {"password": "StrongPass123!", "password_confirm": "StrongPass123!"}
        response = api_client.post(self.url, payload, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_register_weak_password(self, api_client: APIClient) -> None:
        payload = {
            "email": "new@example.com",
            "password": "123",
            "password_confirm": "123",
        }
        response = api_client.post(self.url, payload, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST


# ── Profile (me) ───────────────────────────────────────────────────────────────
@pytest.mark.django_db
class TestMeView:
    url = "/api/v1/users/me/"

    def test_get_profile_authenticated(self, auth_client: APIClient, user) -> None:
        response = auth_client.get(self.url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["data"]["email"] == user.email

    def test_get_profile_unauthenticated(self, api_client: APIClient) -> None:
        response = api_client.get(self.url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_update_profile_success(self, auth_client: APIClient) -> None:
        response = auth_client.patch(
            self.url, {"first_name": "Updated"}, format="json"
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.data["data"]["first_name"] == "Updated"

    def test_update_profile_unauthenticated(self, api_client: APIClient) -> None:
        response = api_client.patch(
            self.url, {"first_name": "Updated"}, format="json"
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


# ── Change Password ────────────────────────────────────────────────────────────
@pytest.mark.django_db
class TestChangePasswordView:
    url = "/api/v1/users/change-password/"

    def test_change_password_success(self, auth_client: APIClient) -> None:
        payload = {
            "current_password": "TestPass123!",
            "new_password": "NewStrongPass456!",
            "new_password_confirm": "NewStrongPass456!",
        }
        response = auth_client.post(self.url, payload, format="json")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["success"] is True

    def test_change_password_wrong_current(self, auth_client: APIClient) -> None:
        payload = {
            "current_password": "WrongCurrentPass!",
            "new_password": "NewStrongPass456!",
            "new_password_confirm": "NewStrongPass456!",
        }
        response = auth_client.post(self.url, payload, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data["success"] is False

    def test_change_password_mismatch(self, auth_client: APIClient) -> None:
        payload = {
            "current_password": "TestPass123!",
            "new_password": "NewStrongPass456!",
            "new_password_confirm": "DifferentPass789!",
        }
        response = auth_client.post(self.url, payload, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_change_password_weak_new_password(self, auth_client: APIClient) -> None:
        payload = {
            "current_password": "TestPass123!",
            "new_password": "123",
            "new_password_confirm": "123",
        }
        response = auth_client.post(self.url, payload, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_change_password_unauthenticated(self, api_client: APIClient) -> None:
        payload = {
            "current_password": "TestPass123!",
            "new_password": "NewStrongPass456!",
            "new_password_confirm": "NewStrongPass456!",
        }
        response = api_client.post(self.url, payload, format="json")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
