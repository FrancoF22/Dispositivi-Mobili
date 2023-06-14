import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { User } from 'src/app/models/user.model';
import { LoginService } from 'src/app/services/login.service';
import { PhotoService } from 'src/app/services/photo.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  protected profileFormModel!: FormGroup;
  protected user!: User 

  constructor(private formBuilder: FormBuilder, 
              private loginService: LoginService,
              private navigationController: NavController,
              private photo: PhotoService ) { }

    async ngOnInit() {
    // Recupero il profilo dell'utente

    this.profileFormModel = this.formBuilder.group({
      username: ['', Validators.compose([
        Validators.required
      ])],
      password: ['']
    });

    this.user = (await this.loginService.getUser())!

    this.profileFormModel.patchValue({username: this.user.username, password: this.user.password});
  }

  onSubmit(){
    // Qua bisognerebbe anche fare una richiesta HTTP al server per aggiornare le informazioni salvate in remoto (non fatto a lezione per limiti di tempo)
    this.user.username = this.profileFormModel.value.username;
    this.user.password = this.profileFormModel.value.password;

    console.log(this.user)
    
    this.loginService.updateUser(this.user);
    this.navigationController.navigateBack("/tabs"); 
  }

  onCancel(){
    this.navigationController.back();
  }

  async onTakePhoto(){
    this.user.photo = await this.photo.takeNewPhoto();
    console.log(this.user)
  }

}
