from rest_framework.routers import DefaultRouter

from .views import BannerViewSet

app_name = "banners"

router = DefaultRouter()
router.register("", BannerViewSet, basename="banner")

urlpatterns = router.urls
