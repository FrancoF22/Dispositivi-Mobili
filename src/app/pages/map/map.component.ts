import { Component, OnInit, ElementRef, AfterViewInit } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import * as olProj from 'ol/proj';

import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { Style, Icon } from 'ol/style';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit, AfterViewInit {
  map: Map | undefined;

  constructor(private elementRef: ElementRef) { }

  ngOnInit() {
    // ...
  }

  ngAfterViewInit() {
    this.initMap();
  }

  initMap() {
    this.map = new Map({
      target: this.elementRef.nativeElement.querySelector('.map-container'),
      layers: [
        new TileLayer({
          source: new OSM({
            attributions: [],
          }),
        }),
      ],
      view: new View({
        center: [0, 0],
        zoom: 2,
      }),
    });
  }

  setMapCenter(latitude: number, longitude: number) {
    if (this.map) {
      const view = this.map.getView();
      view.setCenter(olProj.fromLonLat([longitude, latitude]));
      view.setZoom(18);

      const markerSource = new VectorSource();
      const markerLayer = new VectorLayer({
        source: markerSource,
      });

      const markerFeature = new Feature({
        geometry: new Point(olProj.fromLonLat([longitude, latitude])),
      });

      const markerStyle = new Style({
        image: new Icon({
          src: '../assets/images/position_marker.jpg',
          anchor: [0.5, 1],
          scale: 0.3,
        }),
      });

      markerFeature.setStyle(markerStyle);
      markerSource.addFeature(markerFeature);

      this.map.addLayer(markerLayer);
    }
  }

}
