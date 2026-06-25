import django.urls

import users.views


urlpatterns = [
    django.urls.path('signin/', users.views.SignUpView.as_view(), name='signin'),
    django.urls.path('signup/', users.views.SignUpView.as_view(), name='signup'),
]