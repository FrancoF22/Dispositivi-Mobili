import { Photo } from "@capacitor/camera";

export class Cache {
  id!: number;
  latitude!: number;
  longitude!: number;
  title!: string;
  description!: string;
  photo!: Photo | null;
  qr!: string;
}
