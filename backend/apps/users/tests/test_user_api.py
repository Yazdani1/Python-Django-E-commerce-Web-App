"""
User API tests — happy path + error path for registration and profile.
Run with: pytest apps/users/tests/
"""

import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from apps.users.models import User


@pytest.fixture
def api_client() -> APIClient:
    return APIClient()


@pytest.fixture
def registered_user(db) -> User:
    return User.objects.create_user(
        email="test@example.com",
        password="StrongPass123!",
        first_name="Test",
        last_name="User",
    )


@pytest.mark.django_db
class TestRegisterView:
    url = "/api/v1/users/register/"

    def test_register_success(self, api_client: APIClient) -> None:
        payload = {
            "email": "new@example.com",
            "password": "StrongPass123!",
            "password_confirm": "StrongPass123!",
            "first_name": "New",
            "last_name": "User",
        }
        response = api_client.post(self.url, payload, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["success"] is True
        assert response.data["data"]["email"] == "new@example.com"

    def test_register_password_mismatch(self, api_client: APIClient) -> None:
        payload = {
            "email": "new@example.com",
            "password": "StrongPass123!",
            "password_confirm": "WrongPass!",
        }
        response = api_client.post(self.url, payload, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data["success"] is False

    def test_register_duplicate_email(self, api_client: APIClient, registered_user: User) -> None:
        payload = {
            "email": registered_user.email,
            "password": "StrongPass123!",
            "password_confirm": "StrongPass123!",
        }
        response = api_client.post(self.url, payload, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestMeView:
    url = "/api/v1/users/me/"

    def test_get_profile_authenticated(self, api_client: APIClient, registered_user: User) -> None:
        api_client.force_authenticate(user=registered_user)
        response = api_client.get(self.url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["data"]["email"] == registered_user.email

    def test_get_profile_unauthenticated(self, api_client: APIClient) -> None:
        response = api_client.get(self.url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
