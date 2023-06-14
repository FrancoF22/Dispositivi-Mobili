import { NewsType } from "./newstype.model";

export class News {
  id!: number;
  title!: string;
  description!: string;
  publishedDate!: Date;
  type!: NewsType;
  publishedBy!: string;
}
