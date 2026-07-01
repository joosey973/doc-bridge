import django.urls

import dropfiles.views

urlpatterns = [
    django.urls.path('', dropfiles.views.DroppageView.as_view(), name='droppage'),
    django.urls.path('<str:files_code>/', dropfiles.views.ViewFiles.as_view(), name='droppage_view'),
    django.urls.path('download/<str:files_code>/', dropfiles.views.DownloadFiles.as_view(), name='droppage_download'),
]