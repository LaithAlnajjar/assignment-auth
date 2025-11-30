import { Inject, Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { app } from 'firebase-admin';

@Injectable()
export class FirebaseRepository {
  #db: FirebaseFirestore.Firestore;
  #auth: admin.auth.Auth;

  constructor(@Inject('FIREBASE_APP') private firebaseApp: app.App) {
    this.#db = firebaseApp.firestore();
    this.#auth = firebaseApp.auth();
  }

  get firestore() {
    return this.#db;
  }

  get auth() {
    return this.#auth;
  }
}
