import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HomePageRoutingModule } from './home-routing.module';

import { HomePage } from './home.page';
import { MapComponent } from '../map/map.component';
import { ScanPageRoutingModule } from '../scan/scan-routing.module';
import { QRCodeModule } from 'angularx-qrcode';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    ScanPageRoutingModule,
    QRCodeModule
  ],
  declarations: [HomePage, MapComponent]
})
export class HomePageModule {}
