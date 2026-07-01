import django.urls

import userfiles.views

urlpatterns = [
    django.urls.path('', userfiles.views.DroppageView.as_view(), name='droppage'),
    django.urls.path('<str:files_code>/', userfiles.views.ViewFiles.as_view(), name='droppage_view'),
    django.urls.path('download/<str:files_code>/', userfiles.views.DownloadFiles.as_view(), name='droppage_download'),
]