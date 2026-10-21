from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from rest_framework_simplejwt.views import TokenRefreshView
from users.views import CustomLoginView
from ejercicios.scan_views import ScanEquationView

urlpatterns = [
    path("health/", lambda request: JsonResponse({"status": "ok", "service": "MathOff API"}), name="health"),
    path("admin/", admin.site.urls),

    path("api/", include("users.urls")),
    path("api/ejercicios/", include("ejercicios.urls")),
    path("api/math/scan/", ScanEquationView.as_view(), name="scan_equation"),
    path("api/respuestas/", include("respuestas.urls")),

    path("api/token/", CustomLoginView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    
]
