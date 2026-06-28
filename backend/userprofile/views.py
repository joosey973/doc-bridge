import datetime
import os

import django.contrib.auth
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from users.serializers import UserSerializer
from pastes.serializers import PasteSerializer
from pastes.models import Pastes

User = django.contrib.auth.get_user_model()


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = User.objects.get(username=request.user)
        pastes = Pastes.objects.filter(user=user.id).all()

        user_data = UserSerializer(user).data
        pastes_serializer = PasteSerializer(pastes, many=True)
        stats = {'pastes': pastes_serializer.data, 'pastes_count': pastes.count()}
        if user_data.get('date_joined'):
            try:
                date_obj = datetime.datetime.fromisoformat(
                    user_data['date_joined'].replace('Z', '+00:00')
                )
                user_data['date_joined'] = date_obj.strftime('%d.%m.%Y')
            except (ValueError, AttributeError):
                pass
        
        return Response({
            'success': True,
            'user': user_data,
            'stats': stats
        }, status=status.HTTP_200_OK)


class ProfileAvatarUpload(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        file_obj = request.FILES.get('avatar')

        if not file_obj:
            return Response(
                {'error': 'Файл не предоставлен'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if file_obj.size > 10 * 1024 * 1024:
            return Response(
                {'error': 'Размер файла не должен превышать 10 МБ'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        valid_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg', '.tiff', '.ico']
        ext = os.path.splitext(file_obj.name)[1].lower()

        if ext not in valid_extensions:
            return Response(
                {'error': 'Неподдерживаемый формат файла'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if user.avatar:
            user.avatar.delete(save=False)

        user.avatar = file_obj
        user.save()

        return Response({
            'success': True,
            'message': 'Аватар успешно обновлен',
            'avatar_url': user.avatar.url if user.avatar else None
        }, status=status.HTTP_200_OK)


class ProfileAvatarDelete(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        user = User.objects.get(username=request.user)
        user.avatar.delete(save=False)
        user.avatar = None
        user.save()
        return Response({
            'success': True,
        }, status=status.HTTP_200_OK)