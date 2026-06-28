from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.validators import EmailValidator, MinLengthValidator, MaxLengthValidator
from django.core.validators import EmailValidator
import re
import django.contrib.auth

User = django.contrib.auth.get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined', 'avatar']
        read_only_fields = ['id']


class RegisterSerializer(serializers.ModelSerializer):
    username = serializers.CharField(
        required=True,
        min_length=3,
        max_length=150,
        validators=[
            MinLengthValidator(3),
            MaxLengthValidator(150)
        ],
        error_messages={
            'required': 'Имя пользователя обязательно',
            'min_length': 'Имя пользователя должно содержать минимум 3 символа',
            'max_length': 'Имя пользователя не может превышать 150 символов'
        }
    )
    
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
        required=True,
        validators=[EmailValidator(message='Введите корректный email адрес')]
    )
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm']

    def validate_username(self, value):
        if len(value) < 3:
            raise serializers.ValidationError('Имя пользователя должно содержать минимум 3 символа')
        
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('Пользователь с таким именем уже существует')
        
        return value
    
    def validate_email(self, value):
        if value and User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Пользователь с таким email уже существует')
        return value
    
    def validate(self, attrs):
        password = attrs.get('password')
        password_confirm = attrs.get('password_confirm')
        
        if password != password_confirm:
            raise serializers.ValidationError({
                'password_confirm': 'Пароли не совпадают'
            })
        
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(
        required=True,
        error_messages={
            'required': 'Имя или почта пользователя обязательны',
            'blank': 'Имя пользователя или почта не может быть пустыми'
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
        
        if not username or not username.strip():
            raise serializers.ValidationError({
                'username': 'Имя пользователя или почта не может быть пустым'
            })
        
        if not password or not password.strip():
            raise serializers.ValidationError({
                'password': 'Пароль не может быть пустым'
            })
        
        from django.contrib.auth import authenticate
        
        user = authenticate(username=username, password=password)
        if not user:
            raise serializers.ValidationError({
                'non_field_errors': 'Неверное идентификатор пользователя или пароль'
            })
        
        if not user.is_active:
            raise serializers.ValidationError({
                'non_field_errors': 'Учетная запись деактивирована'
            })
        
        attrs['user'] = user
        return attrs