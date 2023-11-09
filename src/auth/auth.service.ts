import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Tokens } from './types';

@Injectable()
export class AuthService {
  logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {
    this.logger.debug('auth logger works');
  }
  // note: async since because prisma will be called
  async signup(dto: AuthDto): Promise<Tokens> {
    // feature: "this is Throwing standard exceptions#" approach
    if (!dto) throw new ForbiddenException('signup error, no dto');

    //note: nestjs handles Content-Type which is displayed in Headers

    // generate the password hash// note: argon.hash() is async function
    const hash = await argon.hash(dto.password);

    // save the new user in the db
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
        },
      });

      const tokens = await this.getTokens(user.id, user.email);
      await this.updateRtHash(user.id, tokens.refresh_token);

      console.log('tokens', tokens);
      return tokens;
    } catch (error) {
      // note: we dont need to cache all possible prisma errors here so use  prisma error class
      // note: P2002 is for that the unique field already exists
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }
      throw error;
    }
  }

  async signin(dto: AuthDto): Promise<Tokens> {
    if (!dto) throw new ForbiddenException('signin error, no dto');
    // find the user by email
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    // if user does not exist throw exception
    if (!user) throw new ForbiddenException('No User Registered'); // new UnauthorizedException('Credentials incorrect') de olabilir ama hangi credential incorrect onu belirtme güvenlik sebebiyle

    // compare password
    const pwMatches = await argon.verify(user.hash, dto.password);
    // if password incorrect throw exception
    if (!pwMatches) throw new ForbiddenException('Credentials incorrect');

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refresh_token);

    console.log('tokens', tokens);
    return tokens;
  }

  async signout(userId: number): Promise<boolean> {
    if (!userId) throw new ForbiddenException('signout error, no userId');

    await this.prisma.user.updateMany({
      where: {
        id: userId,
        // prevent user spamming signout button to make db busy
        hashedRt: {
          not: null,
        },
      },
      data: {
        hashedRt: null,
      },
    });

    // todo: message dönülebilir
    return true;
  }

  async refreshTokens(userId: number, rt: string): Promise<Tokens> {
    if (!userId || !rt) throw new ForbiddenException('refreshTokens error');

    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user || !user.hashedRt) throw new ForbiddenException('Access Denied');

    const rtMatches = await argon.verify(user.hashedRt, rt);
    if (!rtMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refresh_token);

    return tokens;
  }

  async updateRtHash(userId: number, rt: string): Promise<void> {
    if (!userId || !rt) throw new ForbiddenException('updateRtHash error');

    const hash = await argon.hash(rt);

    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        hashedRt: hash,
      },
    });
  }

  // utils
  async getTokens(userId: number, email: string): Promise<Tokens> {
    if (!userId || !email) throw new ForbiddenException('getTokens error');
    const payload = {
      id: userId,
      email,
    };

    const atSecret = this.config.get('AT_SECRET');
    const rtSecret = this.config.get('RT_SECRET');

    const [at, rt] = await Promise.all([
      this.jwt.signAsync(payload, {
        expiresIn: '30m',
        secret: atSecret,
      }),
      this.jwt.signAsync(payload, {
        expiresIn: '7d',
        secret: rtSecret,
      }),
    ]);

    return {
      access_token: at,
      refresh_token: rt,
    };
  }
}
