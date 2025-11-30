import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { FirebaseRepository } from 'src/firebase/firebase.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly firebaseRepo: FirebaseRepository) {}
  async canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.split(' ')[1];

    try {
      const decodedToken = await this.firebaseRepo.auth.verifyIdToken(token);
      const uid = decodedToken.uid;

      const userDoc = await this.firebaseRepo.firestore
        .collection('users')
        .doc(uid)
        .get();

      request['user'] = {
        uid: uid,
        email: decodedToken.email,
        role: userDoc.data()?.['role'] as string,
      };
      return true;
    } catch (error) {
      console.error('Auth Error:', error);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
