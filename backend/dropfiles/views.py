import datetime
import zipfile
import io
import shutil
import os

from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import django.conf
from django.http import FileResponse, HttpResponse
from django.utils import timezone

from dropfiles.models import FileUpload
from users.serializers import UserSerializer
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


class ViewFiles(APIView):
    permission_classes = [AllowAny]

    def get(self, request, files_code):
        files = FileUpload.objects.filter(code=files_code)
        if files:
            files = files.first()
        else:
            return Response(
                {'error': 'Не удалось загрузить файлы'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if timezone.now() - files.created_at > datetime.timedelta(days=7):
            path = django.conf.settings.MEDIA_ROOT / f'uploads/{files.code}'
            if os.path.exists(path):
                files.delete()
                try:
                    shutil.rmtree(path)
                except FileNotFoundError:
                    pass
                except OSError as e:
                    print(f"Ошибка при удалении папки: {e}")
                return Response(
                    {'error': 'Не удалось загрузить файлы'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        file_size = 0
        date = None
        for filer in files.files:
            file_size += filer['size']
        
        date = datetime.datetime.strftime(files.created_at, '%d.%m.%Y')
        expires_at = files.created_at + datetime.timedelta(days=7)
        expires_at = datetime.datetime.strftime(expires_at, '%d.%m.%Y')
        data = {'size': file_size, 'count': len(files.files), 'created_at': date, 'user': UserSerializer(files.user).data, 'expires_at': expires_at, 'files': files.files, 'code': files.code}
        return Response({
            'data': data,
        }, status=status.HTTP_200_OK)


class DownloadFiles(APIView):
    permission_classes = [AllowAny]

    def get(self, request, files_code):
        files = FileUpload.objects.filter(code=files_code)
        if files:
            files = files.first()
        else:
            return Response(
                {'error': 'Не удалось загрузить файлы'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        zipfile_name = f'{files.code}.zip'
        file_path = django.conf.settings.MEDIA_ROOT / f'uploads/{files_code}' / zipfile_name
        if len(files.files) == 1:
            file_info = files.files[0]
            file_path = django.conf.settings.MEDIA_ROOT / file_info['path']
            response = FileResponse(
                open(file_path, 'rb'),
                content_type='application/octet-stream',
                as_attachment=True,
                filename=file_info['name'],
            )
            return response
        else:
            zip_buffer = io.BytesIO()
            
            zip_path = django.conf.settings.MEDIA_ROOT / f'uploads/{files_code}/{files_code}.zip'
            if not zip_path.exists():
                with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as myzip:
                    for file_info in files.files:
                        file_path = django.conf.settings.MEDIA_ROOT / file_info['path']
                        if file_path.exists():
                            myzip.write(file_path, arcname=file_info['name'])
                        else:
                            print(f"File not found: {file_path}")
            else:
                with open(zip_path, 'rb') as existing_zip:
                    zip_buffer.write(existing_zip.read())
            zip_buffer.seek(0)
            response = HttpResponse(
                zip_buffer.getvalue(),
                content_type='application/zip'
            )
            response['Content-Disposition'] = f'attachment; filename="{files_code}.zip"'
            
            return response