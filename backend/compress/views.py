import datetime
import os
import shutil
import zipfile
from PIL import Image
from PyPDF2 import PdfReader, PdfWriter
from docx import Document
import io
import re

import django.conf
from django.http import FileResponse
import mimetypes
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView

import utils
from dropfiles.models import FileUpload


class CompressView(APIView):
    permission_classes = [AllowAny]
    supported_formats = ['pdf', 'docx', 'jpg', 'jpeg', 'png', 'txt', 'zip', 'rar']
    max_file_size = 100 * 1024 * 1024

    def post(self, request):
        file = request.FILES.get('file')
        if not file:
            file = request.data.get('file')

        if not file:
            return Response({'error': 'Файл не загружен'}, status=status.HTTP_400_BAD_REQUEST)

        compress_level = request.data.get('compression_level', 'medium')
        if compress_level not in ['low', 'medium', 'high']:
            compress_level = 'medium'

        return self.compress_file(file, compress_level, request)

    def compress_file(self, file, compress_level, request):
        file_extension = file.name.split('.')[-1].lower()

        if file_extension not in self.supported_formats:
            return Response({'error': f'Неподдерживаемый формат файла: {file_extension}'}, status=status.HTTP_400_BAD_REQUEST)

        if file.size > self.max_file_size:
            return Response({'error': f'Максимальный размер файла: {self.max_file_size} байт'}, status=status.HTTP_400_BAD_REQUEST)

        if file_extension == 'rar':
            return Response({'error': 'Сжатие RAR файлов не поддерживается на сервере'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            original_data = file.read()
            original_size = len(original_data)
        except Exception as e:
            return Response({'error': f'Ошибка чтения файла: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            if file_extension in ['jpg', 'jpeg', 'png']:
                compressed_data = self._compress_image_bytes(original_data, file_extension, compress_level)
            elif file_extension == 'pdf':
                compressed_data = self._compress_pdf_bytes(original_data, compress_level)
            elif file_extension == 'docx':
                compressed_data = self._compress_docx_bytes(original_data, compress_level)
            elif file_extension == 'txt':
                compressed_data = self._compress_txt_bytes(original_data, compress_level)
            elif file_extension == 'zip':
                compressed_data = self._compress_zip_bytes(original_data, compress_level)
            else:
                return Response({'error': f'Неподдерживаемый формат файла: {file_extension}'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': f'Ошибка при сжатии файла: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        compressed_size = len(compressed_data)
        reduction = round(max(0.0, (original_size - compressed_size) / original_size * 100), 1)

        code = utils.generate_unique_code(k=8)
        media_dir = os.path.join(django.conf.settings.MEDIA_ROOT, 'compressed', code)
        os.makedirs(media_dir, exist_ok=True)

        compressed_filename = f"compressed_{file.name}"
        file_path = os.path.join(media_dir, compressed_filename)

        try:
            with open(file_path, 'wb') as f:
                f.write(compressed_data)
        except Exception as e:
            return Response({'error': f'Ошибка сохранения файла: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        download_url = request.build_absolute_uri(
            f'/api/compress/download/{code}/{compressed_filename}/'
        )

        user = request.user
        user = user if user.is_authenticated else None
        obj = FileUpload.objects.create(
            size=compressed_size,
            created_at=datetime.datetime.now(),
            user=user,
            files=[1],
            code=None,
        )
        return Response({
            'compressed_size': compressed_size,
            'original_size': original_size,
            'reduction': reduction,
            'download_url': download_url
        }, status=status.HTTP_200_OK)

    def _compress_image_bytes(self, file_bytes, extension, compress_level):
        img = Image.open(io.BytesIO(file_bytes))
        original_size = len(file_bytes)
        
        if img.mode == 'P' and 'transparency' in img.info:
            img = img.convert('RGBA')
        
        out_io = io.BytesIO()
        
        if extension in ['jpg', 'jpeg']:
            if compress_level == 'low':
                quality = 85
            elif compress_level == 'high':
                quality = 40
            else:
                quality = 65
            
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            img.save(out_io, format='JPEG', optimize=True, quality=quality)
            
        elif extension == 'png':
            if compress_level == 'low':
                img.save(out_io, format='PNG', optimize=True)
            else:
                approaches = []
                
                io1 = io.BytesIO()
                img.save(io1, format='PNG', optimize=True)
                approaches.append(io1.getvalue())
                
                colors = 128 if compress_level == 'high' else 256
                try:
                    io2 = io.BytesIO()
                    quantized = img.quantize(colors=colors)
                    quantized.save(io2, format='PNG', optimize=True)
                    approaches.append(io2.getvalue())
                except Exception:
                    pass
                
                if img.mode != 'RGBA' and img.mode != 'P':
                    try:
                        io3 = io.BytesIO()
                        rgb_img = img.convert('RGB')
                        quality = 60 if compress_level == 'high' else 75
                        rgb_img.save(io3, format='JPEG', optimize=True, quality=quality)
                        approaches.append(io3.getvalue())
                    except Exception:
                        pass
                
                if approaches:
                    compressed_data = min(approaches, key=len)
                    out_io.write(compressed_data)
                    out_io.seek(0)
                    compressed_size = len(compressed_data)
                    
                    if compressed_size >= original_size:
                        return file_bytes
                        
                    return out_io.getvalue()
                else:
                    img.save(out_io, format='PNG', optimize=True)
        
        compressed_data = out_io.getvalue()
    
        if len(compressed_data) >= original_size:
            return file_bytes
        
        return compressed_data

    def _compress_pdf_bytes(self, file_bytes, compress_level):
        reader = PdfReader(io.BytesIO(file_bytes))
        writer = PdfWriter()

        for page in reader.pages:
            if compress_level != 'low':
                page.compress_content_streams()
            writer.add_page(page)

        out_io = io.BytesIO()
        writer.write(out_io)
        return out_io.getvalue()

    def _compress_docx_bytes(self, file_bytes, compress_level):
        in_io = io.BytesIO(file_bytes)
        out_io = io.BytesIO()

        if compress_level == 'low':
            zip_level = 4
        elif compress_level == 'high':
            zip_level = 9
        else:
            zip_level = 7

        try:
            with zipfile.ZipFile(in_io, 'r') as in_zip:
                with zipfile.ZipFile(out_io, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=zip_level) as out_zip:
                    for item in in_zip.infolist():
                        data = in_zip.read(item.filename)
                        if 'word/media/' in item.filename:
                            img_ext = item.filename.split('.')[-1].lower()
                            if img_ext in ['jpg', 'jpeg', 'png']:
                                try:
                                    img_data = self._compress_image_bytes(data, img_ext, compress_level)
                                    data = img_data
                                except Exception:
                                    pass
                        out_zip.writestr(item, data)
            return out_io.getvalue()
        except Exception:
            return file_bytes

    def _compress_txt_bytes(self, file_bytes, compress_level):
        try:
            text = file_bytes.decode('utf-8')
        except UnicodeDecodeError:
            try:
                text = file_bytes.decode('cp1251')
            except UnicodeDecodeError:
                return file_bytes

        lines = text.splitlines()

        if compress_level == 'low':
            new_lines = []
            empty_count = 0
            for line in lines:
                stripped = line.rstrip()
                if not stripped:
                    empty_count += 1
                    if empty_count <= 2:
                        new_lines.append('')
                else:
                    empty_count = 0
                    new_lines.append(stripped)
            result_text = '\n'.join(new_lines)

        elif compress_level == 'medium':
            new_lines = []
            for line in lines:
                stripped = line.strip()
                if stripped:
                    new_lines.append(stripped)
            result_text = '\n'.join(new_lines)

        else:  # high
            new_lines = []
            for line in lines:
                stripped = line.strip()
                if stripped:
                    cleaned = re.sub(r'\s+', ' ', stripped)
                    new_lines.append(cleaned)
            result_text = '\n'.join(new_lines)

        return result_text.encode('utf-8')

    def _compress_zip_bytes(self, file_bytes, compress_level):
        in_io = io.BytesIO(file_bytes)
        out_io = io.BytesIO()

        if compress_level == 'low':
            zip_level = 4
        elif compress_level == 'high':
            zip_level = 9
        else:
            zip_level = 7

        try:
            with zipfile.ZipFile(in_io, 'r') as in_zip:
                with zipfile.ZipFile(out_io, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=zip_level) as out_zip:
                    for item in in_zip.infolist():
                        data = in_zip.read(item.filename)
                        ext = item.filename.split('.')[-1].lower()

                        if ext in ['jpg', 'jpeg', 'png']:
                            try:
                                data = self._compress_image_bytes(data, ext, compress_level)
                            except Exception:
                                pass
                        elif ext == 'pdf':
                            try:
                                data = self._compress_pdf_bytes(data, compress_level)
                            except Exception:
                                pass
                        elif ext == 'docx':
                            try:
                                data = self._compress_docx_bytes(data, compress_level)
                            except Exception:
                                pass
                        elif ext == 'txt':
                            try:
                                data = self._compress_txt_bytes(data, compress_level)
                            except Exception:
                                pass

                        out_zip.writestr(item, data)
            return out_io.getvalue()
        except Exception:
            return file_bytes


class DownloadCompressedView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, code, filename):
        file_path = os.path.join(django.conf.settings.MEDIA_ROOT, 'compressed', code, filename)
        if not os.path.exists(file_path):
            return Response({'error': 'Файл не найден'}, status=status.HTTP_404_NOT_FOUND)

        content_type, _ = mimetypes.guess_type(file_path)
        if not content_type:
            content_type = 'application/octet-stream'

        try:
            response = FileResponse(
                open(file_path, 'rb'),
                content_type=content_type,
                as_attachment=True,
                filename=filename
            )
            return response
        except Exception as e:
            return Response({'error': f'Ошибка при скачивании: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
