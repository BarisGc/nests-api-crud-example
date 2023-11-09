import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// note: @Global() decorator is required to make the PrismaService available to the entire application
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
