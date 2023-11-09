import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import { Tokens } from './types';
import { RtGuard } from './guard';
import { GetCurrentUserId } from './decorator/get-current-user-id.decorator';
import { GetUser } from './decorator';
import { Public } from '../common';
import { LoggingInterceptor } from '../interceptor/logging.interceptor';
import { RefreshTokenInterceptor } from '../interceptor/refresh-token.interceptor';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@UseInterceptors(LoggingInterceptor)
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public() // bypass Global AtGuard
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  signup(@Body() dto: AuthDto) {
    return this.authService.signup(dto);
  }

  @Public() // bypass Global AtGuard
  @Post('signin')
  @HttpCode(HttpStatus.OK)
  signin(@Body() dto: AuthDto) {
    return this.authService.signin(dto);
  }

  @Post('signout')
  @HttpCode(HttpStatus.OK)
  signout(@GetCurrentUserId() userId: number): Promise<boolean> {
    return this.authService.signout(userId);
  }

  @UseInterceptors(new RefreshTokenInterceptor())
  @Public() // bypass Global AtGuard
  @UseGuards(RtGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refreshTokens(
    @GetCurrentUserId() userId: number,
    @GetUser('refreshToken') refreshToken: string,
  ): Promise<Tokens> {
    return this.authService.refreshTokens(userId, refreshToken);
  }

  @Public() // bypass Global AtGuard
  @Get('dummyHtml')
  htmlRenderer(): string {
    return `
    <h1><i>returnDummyHtml</i></h1>
    <br>
    <h2>returnDummyHtml</h2>
    `;
  }
}
