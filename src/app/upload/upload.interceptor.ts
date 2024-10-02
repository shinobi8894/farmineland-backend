import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { UploadService } from './upload.service';

@Injectable()
export class ImageCompressionInterceptor implements NestInterceptor {
  constructor(private readonly uploadService: UploadService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();
    if (req.file) {
      const file = req.file;
      const buffer = await this.uploadService.getFileBuffer(file.path);
      file.buffer = buffer;
      try {
        const compressedFilePath = await this.uploadService.compressImage(file);
        req.file['compressedFilePath'] = compressedFilePath;
      } catch (error) {
        console.error('Failed to compress image:', error.message);
        throw new Error(`Failed to compress image: ${error.message}`);
      }
    }
    return next.handle();
  }
}
