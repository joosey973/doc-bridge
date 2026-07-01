# backend/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
import os

urlpatterns = [
    path('api/pastes/', include('pastes.urls')),
    path('api/auth/', include('users.urls')),
    path('api/profile/', include('userprofile.urls')),
    path('api/droppage/', include('userfiles.urls')),
    path('api/compress/', include('compress.urls')),
    path('admin/', admin.site.urls),
]

if settings.DEBUG:
    media_root = str(settings.MEDIA_ROOT) if hasattr(settings.MEDIA_ROOT, '__fspath__') else settings.MEDIA_ROOT
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=media_root
    )