import { Module } from '@nestjs/common';
import { AppController, HealthController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [UsersModule, ConfigModule.forRoot({ isGlobal: true })],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
