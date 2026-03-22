'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

export function initializeFirebase(): { app: FirebaseApp; db: Firestore; auth: Auth } | null {
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "") {
    console.warn("Firebase API Key missing. Cognitive Heart in 'Local Session' mode.");
    return null;
  }
  
  try {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const auth = getAuth(app);
    return { app, db, auth };
  } catch (error) {
    console.error("Firebase initialization failed:", error);
    return null;
  }
}

export * from './provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
