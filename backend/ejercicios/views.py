from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Ejercicio
from .serializers import EjercicioSerializer

from respuestas.models import Respuesta


class EjercicioViewSet(viewsets.ModelViewSet):

    serializer_class = EjercicioSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        usuario = self.request.user

        ejercicios_respondidos = Respuesta.objects.filter(
            estudiante=usuario
        ).values_list(
            "ejercicio_id",
            flat=True
        )

        return Ejercicio.objects.exclude(
            id__in=ejercicios_respondidos
        ).order_by("-id")

    def perform_create(
        self,
        serializer
    ):

        serializer.save(
            creado_por=self.request.user
        )