import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonLabel, IonButton, IonIcon, IonInput, IonDatetime, IonButtons, IonBackButton, IonToggle } from '@ionic/angular/standalone';
import { DatePipe, NgFor, AsyncPipe } from '@angular/common';
import { EventService, Event } from '../../services/event.service';
import { NotificationService } from '../../services/notification.service';
import { Observable } from 'rxjs';
import { Geolocation } from '@capacitor/geolocation';

@Component({
  selector: 'app-dashboard',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button></ion-back-button>
        </ion-buttons>
        <ion-title>Dashboard</ion-title>
        <ion-buttons slot="end">
          <ion-toggle (ionChange)="toggleDarkMode($event)" [checked]="isDarkMode">
            <ion-icon slot="start" [name]="isDarkMode ? 'moon' : 'sunny'"></ion-icon>
          </ion-toggle>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <form [formGroup]="eventForm" (ngSubmit)="createEvent()">
        <ion-item>
          <ion-input formControlName="title" placeholder="Event Title"></ion-input>
        </ion-item>
        <ion-item>
          <ion-datetime formControlName="date" presentation="date"></ion-datetime>
        </ion-item>
        <ion-item>
          <ion-input formControlName="location" placeholder="Event Location"></ion-input>
        </ion-item>
        <ion-button expand="block" (click)="getCurrentLocation()">
          <ion-icon name="location" slot="start"></ion-icon>
          Get Current Location
        </ion-button>
        <ion-button expand="block" type="submit" [disabled]="!eventForm.valid">Create Event</ion-button>
      </form>
      <ion-list>
        <ion-item *ngFor="let event of events$ | async" [routerLink]="['/event', event.id]">
          <ion-label>
            <h2>{{ event.title }}</h2>
            <p>{{ event.date | date }}</p>
            <p>{{ event.location }}</p>
          </ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  `,
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonIcon,
    IonInput,
    IonDatetime,
    IonButtons,
    IonBackButton,
    IonToggle,
    RouterLink,
    NgFor,
    DatePipe,
    AsyncPipe,
    ReactiveFormsModule
  ],
})
export class DashboardPage implements OnInit {
  events$: Observable<Event[]>;
  eventForm: FormGroup;
  isDarkMode = false;

  constructor(
    private eventService: EventService,
    private notificationService: NotificationService,
    private formBuilder: FormBuilder
  ) {
    this.eventForm = this.formBuilder.group({
      title: ['', Validators.required],
      date: [new Date().toISOString(), Validators.required],
      location: ['']
    });
    this.events$ = this.eventService.getEvents();
  }

  ngOnInit() {
    this.notificationService.requestPermissions();
    this.isDarkMode = document.body.classList.contains('dark');
  }

  createEvent() {
    if (this.eventForm.valid) {
      const eventDate = new Date(this.eventForm.value.date);
      this.eventService.addEvent({
        title: this.eventForm.value.title,
        date: eventDate.toISOString(),
        description: '',
        location: this.eventForm.value.location || null
      });
      this.eventForm.reset();
      this.notificationService.log('Event created');
    }
  }

  toggleDarkMode(event: CustomEvent) {
    const isDark = event.detail.checked;
    document.body.classList.toggle('dark', isDark);
    this.isDarkMode = isDark;
  }

  async getCurrentLocation() {
    try {
      const coordinates = await Geolocation.getCurrentPosition();
      const location = `Lat: ${coordinates.coords.latitude}, Long: ${coordinates.coords.longitude}`;
      this.eventForm.patchValue({ location });
      this.notificationService.log('Location fetched');
    } catch (error) {
      console.error('Error getting location', error);
      this.notificationService.log('Error fetching location');
    }
  }
}

