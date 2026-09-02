import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';

@Component({
  selector: 'app-advocate-citations',
  templateUrl: './advocate-citations.page.html',
  styleUrls: ['./advocate-citations.page.scss'],
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class AdvocateCitationsPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
