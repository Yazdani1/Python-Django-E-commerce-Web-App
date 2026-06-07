from django.urls import path

from .views import AdminStatsView

app_name = "dashboard"

urlpatterns = [
    path("stats/", AdminStatsView.as_view(), name="stats"),
]
