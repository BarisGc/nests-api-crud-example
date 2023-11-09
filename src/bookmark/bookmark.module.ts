import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { BookmarkController } from './bookmark.controller';
import { BookmarkService } from './bookmark.service';
import { LoggerMiddleware } from '../middleware/logger.middleware';

@Module({
  controllers: [BookmarkController],
  providers: [BookmarkService],
})
export class BookmarkModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .exclude(
        { path: 'bookmarks', method: RequestMethod.GET },
        { path: 'barisaddedexample1', method: RequestMethod.POST },
        'barisaddedexample1/(.*)',
      );
    // include all routes
    // .forRoutes(LoggedMiddleware);
    // include specific routes
    // .forRoutes({ path: 'users', method: RequestMethod.GET });
  }
}
