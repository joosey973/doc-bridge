from django.contrib import admin
from django.contrib.admin import ModelAdmin
from dropfiles.models import FileUpload

class FileAdmin(ModelAdmin):
    model = FileUpload
    list_display = ('code', 'size', 'created_at', 'user')
    fields = ('code', 'size', 'created_at', 'user', 'files')
    readonly_fields = ('code', )
    ordering = ('created_at',)

admin.site.register(FileUpload, FileAdmin)