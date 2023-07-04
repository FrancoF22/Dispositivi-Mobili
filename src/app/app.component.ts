import { Component } from '@angular/core';
import { LoginService } from './services/login.service';
import { NavController } from '@ionic/angular';
import { User } from './models/user.model';
import { icon } from 'leaflet';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})

export class AppComponent {
/**public pages: any[]=[
    {title: 'Home', url:'/home', icon: 'home'},
    {title: 'Profile', url:'/profile', icon: 'persone'},
    {title: 'Comment', url:'/comment', icon: 'cheatbox-outline'},
    {title: 'Review', url:'/review', icon: 'people-outline'},
    {title: 'Sing out', url:'', icon: 'log-out',route: false},
  ]; */

  public pages: any[]=[
    {title: 'Home', url:'/home', icon: 'home'},
    {title: 'Profile', url:'/profile', icon: 'person'},
    // {title: 'Comments', url:'/comments', icon: 'chatbubble'},
    {title: 'Scan', url:'/scan', icon: 'scan'},
    {title: 'Sing out', url:'', icon: 'log-out',route: true},
  ];
  

  protected user: User | undefined

  constructor(private loginService: LoginService,
              private nav: NavController) {}

  
  ngOnInit() {
    // Iscriviti all'evento di login
    document.addEventListener('userLoggedIn', this.onUserLoggedIn.bind(this));

    // Carica i dati dell'utente al primo avvio dell'app
    this.loadUserData();
  }

  private async loadUserData() {
    this.user = await this.loginService.getUser();
  }

  private onUserLoggedIn() {
    // Quando l'utente effettua il login, ricarica i dati dell'utente nel menù
    this.loadUserData();
  }

  onProfile(){
    this.nav.navigateForward("/profile");
  }

  onHome(){
    this.nav.navigateForward("/home");
  }

  onLogout(){
    this.loginService.logout();
  }

}
