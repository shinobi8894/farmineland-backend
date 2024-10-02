import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UploadDto } from './dto/upload.dto';
import { ImageCompressionInterceptor } from './upload.interceptor';

@ApiTags('Upload')
@Controller('/api/v1/upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file'), ImageCompressionInterceptor)
  @ApiOperation({ summary: 'Upload de imagem' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ description: 'Arquivo de imagem', type: UploadDto })
  @ApiResponse({
    status: 201,
    description: 'Imagem carregada e comprimida com sucesso',
  })
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    const compressedFilePath = file['compressedFilePath'];
    const cleanFilePath = compressedFilePath.replace('uploads\\', 'uploads/');
    const imageUrl = `https://srv538807.hstgr.cloud/${cleanFilePath}`;
    return { message: 'Success!', imageUrl };
  }
}
