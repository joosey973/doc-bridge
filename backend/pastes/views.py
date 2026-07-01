from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
import django.contrib.auth

from pastes.serializers import PasteSerializer
from users.serializers import UserSerializer
from pastes.models import Pastes
import utils

User = django.contrib.auth.get_user_model()


class PasteEditDelete(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, paste_code):
        paste_obj = Pastes.objects.filter(code=paste_code).first()
        paste_user_obj = User.objects.filter(username=paste_obj.user)
        user_obj = User.objects.filter(username=request.user)
        paste = PasteSerializer(paste_obj).data
        
        if not user_obj:
            user = {}
        if not paste_user_obj:
            paste_user = {}
        if paste_user_obj:
            paste_user = UserSerializer(paste_user_obj.first()).data
        if user_obj:
            user = UserSerializer(user_obj.first()).data
        return Response(
            {'paste_user': paste_user, 'paste': paste, 'user': user}, status=status.HTTP_200_OK)
    
    def put(self, request, paste_code):
        data = request.data
        
        paste = get_object_or_404(Pastes, code=paste_code)
        paste.category = data['category']
        paste.tags = data['tags']
        paste.text = data['text']
        paste.title = data['title']
        paste.save()
        return Response({'success': True}, status=status.HTTP_200_OK)


    def delete(self, request, paste_code):
        paste = get_object_or_404(Pastes, code=paste_code)
        paste.delete() 
        return Response({'success': True}, status=status.HTTP_200_OK)


class PasteViewPaste(PasteEditDelete, APIView):
    permission_classes = [AllowAny]

    def put(self, request):
        pass

    def delete(self, request):
        pass



class IncrementView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = [JWTAuthentication]
    
    def post(self, request, paste_id):
        try:
            paste = get_object_or_404(Pastes, id=paste_id)
            print(request.user, paste.user)
            if request.user != paste.user:
                paste.views = (paste.views or 0) + 1
                paste.save(update_fields=['views'])
            
            return Response({
                'views': paste.views,
                'success': True
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': str(e),
                'success': False
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PasteView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        pastes = Pastes.objects.filter(user__isnull=False).order_by('-created_at')
        
        serializer = PasteSerializer(pastes, many=True)
        data = serializer.data
        if request.user.is_authenticated:
            user = User.objects.get(username=request.user)
            user_data = UserSerializer(user).data
        else:
            user_data = {}
        
        for i in range(len(data)):
            data[i]['user'] = User.objects.get(id=data[i]['user']).username
        return Response({
            'success': True,
            'pastes': serializer.data,
            'user': user_data,
            'count': pastes.count()
        }, status=status.HTTP_200_OK)
    
    def post(self, request):
        required_fields = ['text']
        missing_fields = [field for field in required_fields if field not in request.data]

        if missing_fields:
            return Response({
                'success': False,
                'error': f'Отсутствуют обязательные поля: {", ".join(missing_fields)}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        code = utils.generate_unique_code()
        while Pastes.objects.filter(code=code).exists():
            code = utils.generate_unique_code()
        data = request.data
        data['code'] = code
        if request.user.id:
            data['user'] = request.user.id
        serializer = PasteSerializer(data=data)
        if serializer.is_valid():
            try:
                paste = serializer.save()
                data = PasteSerializer(paste).data
                if data['user']:
                    data['user'] = User.objects.get(id=data['user']).username
                return Response({
                    'success': True,
                    'message': 'Заметка успешно создана',
                    'paste': PasteSerializer(paste).data,
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
