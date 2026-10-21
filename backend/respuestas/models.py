from django.db import models
from users.models import User
from ejercicios.models import Ejercicio


class Respuesta(models.Model):
    estudiante = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="respuestas"
    )

    ejercicio = models.ForeignKey(
        Ejercicio,
        on_delete=models.CASCADE,
        related_name="respuestas"
    )

    respuesta_usuario = models.TextField()

    es_correcta = models.BooleanField(default=False)

    fecha_respuesta = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.estudiante.username} - {self.ejercicio.titulo}"
    
    class Meta:
        unique_together = (
            "estudiante",
            "ejercicio"
        )