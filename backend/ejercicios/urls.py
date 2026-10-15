from rest_framework.routers import DefaultRouter

from .views import EjercicioViewSet


router = DefaultRouter()

router.register(
    r'',
    EjercicioViewSet,
    basename='ejercicios'
)

urlpatterns = router.urls