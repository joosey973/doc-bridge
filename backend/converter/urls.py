import django.urls

import converter.views

urlpatterns = [
    django.urls.path('', converter.views.ConvertView.as_view(), name='converter'),
]