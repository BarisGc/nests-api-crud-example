import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from '../auth/decorator';
import { AtGuard } from '../auth/guard';
import { BookmarkService } from './bookmark.service';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('bookmarks')
@UseGuards(AtGuard)
@Controller('bookmarks')
export class BookmarkController {
  constructor(private bookmarkService: BookmarkService) {}

  // baris's added example
  // caution: It's just a matter of ordering and what route is met First: "week" is mistaken with an ":id", like 123, 204...etc.
  // As your router tries the first route that meet route requirements (pattern in this case), your request is forwarded to /id route. It happens in every http framework with a router.
  // Validation occurs later on. So in short, the only thing that matters in route selection, is pattern, not validation set in it.
  // This ordering is really important, as you'll face same exact issue in all major http framework with a router.
  // Just put @Get("any-string") route above route @Get(":id") that takes the parameter.

  @Get('barisaddedexample1')
  getQueryRoute(
    @Body('title') prodTitle: string,
    @Query(
      'id',
      // ParseIntPipe // no need since transform: true in main.ts
    )
    id: number,
  ): string {
    console.log('prodTitle', prodTitle);
    console.log('id', id);
    console.log('typeof id', typeof id);
    return 'getQueryRoute()';
  }

  @Get()
  getBookmarks(@GetUser('id') userId: number) {
    return this.bookmarkService.getBookmarks(userId);
  }

  @Get(':id')
  getBookmarkById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) bookmarkId: number,
  ) {
    return this.bookmarkService.getBookmarkById(userId, bookmarkId);
  }

  @Post()
  createBookmark(
    @GetUser('id') userId: number,
    @Body() dto: CreateBookmarkDto,
  ) {
    return this.bookmarkService.createBookmark(userId, dto);
  }

  @Patch(':id')
  editBookmarkById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) bookmarkId: number,
    @Body() dto: EditBookmarkDto,
  ) {
    return this.bookmarkService.editBookmarkById(userId, bookmarkId, dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  deleteBookmarkById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) bookmarkId: number,
  ) {
    return this.bookmarkService.deleteBookmarkById(userId, bookmarkId);
  }
}
