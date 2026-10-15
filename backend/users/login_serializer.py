from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token["username"] = user.username
        token["email"] = user.email
        token["user_id"] = user.id

        if hasattr(user, "role") and user.role:
            token["role"] = user.role.nombre
        else:
            token["role"] = None

        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        data["username"] = self.user.username
        data["email"] = self.user.email
        data["user_id"] = self.user.id

        if hasattr(self.user, "role") and self.user.role:
            data["role"] = self.user.role.nombre
        else:
            data["role"] = None

        return data