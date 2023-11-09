import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(config: ConfigService) {
    super({
      datasources: {
        db: {
          url: config.get('DATABASE_URL'),
        },
      },
    });
  }

  // note: In most cases, you do not need to explicitly call these methods. PrismaClient automatically connects when you run your first query, creates a connection pool, and disconnects when the Node.js process ends.

  // rare usage case: If you need the first request to respond instantly and cannot wait for a lazy connection to be established, you can explicitly call prisma.$connect() to establish a connection to the data source:
  async onModuleInit() {
    await this.$connect();
  }

  // rare usage case:
  // One scenario where you should call $disconnect() explicitly is where a script:
  // Runs infrequently (for example, a scheduled job to send emails each night), which means it does not benefit from a long-running connection to the database and
  // Exists in the context of a long-running application, such as a background service. If the application never shuts down, Prisma Client never disconnects.
  async onModuleDestroy() {
    await this.$disconnect();
  }

  // teardown logic may not(im not sure) be necessary since we configured scripts in package.json to drop and create the database before running the tests (npm run test:e2e)
  // teardown logic that we need to run before out e2e tests
  // todo: async await mi olacak?
  cleanDb() {
    // transaction: for make order of operations so bookmarks will be deleted first
    return this.$transaction([
      // delete related tables
      this.bookmark.deleteMany(),
      this.user.deleteMany(),
    ]);
  }
}
