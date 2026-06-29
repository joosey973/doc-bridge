import django.urls

import pastes.views

app_name = 'pastes'

urlpatterns = [
    django.urls.path('', pastes.views.PasteView.as_view(), name='pastes_page'),
    django.urls.path('view/<str:paste_code>/', pastes.views.PasteViewPaste.as_view(), name='paste_editing'),
    django.urls.path('edit/<str:paste_code>/', pastes.views.PasteEditDelete.as_view(), name='paste_editing'),
    django.urls.path('delete/<str:paste_code>/', pastes.views.PasteEditDelete.as_view(), name='paste_editing'),
    django.urls.path('<int:paste_id>/increment-views/', pastes.views.IncrementView.as_view(), name='pastes_paste'),
]