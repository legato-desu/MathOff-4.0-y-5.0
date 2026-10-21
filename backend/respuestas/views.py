from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Respuesta
from .serializers import RespuestaSerializer
from .utils import comparar_funciones

from ejercicios.models import Ejercicio


class CrearRespuestaView(generics.CreateAPIView):
    queryset = Respuesta.objects.all()

    serializer_class = RespuestaSerializer

    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        ejercicio_id = request.data.get("ejercicio")
        respuesta_usuario = request.data.get("respuesta_usuario", "")
        try:
            ejercicio = Ejercicio.objects.get(id=ejercicio_id)
        except (Ejercicio.DoesNotExist, TypeError, ValueError):
            return Response({"detail": "El ejercicio no existe."}, status=status.HTTP_400_BAD_REQUEST)
        es_correcta = comparar_funciones(ejercicio.funcion_correcta, respuesta_usuario)
        respuesta, created = Respuesta.objects.update_or_create(
            estudiante=request.user, ejercicio=ejercicio,
            defaults={"respuesta_usuario": respuesta_usuario, "es_correcta": es_correcta},
        )
        serializer = self.get_serializer(respuesta)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)




class ListarRespuestasView(generics.ListAPIView):

    serializer_class = RespuestaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Respuesta.objects.select_related("estudiante", "ejercicio").order_by("-id")
        role = "Root" if self.request.user.is_superuser else (self.request.user.role.nombre if self.request.user.role else "")
        if role.lower() in ("root", "superusuario", "admin", "administrador", "docente"):
            return queryset
        return queryset.filter(estudiante=self.request.user)