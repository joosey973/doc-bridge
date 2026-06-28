import django.urls

import pastes.views

app_name = 'pastes'

urlpatterns = [
    django.urls.path('', pastes.views.PasteView.as_view(), name='pastes_page'),
    django.urls.path('<int:paste_id>/increment-views/', pastes.views.IncrementView.as_view(), name='pastes_paste'),
]