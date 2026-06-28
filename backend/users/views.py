from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from users.serializers import RegisterSerializer, LoginSerializer, UserSerializer


class RegisterView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):

        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            try:
                user = serializer.save()
                refresh = RefreshToken.for_user(user)
                access_token = str(refresh.access_token)
                refresh_token = str(refresh)
                
                return Response({
                    'success': True,
                    'message': 'Регистрация успешно завершена',
                    'user': UserSerializer(user).data,
                    'token': access_token,
                    'refresh': refresh_token,
                }, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({
                    'success': False,
                    'error': str(e)
                }, status=status.HTTP_400_BAD_REQUEST)
        
        errors = {}
        for field, field_errors in serializer.errors.items():
            if isinstance(field_errors, list):
                errors[field] = field_errors[0]
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
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)
            
            return Response({
                'success': True,
                'message': 'Вход выполнен успешно',
                'user': UserSerializer(user).data,
                'token': access_token,
                'refresh': refresh_token,
            })
        
        errors = {}
        for field, field_errors in serializer.errors.items():
            if field == 'non_field_errors':
                errors['general'] = field_errors[0] if field_errors else 'Ошибка аутентификации'
            else:
                errors[field] = field_errors[0] if field_errors else 'Неверное значение'
        
        return Response({
            'success': False,
            'errors': errors,
            'message': 'Ошибка входа'
        }, status=status.HTTP_400_BAD_REQUEST)
    

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            serializer = UserSerializer(request.user)
            return Response({
                'success': True,
                'user': serializer.data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)