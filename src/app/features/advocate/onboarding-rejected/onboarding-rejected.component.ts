import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon, IonLabel, IonButton } from '@ionic/angular';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-onboarding-rejected',
  templateUrl: './onboarding-rejected.component.html',
  styleUrls: ['./onboarding-rejected.component.scss'],
  standalone: true,
  imports: [IonContent, IonIcon, IonLabel, IonButton, CommonModule, RouterModule]
})
export class OnboardingRejectedComponent {
  constructor() {}
}
