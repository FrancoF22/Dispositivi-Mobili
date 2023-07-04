import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.page.html',
  styleUrls: ['./comments.page.scss'],
})
export class CommentsPage implements OnInit {

  cardGenerated: boolean = false;
  generatedCardText: string = '';
  inputText: string = '';
  protected user!: any;

  constructor() { }

  ngOnInit() {
  }

  generateCard() {
    // Esempio: generiamo una card solo se c'è del testo nell'inputText
    if (this.inputText.trim() !== '') {
      this.generatedCardText = this.inputText;
      this.cardGenerated = true;
      this.inputText = ''; // Reset dell'inputText dopo aver generato la card
    }
  }

}
