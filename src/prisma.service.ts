// File: src/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma';
import { withOptimize } from '@prisma/extension-optimize';
import { withAccelerate } from '@prisma/extension-accelerate';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  // Create a private property for the base client
  private readonly prisma: ReturnType<typeof this.createPrismaClient>;

  constructor() {
    // Initialize the client with extensions
    this.prisma = this.createPrismaClient();
  }

  // Factory method to create a properly extended client
  private createPrismaClient() {
    const client = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    });

    // Chain the extensions to create a new client with both extensions
    return client.$extends(withOptimize({ apiKey: process.env.OPTIMIZE_API_KEY || ''})).$extends(withAccelerate());
  }

  // Forward all properties from the extended client
  get team() { return this.prisma.team; }
  get user() { return this.prisma.user; }
  get tournament() { return this.prisma.tournament; }
  get stage() { return this.prisma.stage; }
  get match() { return this.prisma.match; }
  get alliance() { return this.prisma.alliance; }
  get teamAlliance() { return this.prisma.teamAlliance; }
  get allianceScoring() { return this.prisma.allianceScoring; }
  get matchReferee() { return this.prisma.matchReferee; }

  // Forward transaction method
  get $transaction() {
    return this.prisma.$transaction.bind(this.prisma);
  }

  async onModuleInit() {
    await this.prisma.$connect();
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }
}
