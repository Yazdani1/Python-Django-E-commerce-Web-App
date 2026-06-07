from decimal import Decimal

import pytest
from rest_framework import status
from rest_framework.test import APIClient

from apps.categories.tests.factories import CategoryFactory
from apps.products.tests.factories import InactiveProductFactory, ProductFactory
from apps.users.tests.factories import AdminUserFactory, UserFactory

LIST_URL = "/api/v1/products/"
DETAIL_URL = "/api/v1/products/{slug}/"


def detail(slug: str) -> str:
    return DETAIL_URL.format(slug=slug)


@pytest.fixture
def api_client() -> APIClient:
    return APIClient()


@pytest.fixture
def user(db):
    return UserFactory()


@pytest.fixture
def admin(db):
    return AdminUserFactory()


@pytest.fixture
def auth_client(user):
    client = APIClient()
    client.force_authenticate(user=user)
    return client


@pytest.fixture
def admin_client(admin):
    client = APIClient()
    client.force_authenticate(user=admin)
    return client


# ── List ───────────────────────────────────────────────────────────────────────
@pytest.mark.django_db
class TestProductList:
    def test_list_public_succeeds(self, api_client, db) -> None:
        ProductFactory.create_batch(3)
        response = api_client.get(LIST_URL)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["success"] is True

    def test_list_returns_only_active_for_public(self, api_client, db) -> None:
        ProductFactory.create_batch(2)
        InactiveProductFactory()
        response = api_client.get(LIST_URL)
        assert len(response.data["results"]) == 2

    def test_list_admin_sees_inactive(self, admin_client, db) -> None:
        ProductFactory()
        InactiveProductFactory()
        response = admin_client.get(LIST_URL)
        assert len(response.data["results"]) == 2

    def test_list_response_has_sku(self, api_client, db) -> None:
        ProductFactory()
        response = api_client.get(LIST_URL)
        item = response.data["results"][0]
        assert "sku" in item
        assert item["sku"].startswith("SKU-")


# ── Retrieve ───────────────────────────────────────────────────────────────────
@pytest.mark.django_db
class TestProductRetrieve:
    def test_retrieve_public_succeeds(self, api_client, db) -> None:
        p = ProductFactory()
        response = api_client.get(detail(p.slug))
        assert response.status_code == status.HTTP_200_OK
        assert response.data["data"]["slug"] == p.slug

    def test_retrieve_not_found(self, api_client, db) -> None:
        response = api_client.get(detail("does-not-exist"))
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_retrieve_inactive_hidden_from_public(self, api_client, db) -> None:
        p = InactiveProductFactory()
        response = api_client.get(detail(p.slug))
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_retrieve_inactive_visible_to_admin(self, admin_client, db) -> None:
        p = InactiveProductFactory()
        response = admin_client.get(detail(p.slug))
        assert response.status_code == status.HTTP_200_OK


# ── Create ─────────────────────────────────────────────────────────────────────
@pytest.mark.django_db
class TestProductCreate:
    def test_create_success(self, admin_client, db) -> None:
        cat = CategoryFactory()
        payload = {
            "name": "Wireless Mouse",
            "description": "A great mouse.",
            "price": "39.99",
            "stock_quantity": 50,
            "category": cat.id,
            "is_active": True,
        }
        response = admin_client.post(LIST_URL, payload, format="multipart")
        assert response.status_code == status.HTTP_201_CREATED
        data = response.data["data"]
        assert data["name"] == "Wireless Mouse"
        assert data["sku"].startswith("SKU-")
        assert data["slug"] == "wireless-mouse"

    def test_create_auto_generates_sku_and_slug(self, admin_client, db) -> None:
        response = admin_client.post(
            LIST_URL, {"name": "Gaming Chair", "price": "199.99"}, format="multipart"
        )
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["data"]["sku"].startswith("SKU-")
        assert response.data["data"]["slug"] == "gaming-chair"

    def test_create_missing_name_rejected(self, admin_client) -> None:
        response = admin_client.post(
            LIST_URL, {"price": "10.00"}, format="multipart"
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_create_non_admin_forbidden(self, auth_client) -> None:
        response = auth_client.post(
            LIST_URL, {"name": "X", "price": "10.00"}, format="multipart"
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_create_unauthenticated_returns_401(self, api_client) -> None:
        response = api_client.post(
            LIST_URL, {"name": "X", "price": "10.00"}, format="multipart"
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


# ── Update ─────────────────────────────────────────────────────────────────────
@pytest.mark.django_db
class TestProductUpdate:
    def test_partial_update_success(self, admin_client, db) -> None:
        p = ProductFactory(price=Decimal("10.00"))
        response = admin_client.patch(
            detail(p.slug), {"price": "25.00"}, format="multipart"
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.data["data"]["price"] == "25.00"

    def test_update_preserves_sku(self, admin_client, db) -> None:
        p = ProductFactory()
        original_sku = p.sku
        admin_client.patch(detail(p.slug), {"name": "Renamed"}, format="multipart")
        p.refresh_from_db()
        assert p.sku == original_sku

    def test_update_non_admin_forbidden(self, auth_client, db) -> None:
        p = ProductFactory()
        response = auth_client.patch(
            detail(p.slug), {"name": "Hacked"}, format="multipart"
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_update_unauthenticated_returns_401(self, api_client, db) -> None:
        p = ProductFactory()
        response = api_client.patch(
            detail(p.slug), {"name": "Hacked"}, format="multipart"
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


# ── Delete ─────────────────────────────────────────────────────────────────────
@pytest.mark.django_db
class TestProductDelete:
    def test_delete_success(self, admin_client, db) -> None:
        p = ProductFactory()
        response = admin_client.delete(detail(p.slug))
        assert response.status_code == status.HTTP_200_OK

    def test_delete_removes_from_db(self, admin_client, db) -> None:
        from apps.products.models import Product

        p = ProductFactory()
        admin_client.delete(detail(p.slug))
        assert not Product.objects.filter(pk=p.pk).exists()

    def test_delete_non_admin_forbidden(self, auth_client, db) -> None:
        p = ProductFactory()
        response = auth_client.delete(detail(p.slug))
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_delete_unauthenticated_returns_401(self, api_client, db) -> None:
        p = ProductFactory()
        response = api_client.delete(detail(p.slug))
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
