import django.db.models as models
import django.contrib.auth


User = django.contrib.auth.get_user_model()


class Pastes(models.Model):
    code = models.CharField(max_length=20, unique=True)
    title = models.CharField(max_length=200)
    text = models.TextField()
    category = models.CharField(max_length=50, default='other')
    language = models.CharField(max_length=50, default='text')
    tags = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    views = models.IntegerField(default=0)
    size = models.IntegerField(default=0)
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.CASCADE)

    class Meta:
        verbose_name = 'заметка'
        verbose_name_plural = 'заметки'