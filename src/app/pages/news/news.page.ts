import { Component, OnInit } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { News } from 'src/app/models/news.model';
import { NewsService } from 'src/app/services/news.service';

@Component({
  selector: 'app-news',
  templateUrl: './news.page.html',
  styleUrls: ['./news.page.scss'],
})
export class NewsPage implements OnInit {

  protected news!: Observable<News[]>;

  constructor(private newsService: NewsService) { }

  ngOnInit() {
    this.news = this.newsService.getNews();
  }

  doRefresh(event: any) {
    this.news = this.newsService.getNews().pipe(
      tap(() => {
        event.target.complete();
      }
    ))
  }

}
