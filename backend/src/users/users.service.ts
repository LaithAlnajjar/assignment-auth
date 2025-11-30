import { Injectable } from '@nestjs/common';
import { FirebaseRepository } from '../firebase/firebase.service';

@Injectable()
export class UsersService {
  constructor(private readonly firebaseRepo: FirebaseRepository) {}

  async createUserProfile(uid: string, email: string) {
    const userRef = this.firebaseRepo.firestore.collection('users').doc(uid);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      await userRef.set({
        email,
        createdAt: new Date().toISOString(),
        role: 'user',
      });
    }

    return { status: 'success', message: 'Profile initialized' };
  }
}
