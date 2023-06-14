import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NavController, AlertController } from '@ionic/angular';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  protected loginFormModel: FormGroup;

  constructor(private fb: FormBuilder,
              private http: HttpClient,
              private nav: NavController,
              private login: LoginService,
              private alert: AlertController) { 

    this.loginFormModel = fb.group({
      username: ['username', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
  }

  async onSubmit(){

    let username = this.loginFormModel.value.username;
    let pwd = this.loginFormModel.value.password;
    
    let isLogged = await this.login.login(username, pwd);
    if(isLogged){
      console.log("Navigating to /tabs")
      this.nav.navigateRoot('tabs/home');
    } else {
      await this.onWrongCredentials();
    }

  }

  async onWrongCredentials(){
    const a = await this.alert.create({
      header: "Login error",
      message: "Wrong username or password",
      buttons: ["OK"]
    }) 
    
    await a.present();
  }

}
