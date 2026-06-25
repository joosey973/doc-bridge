import django.urls

import pastes.views

app_name = 'pastes'

urlpatterns = [
    django.urls.path('', pastes.views.index, name='paste_page'),
    django.urls.path('', django.urls.include('users.urls'))
]