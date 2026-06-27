import django.urls

import users.views


urlpatterns = [
    django.urls.path('login/', users.views.LoginView.as_view(), name='signin'),
    django.urls.path('register/', users.views.RegisterView.as_view(), name='signup'),
]