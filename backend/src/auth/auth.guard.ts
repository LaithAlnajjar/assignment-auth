import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { FirebaseRepository } from 'src/firebase/firebase.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly firebaseRepo: FirebaseRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.cookies?.access_token as string;

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const decodedToken = await this.firebaseRepo.auth.verifyIdToken(token);
      const uid = decodedToken.uid;

      const userDoc = await this.firebaseRepo.firestore
        .collection('users')
        .doc(uid)
        .get();

      request['user'] = {
        uid: uid,
        email: decodedToken.email as string,
        role: userDoc.exists
          ? (userDoc.data()?.['role'] as string)
          : ('user' as string),
      };

      return true;
    } catch (err) {
      console.error(err);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
