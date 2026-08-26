import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IonContent } from '@ionic/angular';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet, IonContent],
  template: `
    <ion-content>
      <div class="auth-layout">
        <div class="auth-layout__inner">
          <router-outlet></router-outlet>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .auth-layout {
      min-height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--color-background);
      padding: var(--space-5);
    }

    .auth-layout__inner {
      width: 100%;
      max-width: 440px;
    }

    @media (min-width: 768px) {
      .auth-layout {
        background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 50%, var(--color-secondary-dark) 100%);
      }

      .auth-layout__inner {
        max-width: 460px;
      }
    }
  `]
})
export class AuthLayoutComponent {}
