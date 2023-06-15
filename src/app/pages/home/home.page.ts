import { Component, OnInit, ViewChild } from '@angular/core';
import { MapComponent } from '../map/map.component';
import { Geolocation } from '@capacitor/geolocation';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  @ViewChild(MapComponent, { static: false }) mapComponent!: MapComponent;
  mostraFormCreazioneCache = false;
  nomeCache!: String;
  descrizioneCache!: String;
  constructor() { }

  ngOnInit() {
    this.getCurrentPosition();
  }

  async getCurrentPosition() {
    try {
      const position = await Geolocation.getCurrentPosition();
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      this.mapComponent?.setMapCenter(latitude, longitude);
    } catch (error) {
      console.log('Error getting location', error);
    }
  }

  creaCache() {
    this.mapComponent.abilitaSelezionePunto();
    this.mostraFormCreazioneCache = true;
  }

  private abilitaSelezionePunto() {
    // Implementa la logica per attivare la selezione del punto sulla mappa
  }

  salvaCache() {

    this.mapComponent.salvaCache(this.nomeCache, this.descrizioneCache);
    this.mostraFormCreazioneCache = false;
  }
}
