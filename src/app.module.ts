import { Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TournamentsModule } from './tournaments/tournaments.module';
import { TeamsModule } from './teams/teams.module';
import { StagesModule } from './stages/stages.module';
import { MatchesModule } from './matches/matches.module';
import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/auth.service';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    TournamentsModule,
    TeamsModule,
    StagesModule,
    MatchesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  constructor(private authService: AuthService) {}

  async onModuleInit() {
    // Create default admin account when application starts
    try {
      await this.authService.createDefaultAdmin();
      console.log('Admin initialization completed');
    } catch (error) {
      console.error('Error creating default admin account:', error.message);
    }
  }
}
