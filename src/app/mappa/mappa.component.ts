import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';

@Component({
  selector: 'app-map',
  template: `
    <div #mapContainer id="map"></div>
  `,
  styleUrls: ['./mappa.component.scss'],
})
export class MapComponent implements OnInit, AfterViewInit {
  @ViewChild('mapContainer', { static: false }) mapContainer: ElementRef<HTMLDivElement> | undefined;
  map: Map | undefined;

  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.initializeMap();
  }

  initializeMap() {
    const mapElement = this.mapContainer?.nativeElement;
    if (mapElement) {
      this.map = new Map({
        target: mapElement,
        layers: [
          new TileLayer({
            source: new OSM({
              attributions: [],
            }),
          }),
        ],
        view: new View({
          center: [0, 0],
          zoom: 18,
        }),
      });
    }
  }
}
