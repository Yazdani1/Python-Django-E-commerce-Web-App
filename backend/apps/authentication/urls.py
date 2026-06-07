from django.urls import path

from apps.users.views import MeView, RegisterView

from .views import LoginView, LogoutView, TokenRefreshView

app_name = "auth"

urlpatterns = [
    # ── Registration & profile live here so all auth URLs share one prefix ──
    path("register/", RegisterView.as_view(), name="register"),
    path("profile/", MeView.as_view(), name="profile"),
    # ── JWT token management ────────────────────────────────────────────────
    path("login/", LoginView.as_view(), name="login"),
    path("refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("logout/", LogoutView.as_view(), name="logout"),
]
