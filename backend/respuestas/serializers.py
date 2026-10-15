from rest_framework import serializers
from .models import Respuesta


class RespuestaSerializer(serializers.ModelSerializer):

    estudiante_nombre = serializers.CharField(
        source="estudiante.username",
        read_only=True
    )

    ejercicio_titulo = serializers.CharField(
        source="ejercicio.titulo",
        read_only=True
    )

    class Meta:
        model = Respuesta

        fields = [
            "id",

            "estudiante",
            "estudiante_nombre",

            "ejercicio",
            "ejercicio_titulo",

            "respuesta_usuario",

            "es_correcta",

            "fecha_respuesta",
        ]

        read_only_fields = [
            "estudiante",
            "es_correcta",
            "fecha_respuesta",
        ]