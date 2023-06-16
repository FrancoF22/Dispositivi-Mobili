import { Component, OnInit, ElementRef, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import * as olProj from 'ol/proj';
import { tap, catchError } from 'rxjs/operators';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { Style, Icon } from 'ol/style';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Select from 'ol/interaction/Select';
import { Coordinate } from 'ol/coordinate';

import { Cache } from 'src/app/models/cache.model'; // Importa il modello Cache

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit, AfterViewInit {
  map!: Map;

  private selectInteraction!: Select;
  private selectedCoordinates!: Coordinate;
  private markerSource!: VectorSource;
  private markerLayer!: any;
  nomeCache!: string;
  descrizioneCache!: string;
  selectedMarker: Feature | null = null;

  constructor(private elementRef: ElementRef, private http: HttpClient) { }

  ngOnInit() {
    this.initMap();
  }

  ngAfterViewInit() {
    this.map.on('postrender', () => {
      this.caricaCache();
    });
  }

  initMap() {
    this.markerSource = new VectorSource();
    this.markerLayer = new VectorLayer({
      source: this.markerSource,
    });

    this.map = new Map({
      target: this.elementRef.nativeElement.querySelector('.map-container'),
      layers: [
        new TileLayer({
          source: new OSM({
            attributions: [],
          }),
        }),
        this.markerLayer,
      ],
      view: new View({
        center: olProj.fromLonLat([0, 0]),
        zoom: 2,
      }),
    });
  }

  caricaCache() {
    this.http.get<Cache[]>('http://localhost:3000/cache').pipe(
      tap((response: Cache[]) => {
        this.clearMarkers();

        response.forEach((cache: Cache) => {
          const markerFeature = new Feature({
            geometry: new Point(olProj.fromLonLat([cache.longitude, cache.latitude])),
            id: cache.id.toString(),
          });

          const markerStyle = new Style({
            image: new Icon({
              src: '../assets/images/cache_marker.png',
              anchor: [0.5, 1],
              scale: 0.125,
              opacity: 0.9,
            }),
          });

          markerFeature.setStyle(markerStyle);

          const existingFeature = this.markerSource.getFeatureById(cache.id.toString());
          if (existingFeature) {
            this.markerSource.removeFeature(existingFeature);
          }

          this.markerSource.addFeature(markerFeature);
        });
      }),
      catchError((error) => {
        console.error('Errore durante il recupero delle cache:', error);
        throw new Error(error);
      })
    ).subscribe();
  }

  setMapCenter(latitude: number, longitude: number) {
    if (this.map) {
      const view = this.map.getView();
      view.setCenter(olProj.fromLonLat([longitude, latitude]));
      view.setZoom(18);

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
      this.markerSource.clear();
      this.markerSource.addFeature(markerFeature);
    }
  }

  abilitaSelezionePunto() {
    let markerFeature: Feature | null = null;

    // Aggiungi l'evento click per posizionare il marker
    this.map.on('click', (event) => {
      const coordinate = event.coordinate;
      console.log('Coordinate selezionate:', coordinate);

      // Rimuovi il marker temporaneo precedente, se presente
      if (markerFeature) {
        this.markerSource.removeFeature(markerFeature);
      }

      // Crea un nuovo marker temporaneo
      markerFeature = new Feature({
        geometry: new Point(coordinate),
      });

      const markerStyle = new Style({
        image: new Icon({
          src: '../assets/images/marker_temporaneo.png',
          anchor: [0.5, 1],
          scale: 0.06,
        }),
      });

      markerFeature.setStyle(markerStyle);
      this.markerSource.addFeature(markerFeature);
    });
  }

  disabilitaSelezionePunto() {
    if (this.selectInteraction) {
      this.map.removeInteraction(this.selectInteraction);
      this.clearMarkers();
    }
  }

  private clearMarkers() {
    if (this.selectedMarker) {
      this.markerSource.removeFeature(this.selectedMarker);
      this.selectedMarker = null;
    }
  }

  salvaCache(nomeCache: string, descrizioneCache: string) {
    if (nomeCache && descrizioneCache && this.selectedCoordinates) {
      const nuovaCache: Cache = {
        id: 0,
        latitude: this.selectedCoordinates[1],
        longitude: this.selectedCoordinates[0],
        title: nomeCache,
        description: descrizioneCache,
        photo: '',
        qr: '',
      };

      this.http.post<Cache>('http://localhost:3000/cache', nuovaCache).pipe(
        tap((response: Cache) => {
          console.log('Cache creata con successo:', response);
          this.aggiornaMappaConCache(response);
          this.nomeCache = '';
          this.descrizioneCache = '';
          this.clearMarkers();
        }),
        catchError((error) => {
          console.error('Errore durante la creazione della cache:', error);
          throw new Error(error);
        })
      ).subscribe();
    }
    if (this.selectedMarker) {
      this.markerSource.removeFeature(this.selectedMarker);
      this.selectedMarker = null;
    }
  }

  private clearSelection() {
    if (this.selectInteraction) {
      this.selectInteraction.getFeatures().clear();
      this.selectedCoordinates = [NaN, NaN];
    }
  }

  aggiornaMappaConCache(cache: Cache) {
    const markerFeature = new Feature({
      geometry: new Point(olProj.fromLonLat([cache.longitude, cache.latitude])),
    });

    const markerStyle = new Style({
      image: new Icon({
        src: '../assets/images/cache_marker.png',
        anchor: [0.5, 1],
        scale: 0.3,
        opacity: 0.9,
      }),
    });

    markerFeature.setStyle(markerStyle);

    markerFeature.setId(cache.id.toString());

    const existingFeature = this.markerSource.getFeatureById(cache.id.toString());
    if (existingFeature) {
      this.markerSource.removeFeature(existingFeature);
    }

    this.markerSource.addFeature(markerFeature);
  }
}
