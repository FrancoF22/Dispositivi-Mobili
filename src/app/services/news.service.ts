import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { News } from '../models/news.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class NewsService {

  private newsURL = 'http://localhost:3000/news'

  constructor(private http: HttpClient) { }

  getNews():Observable<News[]> {
    return this.http.get<News[]>(this.newsURL)
  } 

  getNewsById(id:number):Observable<News>{
    return this.http.get<News>(`${this.newsURL}\\${id}`)
  }

}
