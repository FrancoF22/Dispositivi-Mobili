import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { MapComponent } from '../mappa/mappa.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, AfterViewInit {
  @ViewChild('mapComponent', { static: false }) mapComponent: MapComponent | undefined;

  constructor(private router: Router) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    if (this.mapComponent) {
      this.mapComponent.initializeMap();
    }
  }

  navigateToSettings() {
    this.router.navigate(['/settings']);
  }
}
