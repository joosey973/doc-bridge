import django.contrib.auth.models
import django.db.models


class CustomUser(django.contrib.auth.models.AbstractUser):
    username = django.db.models.CharField(
        'идентификатор пользователя (имя)',
        max_length=100,
        null=False,
        blank=False,
        unique=True,
        help_text='Введите идентификатор пользователя (имя)',
    )
    avatar = django.db.models.ImageField('аватар пользователя', upload_to='avatars/', blank=True, null=True, help_text='Отправьте аватар пользователя')
    birth_date = django.db.models.DateField('дата рождения пользователя', blank=True, null=True, help_text='введите дату рождения пользователя')
    email = django.db.models.EmailField('почта пользователя', unique=True, help_text='Введите почту пользователя')

    class Meta:
        verbose_name = 'пользователь'
        verbose_name_plural = 'пользователи'
    
    def __str__(self):
        return self.username