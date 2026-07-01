import django.urls

import compress.views

app_name = 'pastes'

urlpatterns = [
    django.urls.path('', compress.views.CompressView.as_view(), name='pastes_page'),
]