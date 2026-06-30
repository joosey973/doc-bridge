from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import django.conf

from userfiles.models import FileUpload
from userfiles.serializers import DroppageSerializer
import utils

class DroppageView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        more_than_seven_days = FileUpload.objects.filter(create)

    def post(self, request):
        files = request.FILES
        
        if not files:
            return Response(
                {'error': 'Файлы не выбраны'},
                status=status.HTTP_400_BAD_REQUEST
            )

        code = utils.generate_unique_code(k=8)
        valid_extensions = ['pdf', 'docx', 'jpg', 'jpeg', 'png', 'txt', 'zip', 'rar']
        uploaded_files = []
        total_size = 0

        user = request.user if request.user.is_authenticated else None
        while FileUpload.objects.filter(code=code).exists():
            code = utils.generate_unique_code(k=8)
        

        for key, filer in files.items():
            ext = filer.name.split('.')[-1].lower()
            if ext not in valid_extensions:
                continue

            file_path = default_storage.save(f'uploads/{code}/{filer.name}', ContentFile(filer.read()))
            file_info = {
                'name': filer.name,
                'size': filer.size,
                'path': file_path,
                'url': default_storage.url(file_path),
                'format': ext
            }
            
            uploaded_files.append(file_info)
            total_size += filer.size
        
        if not uploaded_files:
            return Response(
                {'error': 'Нет валидных файлов для загрузки'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        file_upload = FileUpload.objects.create(
            code=code,
            size=total_size,
            user=user,
            files=uploaded_files,
        )

        return Response({
            'message': f'Загружено {len(uploaded_files)} файлов',
            'code': code,
            'files': uploaded_files,
            'total_size': total_size,
            'total': len(uploaded_files)
        }, status=status.HTTP_200_OK)
        

