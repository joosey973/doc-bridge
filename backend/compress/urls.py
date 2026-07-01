import django.urls

import compress.views

app_name = 'compress'

urlpatterns = [
    django.urls.path('', compress.views.CompressView.as_view(), name='compress_page'),
    django.urls.path('download/<str:code>/<str:filename>/', compress.views.DownloadCompressedView.as_view(), name='download_compressed'),
]