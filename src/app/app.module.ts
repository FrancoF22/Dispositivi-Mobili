import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyDr16W5BnbsHs8d3rEujOjnUVIRVvXTawQ",
  authDomain: "geo-piece.firebaseapp.com",
  databaseURL: "https://geo-piece-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "geo-piece",
  storageBucket: "geo-piece.appspot.com",
  messagingSenderId: "252705171921",
  appId: "1:252705171921:web:575400219eef69f72158f0",
  measurementId: "G-92FNQ193WF"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
// Initialize Realtime Database and get a reference to the service

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, HttpClientModule],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {}
