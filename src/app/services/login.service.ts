import { Injectable, inject } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom, take, tap } from 'rxjs';
import { ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot } from '@angular/router';
import { NavController } from '@ionic/angular';
import { User } from '../models/user.model';
import { getDatabase, ref, get, DataSnapshot, update } from 'firebase/database';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private user: User | undefined;
  private databaseRef: any; // Riferimento al database Firebase

  constructor(
    private http: HttpClient,
    private nav: NavController
  ) {
    const database = getDatabase(); // Ottieni l'istanza del database Firebase
    this.databaseRef = ref(database); // Ottieni il riferimento al database
  }

  async login(username: string, password: string) {

    // Controlliamo se l'utente ha già fatto login
    let isLogged: any = await Preferences.get({ key: 'isLogged' });

    if (isLogged.value != null) {
      console.log(isLogged)
      if (JSON.parse(isLogged.value)) {
        console.log("Already logged in")
        return true;
      }
    }

    // Recuperiamo l'utente dal database Firebase
    const database = getDatabase();
    const usersRef = ref(database, 'users');
    const snapshot: DataSnapshot = await get(usersRef);

    if (snapshot.exists()) {
      const users = snapshot.val();
      const userIds = Object.keys(users);
      const matchedUser = userIds
        .map(userId => users[userId])
        .find(user => user.username === username && user.password === password);

      if (matchedUser.password === password) {
        console.log("Valid credentials");
        Preferences.set({ key: 'isLogged', value: 'true' });
        Preferences.set({ key: 'user', value: JSON.stringify(matchedUser) });
        this.user = matchedUser;

        // Inviamo l'evento di login
        this.sendLoginEvent();

        return true;
      }
    }

    console.log("Invalid credentials");
    return false;
  }

  logout() {
    Preferences.remove({ key: 'isLogged' });
    Preferences.remove({ key: 'user' });
    this.user = undefined;
    this.nav.navigateRoot('login');
  }

  private sendLoginEvent() {
    // Invia un evento di login
    const event = new CustomEvent('userLoggedIn');
    document.dispatchEvent(event);
  }

  async getUser() {
    if (this.user !== undefined) {
      console.log(this.user)
      return this.user;
    } else {
      let tmp = await Preferences.get({ key: 'user' });
      this.user = JSON.parse(tmp.value!) as User;
      console.log(this.user)
      return this.user;
    }
  }

  updateUser(newUser: User) {
    // Aggiorna l'utente nel database Firebase
    const userRef = ref(this.databaseRef, `users/${newUser.id}`);
    update(userRef, newUser);

    // Qui prima di aggiornare il profilo memorizzato in locale bisognerebbe controllare se la chiamata HTTP Post ha avuto successo! 

    this.user = newUser;
    Preferences.set({ key: 'user', value: JSON.stringify(newUser) });
  }

  async canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    let isLogged: any = await Preferences.get({ key: 'isLogged' });
    if (isLogged.value != null && JSON.parse(isLogged.value)) {
      console.log("Already logged in");
      return true;
    }

    this.nav.navigateRoot('login');
    return false;
  }
}

export const AuthGuard: CanActivateFn = (next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> => {
  return inject(LoginService).canActivate(next, state);
}
