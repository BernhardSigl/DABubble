import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { routes } from './app.routes';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';

export const appConfig: ApplicationConfig = {
  providers: [
    AngularFirestoreModule,
    provideRouter(routes),
    provideAnimations(),
    importProvidersFrom(
      provideFirebaseApp(() =>
        initializeApp({
          projectId: 'dabubble-2',
          appId: '1:838611660883:web:372cc0552fc6f960cb56a6',
          storageBucket: 'dabubble-2.appspot.com',
          apiKey: 'AIzaSyAo0KHMdZeulQnzCG847Kk9jhsYepp4fXs',
          authDomain: 'dabubble-2.firebaseapp.com',
          messagingSenderId: '838611660883',
        })
      )
    ),
    importProvidersFrom(provideAuth(() => getAuth())),
    importProvidersFrom(provideFirestore(() => getFirestore()))
  ],
};
