import {
  Body,
  Controller,
  Get,
  Patch,
  UseFilters,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from '../auth/decorator';
import { EditUserDto } from './dto';
import { UserService } from './user.service';
import { AtGuard } from '../auth/guard';
import { UserGuard } from './guard/user.guard';
import { HttpExceptionFilter } from './filter/http-exception.filter';
import { ExamplePipe } from './pipe/example.pipe';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('users')
@UseGuards(AtGuard) // covers all routes in this controller, if you want that only specific routes are covered, then use @UseGuards(JwtGuard) on/above each route.
@Controller('"users"')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('me')
  @UseGuards(new UserGuard())
  @UseFilters(new HttpExceptionFilter())
  @UsePipes(new ExamplePipe())
  // @Redirect('https://google.com', 301) // redirect to google with 301 status code
  // @Header('Cache-Control', 'none')
  // do not use req:Request directly since it is prone to error.
  getMe(@GetUser() user: User) {
    return user;
  }

  @Patch()
  editUser(@GetUser('id') userId: number, @Body() dto: EditUserDto) {
    return this.userService.editUser(userId, dto);
  }
}
