from django.contrib import admin
from django.contrib.admin import ModelAdmin
from pastes.models import Pastes

class PastesAdmin(ModelAdmin):
    model = Pastes
    list_display = ('title', 'text', 'category', 'language',
                  'tags', 'created_at', 'updated_at', 'views', 'size', 'user', 'code')
    ordering = ('title',)

    class Meta:
        verbose_name = 'Заметка'
        verbose_name_plural = 'Заметки'

admin.site.register(Pastes, PastesAdmin)