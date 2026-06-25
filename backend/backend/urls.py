from django.contrib import admin
import django.urls


urlpatterns = [
    django.urls.path('pastes/', django.urls.include('pastes.urls')),
    django.urls.path('admin/', admin.site.urls),
]
