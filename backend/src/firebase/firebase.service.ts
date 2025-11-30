import { Inject, Injectable } from '@nestjs/common';
import { app } from 'firebase-admin';

@Injectable()
export class FirebaseRepository {
  // eslint-disable-next-line no-unused-private-class-members
  #db: FirebaseFirestore.Firestore;

  constructor(@Inject('FIREBASE_APP') private firebaseApp: app.App) {
    this.#db = firebaseApp.firestore();
  }
}
