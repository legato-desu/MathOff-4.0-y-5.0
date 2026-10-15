from django.db import models
from django.contrib.auth.models import AbstractUser
from roles.models import Role

class User(AbstractUser):
    email = models.EmailField(unique=True)
    role = models.ForeignKey(
        Role,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    REQUIRED_FIELDS = ['email']

    def __str__(self):
        return self.username