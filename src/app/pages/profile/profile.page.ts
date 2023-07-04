import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { User } from 'src/app/models/user.model';
import { LoginService } from 'src/app/services/login.service';
import { PhotoService } from 'src/app/services/photo.service';

import { getDatabase, ref, update, set } from "firebase/database";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  back: boolean = false;
  protected profileFormModel!: FormGroup;
  protected user!: User;

  constructor(
    private formBuilder: FormBuilder,
    private loginService: LoginService,
    private navigationController: NavController,
    private photo: PhotoService,
    public router: Router
  ) { }

  async ngOnInit() {
    const data = this.router.url.split('/');
    console.log(data);
    if (data[1] == 'Home') {
      this.back = true;
    } else {
      this.back = false;
    }

    // Recupero il profilo dell'utente
    this.profileFormModel = this.formBuilder.group({
      name: ['', Validators.compose([Validators.required])],
      surname: ['', Validators.compose([Validators.required])],
      username: ['', Validators.compose([Validators.required])],
      password: [''],
    });

    this.user = (await this.loginService.getUser())!;

    this.profileFormModel.patchValue({
      name: this.user.name,
      surname: this.user.surname,
      username: this.user.username,
      password: this.user.password,
    });
  }

  onSubmit() {
    this.user.name = this.profileFormModel.value.name;
    this.user.surname = this.profileFormModel.value.surname;
    this.user.username = this.profileFormModel.value.username;
    this.user.password = this.profileFormModel.value.password;

    const db = getDatabase();
    const userRef = ref(db, 'users/' + this.user.id);

    const userData = {
      name: this.user.name,
      surname: this.user.surname,
      username: this.user.username,
      password: this.user.password,
      // Aggiungi altri campi dati se necessario
    };

    update(userRef, userData)
      .then(() => {
        console.log('Dati utente salvati correttamente nel database');

        if (this.user.photo && this.user.photo.base64String) {
          const photoRef = ref(db, 'users/' + this.user.id + '/photo');

          const photoData = {
            base64String: this.user.photo.base64String,
            format: this.user.photo.format,
            saved: true
          };

          set(photoRef, photoData)
            .then(() => {
              console.log('Immagine utente salvata correttamente nel database');
              this.navigationController.navigateBack("/tabs");
            })
            .catch((error) => {
              console.error('Errore durante il salvataggio dell\'immagine utente:', error);
            });
        } else {
          this.navigationController.navigateBack("/tabs");
        }
      })
      .catch((error) => {
        console.error('Errore durante il salvataggio dei dati utente:', error);
      });
  }

  onCancel() {
    this.navigationController.back();
  }

  async onTakePhoto() {
    this.user.photo = await this.photo.takeNewPhoto();
    console.log(this.user);
  }
}
