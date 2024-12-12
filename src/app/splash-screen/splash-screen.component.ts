import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';

@Component({
  selector: 'app-splash-screen',
  template: `
    <ion-content class="ion-padding">
      <div class="splash-container">
        <h1>Eventify</h1>
      </div>
    </ion-content>
  `,
  styles: [`
    .splash-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background-color: #3880ff;
    }
    h1 {
      font-size: 3rem;
      font-weight: bold;
      color: #ffffff;
    }
  `],
  standalone: true,
  imports: [IonContent]
})
export class SplashScreenComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {
    setTimeout(() => {
      this.router.navigate(['/dashboard']);
    }, 3000);
  }
}

