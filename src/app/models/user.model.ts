import { Photo } from "@capacitor/camera";

export class User {
  id!: number;
  name!: string;
  surname!: string;
  username!: string;
  password!: string;
  photo!: Photo;
}
