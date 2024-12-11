import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendar, list, camera, sunny, moon, add, trash, people, location, arrowBack } from 'ionicons/icons';

@Component({
  selector: 'app-root',
  template: `
    <ion-app>
      <ion-router-outlet></ion-router-outlet>
    </ion-app>
  `,
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  constructor() {
    addIcons({ calendar, list, camera, sunny, moon, add, trash, people, location, arrowBack });
  }

  ngOnInit() {
    this.initializeTheme();
  }

  private initializeTheme() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    this.setTheme(prefersDark.matches);

    prefersDark.addEventListener('change', (mediaQuery) => this.setTheme(mediaQuery.matches));
  }

  private setTheme(isDark: boolean) {
    document.body.classList.toggle('dark', isDark);
  }
}

