import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreateCachePage } from './create-cache.page';

const routes: Routes = [
  {
    path: '',
    component: CreateCachePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreateCachePageRoutingModule {}
