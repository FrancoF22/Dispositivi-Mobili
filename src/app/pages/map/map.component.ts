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
import { PhotoService } from 'src/app/services/photo.service';

import { getDatabase, ref, set, child, onValue, DataSnapshot, push, get, update, query, orderByKey, limitToLast } from "firebase/database";
import { Cache } from 'src/app/models/cache.model'; // Importa il modello Cache
import { toLonLat } from 'ol/proj';
import { HomePage } from '../home/home.page';

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
  private temporaryMarker: Feature | null = null; // Marker temporaneo

  private selectionHandler: any; // Dichiarazione dell'handler
  selectedCache: Cache | null = null;
  constructor(private elementRef: ElementRef, private http: HttpClient, private homePage: HomePage, private photoService: PhotoService) { }

  ngOnInit() {
    this.initMap();
  }

  ngAfterViewInit() {
    this.map.on('postrender', () => {
      this.caricaCache();
    });

    this.map.on('singleclick', (evt: any) => {
      const coordinate = evt.coordinate;
      const feature = this.map.forEachFeatureAtPixel(evt.pixel, (ft: any) => ft);

      if (feature && feature.get('type') === 'cache') {
        const cacheId = feature.get('id');

        const database = getDatabase();
        const cacheRef = ref(database, `cache/${cacheId}`);

        onValue(cacheRef, (snapshot: DataSnapshot) => {
          const cacheData = snapshot.val();

          if (cacheData) {
            const cache: Cache = {
              id: cacheData.id,
              title: cacheData.title,
              description: cacheData.description,
              latitude: cacheData.latitude,
              longitude: cacheData.longitude,
              photo: cacheData.photo,
              qr: '',
            };

            this.homePage.apriDettagliCache(cache);
          }
        });
      }
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
    const database = getDatabase();
    const cacheRef = ref(database, 'cache');

    // Usa la funzione "onValue" per ottenere i dati dal Firebase Realtime Database
    onValue(cacheRef, (snapshot: DataSnapshot) => {
      const cacheData = snapshot.val(); // I dati ottenuti dal Firebase

      // Assicurati che ci siano dati prima di procedere
      if (cacheData) {
        const caches: Cache[] = Object.values(cacheData);

        this.clearMarkers();

        caches.forEach((cache: Cache) => {
          const markerFeature = new Feature({
            geometry: new Point(olProj.fromLonLat([cache.longitude, cache.latitude])),
            id: cache.id.toString(),
            type: 'cache',
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
      }
    }, {
      // Opzioni di ascolto (puoi lasciare vuoto questo oggetto)
    });
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
    // Disattiva l'handler precedente, se presente
    this.disabilitaSelezionePunto();

    // Crea un nuovo handler per la selezione del punto
    this.selectionHandler = (event: any) => {
      const coordinate = event.coordinate;
      const lonLatCoordinate = toLonLat(coordinate);

      console.log('Coordinate selezionate:', lonLatCoordinate);

      // Assegna le coordinate selezionate a selectedCoordinates
      this.selectedCoordinates = lonLatCoordinate;
      // Rimuovi il marker temporaneo precedente, se presente
      if (this.temporaryMarker) {
        this.markerSource.removeFeature(this.temporaryMarker);
      }

      // Crea un nuovo marker temporaneo
      const markerFeature = new Feature({
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
      this.temporaryMarker = markerFeature;
      this.markerSource.addFeature(markerFeature);
    };

    // Aggiungi l'evento di click utilizzando l'handler
    this.map.on('click', this.selectionHandler);
  }


  disabilitaSelezionePunto() {
    // Rimuovi l'evento di click con l'handler
    if (this.selectionHandler) {
      this.map.un('click', this.selectionHandler);
      this.selectionHandler = null;

      // Rimuovi il marker temporaneo, se presente
      if (this.temporaryMarker) {
        this.markerSource.removeFeature(this.temporaryMarker);
        this.temporaryMarker = null;
      }
    }
  }

  private clearMarkers() {
    if (this.selectedMarker) {
      this.markerSource.removeFeature(this.selectedMarker);
      this.selectedMarker = null;
    }
  }

  salvaCache(nomeCache: string, descrizioneCache: string, capturedPhoto: any) {
    if (nomeCache) {
      if (descrizioneCache) {
        if (this.selectedCoordinates) {
          const database = getDatabase();
          const cacheRef = ref(database, 'cache');

          // Ottieni l'ultimo ID delle cache
          // Ottieni l'ultimo ID delle cache
          // Ottieni l'ultimo ID delle cache
          get(query(cacheRef, orderByKey(), limitToLast(1)))
            .then((snapshot) => {
              let lastId = 0;

              snapshot.forEach((childSnapshot) => {
                const cacheId = Number(childSnapshot.key);
                lastId = cacheId;
              });
              const newId = lastId + 1;

              // Crea il riferimento per la nuova cache utilizzando il nuovo ID
              console.log("Creazione di una nuova cache in corso, attendere...");

              const newCacheRef = ref(database, "cache/" + newId.toString());

              // Imposta i dati per la nuova cache
              set(newCacheRef, {
                id: newId, // Imposta l'ID della cache
                title: nomeCache,
                description: descrizioneCache,
                latitude: this.selectedCoordinates[1],
                longitude: this.selectedCoordinates[0],
                photo: capturedPhoto,
              }).then(() => {
                const newCache: Cache = {
                  id: newId,
                  title: nomeCache,
                  description: descrizioneCache,
                  latitude: this.selectedCoordinates[1],
                  longitude: this.selectedCoordinates[0],
                  photo: capturedPhoto, // Inserisci il valore appropriato per la foto
                  qr: '', // Inserisci il valore appropriato per il codice QR
                };

                console.log("Cache creata, caricamento della mappa...");
                this.aggiornaMappaConCache(newCache);

                this.nomeCache = '';
                this.descrizioneCache = '';
                this.clearMarkers();

                console.log("Processo finito, buon divertimento!");
              }).catch((error: any) => {
                console.error('Errore durante il salvataggio della cache:', error);
                throw new Error(error);
              });
            })
            .catch((error: any) => {
              console.error('Errore durante il recupero dell\'ultimo ID delle cache:', error);
              throw new Error(error);
            });


        } else {
          console.log("Il parametro selectedCoordinates è mancante.");
        }
      } else {
        console.log("Il parametro descrizioneCache è mancante.");
      }
    } else {
      console.log("Il parametro nomeCache è mancante.");
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
