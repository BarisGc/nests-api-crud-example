import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Refresh Token Guard
@Injectable() // may not be necessary
export class RtGuard extends AuthGuard('rtJwt') {
  constructor() {
    super();
  }
}
