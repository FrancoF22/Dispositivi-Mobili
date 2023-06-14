import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'news',
        loadChildren: () => import('../news/news.module').then( m => m.NewsPageModule),
      },
      {
        path: 'home',
        loadChildren: () => import('../home/home.module').then( m => m.HomePageModule),
      },
      {
        path: 'create-cache',
        loadChildren: () => import('../create-cache/create-cache.module').then( m => m.CreateCachePageModule),
    },
    {
      path: 'news/:id',
      loadChildren: () => import('../news-detail/news-detail.module').then( m => m.NewsDetailPageModule)
    },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule {}
