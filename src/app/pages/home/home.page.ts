import { Component, OnInit, ViewChild } from '@angular/core';
import { MapComponent } from '../map/map.component';
import { Geolocation, Position } from '@capacitor/geolocation';
import { Cache } from 'src/app/models/cache.model';
import { PhotoService } from 'src/app/services/photo.service';
import { Photo } from '@capacitor/camera';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { getDatabase, push, ref } from 'firebase/database';
import { Found } from '../../models/found.model';
import { LoginService } from 'src/app/services/login.service';
import { Comment } from '../../models/comment.model';
import { Coordinate } from 'ol/coordinate';
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  @ViewChild(MapComponent, { static: false }) mapComponent!: MapComponent;
  mostraFormCreazioneCache = false;
  nomeCache!: string;
  descrizioneCache!: string;
  mostraDettagliCache = false;
  dettagliCache: Cache | null = null;
  capturedPhoto!: Photo;
  watchId: any | undefined;
  qrCodeString = 'cache trovata';
  scannedResult: any;
  content_visibility = '';
  mostraCommento = false;
  testoCommento = '';
  distanzaElevata = false;
  coordinateUtente = [0, 0];
  constructor(private photoService: PhotoService, private loginService: LoginService) {
    this.nomeCache = '';
    this.descrizioneCache = '';
  }

  ngOnInit() {
    this.getCurrentPosition();
    this.centerMap();
  }

  async getCurrentPosition() {
    try {
      const position = await Geolocation.getCurrentPosition();
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      this.coordinateUtente = [longitude, latitude];
    } catch (error) {
      console.log('Error getting location', error);
    }
  }

  centerMap() {
    this.mapComponent?.setMapCenter(this.coordinateUtente[1], this.coordinateUtente[0]);
  }

  apriDettagliCache(cache: Cache) {
    this.dettagliCache = cache;
    const coordinateCache = [this.dettagliCache.longitude, this.dettagliCache.latitude];
  
    if (this.calcolaDistanza(coordinateCache, this.coordinateUtente) > 3) {
      this.distanzaElevata = true
    }
    this.mostraDettagliCache = true;
  }

  creaCache() {
    this.mapComponent.abilitaSelezionePunto();
    this.mostraFormCreazioneCache = true;
  }

  salvaCache(nomeCache: string, descrizioneCache: string, capturedPhoto: any) {
    // Effettua il salvataggio della cache utilizzando il MapComponent
    this.mapComponent.salvaCache(nomeCache, descrizioneCache, capturedPhoto);

    // Nascondi il form di creazione della cache
    this.mostraFormCreazioneCache = false;

    // Resetta i campi del form
    this.nomeCache = '';
    this.descrizioneCache = '';

    // Disabilita la selezione del punto sulla mappa tramite il MapComponent
    this.mapComponent.disabilitaSelezionePunto();
  }

  annullaCreazioneCache() {
    // Nascondi il form di creazione della cache
    this.mostraFormCreazioneCache = false;

    // Resettare i campi del form
    this.nomeCache = '';
    this.descrizioneCache = '';

    // Disabilita la selezione del punto sulla mappa tramite il MapComponent
    this.mapComponent.disabilitaSelezionePunto();
  }

  async openCamera() {
    try {
      const capturedPhoto = await this.photoService.takeNewPhoto();
      this.capturedPhoto = capturedPhoto; // Assegna la foto acquisita a capturedPhoto
    } catch (error) {
      console.log('Error opening camera', error);
    }
  }

  ionViewDidEnter() {
    this.startGeolocationWatch();
  }

  ionViewWillLeave() {
    this.stopGeolocationWatch();
  }

  startGeolocationWatch() {
    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
    };

    // Modifica la firma della callback della funzione watchPosition
    this.watchId = Geolocation.watchPosition(options, (position: Position | null, err) => {
      if (err) {
        console.log('Error in geolocation', err);
        // Gestisci l'errore appropriatamente
        return;
      }

      if (position) { // Controlla se la posizione è valida
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        this.mapComponent?.setMapCenter(latitude, longitude);
      }
    });
  }

  stopGeolocationWatch() {
    if (this.watchId) {
      Geolocation.clearWatch({ id: this.watchId });
    }
  }


  async commentaCache() {
    const User = (await this.loginService.getUser())!; // L'id dell'utente che ha trovato la cache (da sostituire con il valore corretto)
    const idCache = this.dettagliCache?.id || 0; // L'id della cache trovata
    const idUser = User.id;
    if (idCache === 0) {
      // La cache non ha un id valido, gestire l'errore o l'assenza dell'informazione appropriatamente
      return;
    }

    const found: Found = {
      id: 0, // L'id verrà generato automaticamente dal Realtime Database
      idUser,
      idCache
    };

    const database = getDatabase();
    const foundRef = ref(database, 'found');

    push(foundRef, found)
      .then(() => {
        console.log('Cache trovata salvata con successo');
        this.mostraCommento = true;
        // Effettuare eventuali azioni aggiuntive dopo il salvataggio della cache trovata
      })
      .catch((error) => {
        console.error('Errore nel salvataggio della cache trovata', error);
        // Gestire l'errore appropriatamente
      });
  }

  async salvaCommento() {
    const User = (await this.loginService.getUser())!;
    const idUser = User.id;

    if (!this.dettagliCache?.id) {
      console.error('Cache non valida per il commento');
      return;
    }

    const commento: Comment = {
      id: 0,
      idUser,
      idCache: this.dettagliCache.id,
      description: this.testoCommento,
      publishedDate: new Date().toISOString(),
    };

    const database = getDatabase();
    const commentiRef = ref(database, 'commenti');

    push(commentiRef, commento)
      .then(() => {
        console.log('Commento salvato con successo');
        // Eventuali azioni aggiuntive dopo il salvataggio del commento
      })
      .catch((error) => {
        console.error('Errore nel salvataggio del commento', error);
        // Gestione dell'errore appropriatamente
      });

    // Nascondi la card per il commento dopo il salvataggio
    this.mostraCommento = false;
    this.testoCommento = ''; // Resetta il campo di testo del commento
  }


  calcolaDistanza(coordinate1: Coordinate, coordinate2: Coordinate): number {
    const [lat1, lon1] = coordinate1;
    const [lat2, lon2] = coordinate2;

    const degToRad = (deg: number) => deg * (Math.PI / 180);
    const earthRadius = 6371; // Raggio approssimativo della Terra in chilometri

    const dLat = degToRad(lat2 - lat1);
    const dLon = degToRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(degToRad(lat1)) * Math.cos(degToRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = earthRadius * c;
    return distance;
  }

}
