from django.db import models
import uuid
import django.contrib.auth

User = django.contrib.auth.get_user_model()

class Paste(models.Model):
    LANGUAGE_CHOICES = [
        ('javascript', 'JavaScript'),
        ('python', 'Python'),
        ('cpp', 'C++'),
        ('java', 'Java'),
        ('html', 'HTML'),
        ('css', 'CSS'),
        ('php', 'PHP'),
        ('ruby', 'Ruby'),
        ('go', 'Go'),
        ('rust', 'Rust'),
        ('sql', 'SQL'),
        ('text', 'Текст'),
    ]
    
    CATEGORY_CHOICES = [
        ('work', 'Работа'),
        ('personal', 'Личная жизнь'),
        ('food', 'Еда'),
        ('study', 'Учеба'),
        ('travel', 'Путешествия'),
        ('health', 'Здоровье'),
        ('entertainment', 'Развлечения'),
        ('other', 'Другое'),
    ]
    
    code = models.CharField(max_length=20, unique=True, editable=False)
    title = models.CharField(max_length=100, default='Без названия')
    content = models.TextField()
    language = models.CharField(max_length=20, choices=LANGUAGE_CHOICES, default='javascript')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='other')
    tags = models.JSONField(default=list)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='pastes')
    username = models.CharField(max_length=150, default='Гость')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    views = models.IntegerField(default=0)
    size = models.IntegerField(default=0)
    
    def save(self, *args, **kwargs):
        if not self.code:
            self.code = str(uuid.uuid4())[:8]
        self.size = len(self.content.encode('utf-8'))
        if self.user:
            self.username = self.user.username
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.code} - {self.title}"