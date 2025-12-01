import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { FirebaseModule } from 'src/firebase/firebase.module';

@Module({
  controllers: [AuthController],
  imports: [FirebaseModule],
})
export class AuthModule {}
