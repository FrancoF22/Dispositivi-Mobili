import { Injectable, inject } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom, take, tap } from 'rxjs';
import { ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot } from '@angular/router';
import { NavController } from '@ionic/angular';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  
  private user: User | undefined; 
  private userURL: string = "http://localhost:3000/users";


  constructor(private http: HttpClient,
              private nav: NavController) { }

  async login(username: string, password: string) {

    // Controlliamo se l'utente ha già fatto login
       // return true

    let isLogged: any = await Preferences.get({key: 'isLogged'}) 
    
    if(isLogged.value != null){
      console.log(isLogged)
      if(JSON.parse(isLogged.value)){
        console.log("Already logged in")
        return true
      }
    }

    // altrimenti facciamo la chiamata http per verificare le credenziali
      // se le credenziali sono corrette
        // return true
      // altrimenti
        // return false

    let url = `http://localhost:3000/users?username=${username}&password=${password}`

    console.log(url);

    let sub = this.http.get(
      url
    ).pipe(
      take(1)
    )
    let result = await lastValueFrom(sub)
    let x = result as Array<User>;
    if(x.length){
      console.log("Valid credentials")
      Preferences.set({key: 'isLogged', value: 'true'})
      Preferences.set({key: 'user', value: JSON.stringify(x[0])})
      this.user = x[0]
      return true
    } else {
      console.log("Invalid credentials")
      return false
    }
  }

  logout(){
    Preferences.remove({key: 'isLogged'})
    Preferences.remove({key: 'user'})
    this.user = undefined
    this.nav.navigateRoot('login');
  }

  async getUser(){
    if (this.user !== undefined){
      return this.user
    } else { 
      let tmp = await Preferences.get({key: 'user'})
      this.user = JSON.parse(tmp.value!)
      return this.user
    } 
  }

  updateUser(newUser: User){
    
    let url = `${this.userURL}/${newUser.id}`
    let rq = this.http.put(url, newUser)
    rq.subscribe()

    // Qui prima di aggiornare il profilo memorizzato in locale bisognerebbe controllare se la chiamata HTTP Post ha avuto successo! 

    this.user = newUser
    Preferences.set({key: 'user', value: JSON.stringify(newUser)})
 
  }

  async canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    let isLogged: any = await Preferences.get({key: 'isLogged'}) 
    if(isLogged.value != null){
      console.log(isLogged)
      if(JSON.parse(isLogged.value)){
        console.log("Already logged in")
        return true
      }
    }  

    this.nav.navigateRoot('login');
    return false
  }

}

export const AuthGuard: CanActivateFn = (next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> => {
  return inject(LoginService).canActivate(next, state);
}
