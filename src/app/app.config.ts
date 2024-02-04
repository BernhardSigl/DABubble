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
          projectId: 'dabubble-342cb',
          appId: '1:440475341248:web:546d028fb3799dc6203825',
          storageBucket: 'dabubble-342cb.appspot.com',
          apiKey: 'AIzaSyC0GvISE4kXc9teDSH0edGV8rKr_HEBz8E',
          authDomain: 'dabubble-342cb.firebaseapp.com',
          messagingSenderId: '440475341248',
        })
      )
    ),
    importProvidersFrom(provideAuth(() => getAuth())),
    importProvidersFrom(provideFirestore(() => getFirestore())),
  ],
};
