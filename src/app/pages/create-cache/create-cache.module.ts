import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreateCachePageRoutingModule } from './create-cache-routing.module';

import { CreateCachePage } from './create-cache.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CreateCachePageRoutingModule
  ],
  declarations: [CreateCachePage]
})
export class CreateCachePageModule {}
