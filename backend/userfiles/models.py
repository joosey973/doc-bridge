import datetime

from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class FileUpload(models.Model):
    code = models.CharField(max_length=20, unique=True, null=True, blank=True)
    files = models.JSONField(default=list)
    size = models.IntegerField(default=0)
    created_at = models.DateTimeField(default=datetime.datetime.now)
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.CASCADE)

    class Meta:
        verbose_name = 'файл'
        verbose_name_plural = 'файлы'