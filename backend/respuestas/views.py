from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import Respuesta
from .serializers import RespuestaSerializer
from .utils import comparar_funciones

from ejercicios.models import Ejercicio


class CrearRespuestaView(generics.CreateAPIView):
    queryset = Respuesta.objects.all()

    serializer_class = RespuestaSerializer

    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):

        ejercicio_id = self.request.data.get(
            "ejercicio"
        )

        ejercicio = Ejercicio.objects.get(
            id=ejercicio_id
        )

        respuesta_usuario = self.request.data.get(
            "respuesta_usuario"
        )

        es_correcta = comparar_funciones(
            ejercicio.funcion_correcta,
            respuesta_usuario
        )

        serializer.save(
            estudiante=self.request.user,
            es_correcta=es_correcta
        )


class ListarRespuestasView(generics.ListAPIView):

    queryset = Respuesta.objects.all().order_by(
        "-id"
    )

    serializer_class = RespuestaSerializer

    permission_classes = [IsAuthenticated]