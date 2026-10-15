from django.db import models
from users.models import User


class Ejercicio(models.Model):
    titulo = models.CharField(max_length=255)
    descripcion = models.TextField()

    funcion_correcta = models.TextField()

    creado_por = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="ejercicios_creados"
    )

    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.titulo