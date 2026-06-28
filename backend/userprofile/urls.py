from django.urls import path
from userprofile.views import ProfileView, ProfileAvatarUpload, ProfileAvatarDelete

app_name = 'profile'

urlpatterns = [
    path('', ProfileView.as_view(), name='profile'),
    path('avatar/upload/', ProfileAvatarUpload.as_view(), name='upload_avatar'),
    path('avatar/delete/', ProfileAvatarDelete.as_view(), name='delete_avatar'),
]