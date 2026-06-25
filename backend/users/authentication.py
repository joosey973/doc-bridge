import django.contrib.auth.backends
import django.contrib.auth
from django.db.models import Q


User = django.contrib.auth.get_user_model()


class EmailOrUsernameBackend(django.contrib.auth.backends.ModelBackend):
    def authenticate(self, request, username = None, password = None, **kwargs):
        try:
            user = User.objects.get(Q(username=username)|Q(email=username))
        except User.DoesNotExist:
            User().set_password(password)
            return None

        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        
        return None