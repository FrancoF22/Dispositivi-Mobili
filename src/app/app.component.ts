import { Component } from '@angular/core';
import { LoginService } from './services/login.service';
import { NavController } from '@ionic/angular';
import { User } from './models/user.model';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})

export class AppComponent {

  protected user: User | undefined

  constructor(private loginService: LoginService,
              private nav: NavController) {}

  
  async ngOnInit(){
    this.user = await this.loginService.getUser()
  }  

  onProfile(){
    this.nav.navigateForward("/profile");
  }

  onLogout(){
    this.loginService.logout();
  }

}
