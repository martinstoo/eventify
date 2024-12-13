import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { Platform } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { calendar, list, camera, sunny, moon, add, trash, people, location, arrowBack } from 'ionicons/icons';
import { SplashScreen } from '@capacitor/splash-screen';

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
  constructor(private platform: Platform) {
    addIcons({ calendar, list, camera, sunny, moon, add, trash, people, location, arrowBack });
  }

  async ngOnInit() {
    await this.initializeApp();
    this.initializeTheme();
  }

  private async initializeApp() {
    await this.platform.ready();
    // Show splash screen until app is ready
    try {
      await SplashScreen.show({
        showDuration: 3000,
        autoHide: true
      });
    } catch (err) {
      console.error('Error showing splash screen:', err);
    }
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
