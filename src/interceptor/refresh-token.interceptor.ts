import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class RefreshTokenInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log('Before RT...');

    const now = Date.now();

    return next
      .handle()
      .pipe(tap(() => console.log(`After RT... ${Date.now() - now}ms`)));
  }
}
