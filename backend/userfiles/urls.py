import django.urls

import userfiles.views

urlpatterns = [
    django.urls.path('', userfiles.views.DroppageView.as_view(), name='droppage')
]