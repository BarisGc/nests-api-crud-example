import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload } from '../types/jwtPayload.type';
import { User } from '@prisma/client';

// explanation: password library will act as a guard so it will block the request if the jwt is incorrect
// explanation2: password library wont handle authotization and authentication, we will handle this ourself, it will just verify if access and refresh tokens are correct
@Injectable()
// Access Token Strategy
export class AtStrategy extends PassportStrategy(Strategy, 'atJwt') {
  // caution: do not add private since super must be called first and if you add private, you have to call super later since you have to call config as this.config since it produces variable in class field that will execute before super.
  constructor(config: ConfigService, private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true, //  15 mins if false, 0 min if true , define it as true if for development purpose
      secretOrKey: config.get('AT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.id,
      },
    });
    delete user.hash;
    return user;

    // vlad did this example the above but also he said  in the one of the previous videos that calling the database is here not good practice since it will be called everytime the user request something and may be heavy/costly operation
    // so payload should be returned here and controller and services should call the database so they can be customized and be less costly
  }
}
