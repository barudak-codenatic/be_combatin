import { Injectable, NestInterceptor, ExecutionContext, CallHandler, BadRequestException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class FileValidationInterceptor implements NestInterceptor {
  constructor(
    private readonly maxSize: number = 5 * 1024 * 1024, // Default 5MB
    private readonly allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/webp']
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const file = request.file;

    if (file) {
      
      if (!this.allowedTypes.includes(file.mimetype)) {
        throw new BadRequestException('Tipe file tidak diizinkan. Gunakan JPEG, PNG, atau WebP.');
      }

      
      if (file.size > this.maxSize) {
        throw new BadRequestException(`Ukuran file melebihi batas maksimal ${this.maxSize / 1024 / 1024}MB.`);
      }
    }

    return next.handle();
  }
}