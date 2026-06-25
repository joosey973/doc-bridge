from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.validators import EmailValidator
import re
import django.contrib.auth

User = django.contrib.auth.get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, 
        required=True,
        validators=[validate_password]
    )
    password_confirm = serializers.CharField(
        write_only=True, 
        required=True
    )
    email = serializers.EmailField(
        required=False,
        allow_blank=True,
        validators=[EmailValidator(message='Введите корректный email адрес')]
    )
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm']
        extra_kwargs = {
            'username': {
                'required': True,
                'min_length': 3,
                'max_length': 150,
            }
        }
    
    def validate_username(self, value):
        'Валидация имени пользователя'
        # Проверка на минимальную длину
        if len(value) < 3:
            raise serializers.ValidationError('Имя пользователя должно содержать минимум 3 символа')
        
        # Проверка на допустимые символы
        if not re.match(r'^[\w.@+-]+$', value):
            raise serializers.ValidationError(
                'Имя пользователя может содержать только буквы, цифры и символы @/./+/-/_'
            )
        
        # Проверка на существование пользователя
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError('Пользователь с таким именем уже существует')
        
        return value
    
    def validate_email(self, value):
        'Валидация email'
        if value and User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('Пользователь с таким email уже существует')
        return value
    
    def validate(self, attrs):
        'Общая валидация формы'
        # Проверка совпадения паролей
        password = attrs.get('password')
        password_confirm = attrs.get('password_confirm')
        
        if password != password_confirm:
            raise serializers.ValidationError({
                'password_confirm': 'Пароли не совпадают'
            })
        
        return attrs
    
    def create(self, validated_data):
        'Создание пользователя'
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(
        required=True,
        error_messages={
            'required': 'Имя пользователя обязательно',
            'blank': 'Имя пользователя не может быть пустым'
        }
    )
    password = serializers.CharField(
        required=True,
        write_only=True,
        error_messages={
            'required': 'Пароль обязателен',
            'blank': 'Пароль не может быть пустым'
        }
    )
    
    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')
        
        # Проверка на пустые значения
        if not username or not username.strip():
            raise serializers.ValidationError({
                'username': 'Имя пользователя не может быть пустым'
            })
        
        if not password or not password.strip():
            raise serializers.ValidationError({
                'password': 'Пароль не может быть пустым'
            })
        
        # Проверка существования пользователя через Django
        from django.contrib.auth import authenticate
        
        user = authenticate(username=username, password=password)
        if not user:
            raise serializers.ValidationError({
                'non_field_errors': 'Неверное имя пользователя или пароль'
            })
        
        if not user.is_active:
            raise serializers.ValidationError({
                'non_field_errors': 'Учетная запись деактивирована'
            })
        
        attrs['user'] = user
        return attrs