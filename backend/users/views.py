from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer

class RegisterView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        return Response({
            'message': 'Используйте POST для регистрации',
            'example': {
                'username': 'testuser',
                'password': 'Test123456',
                'password_confirm': 'Test123456',
                'email': 'test@example.com'
            }
        })
    
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        
        if serializer.is_valid():
            try:
                user = serializer.save()
                refresh = RefreshToken.for_user(user)
                
                return Response({
                    'success': True,
                    'message': 'Регистрация успешно завершена',
                    'user': UserSerializer(user).data,
                    'token': str(refresh.access_token),
                    'refresh': str(refresh)
                }, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({
                    'success': False,
                    'error': str(e)
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Возвращаем все ошибки валидации
        errors = {}
        for field, field_errors in serializer.errors.items():
            # Форматируем ошибки для фронтенда
            if isinstance(field_errors, list):
                errors[field] = field_errors[0]  # Берем первую ошибку
            else:
                errors[field] = field_errors
        
        return Response({
            'success': False,
            'errors': errors,
            'message': 'Ошибка валидации данных'
        }, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'success': True,
                'message': 'Вход выполнен успешно',
                'user': UserSerializer(user).data,
                'token': str(refresh.access_token),
                'refresh': str(refresh)
            })
        
        # Возвращаем ошибки валидации
        errors = {}
        for field, field_errors in serializer.errors.items():
            if field == 'non_field_errors':
                # Ошибки не связанные с конкретным полем
                errors['general'] = field_errors[0] if field_errors else 'Ошибка аутентификации'
            else:
                errors[field] = field_errors[0] if field_errors else 'Неверное значение'
        
        return Response({
            'success': False,
            'errors': errors,
            'message': 'Ошибка входа'
        }, status=status.HTTP_400_BAD_REQUEST)