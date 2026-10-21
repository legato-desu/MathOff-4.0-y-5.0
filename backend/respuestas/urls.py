from django.urls import path

from .views import (
    CrearRespuestaView,
    ListarRespuestasView,
)

urlpatterns = [

    path(
        "crear/",
        CrearRespuestaView.as_view(),
        name="crear_respuesta",
    ),

    path(
        "",
        ListarRespuestasView.as_view(),
        name="listar_respuestas",
    ),
]