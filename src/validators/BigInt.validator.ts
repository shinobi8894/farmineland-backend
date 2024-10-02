import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class BigIntToNumberInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        return this.convertBigIntToNumber(data);
      }),
    );
  }

  private convertBigIntToNumber(data: any): any {
    if (Array.isArray(data)) {
      return data.map((item) => this.convertBigIntToNumber(item));
    } else if (data && typeof data === 'object') {
      const newData = { ...data };
      for (const key in newData) {
        if (typeof newData[key] === 'bigint') {
          newData[key] = Number(newData[key]);
        } else if (typeof newData[key] === 'object') {
          newData[key] = this.convertBigIntToNumber(newData[key]);
        }
      }
      return newData;
    }
    return data;
  }
}