import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonIcon, IonInput, IonTextarea, IonButtons, IonBackButton, IonItem } from '@ionic/angular/standalone';
import { Geolocation } from '@capacitor/geolocation';
import { Camera, CameraResultType } from '@capacitor/camera';
import { EventService, Event } from '../../services/event.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-event-details',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button></ion-back-button>
        </ion-buttons>
        <ion-title>{{ event?.title }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <form [formGroup]="eventForm" (ngSubmit)="saveEvent()">
        <ion-item>
          <ion-input formControlName="title" placeholder="Event Title"></ion-input>
        </ion-item>
        <ion-item>
          <ion-textarea formControlName="description" placeholder="Event Description"></ion-textarea>
        </ion-item>
        <ion-item>
          <ion-input formControlName="location" placeholder="Event Location"></ion-input>
        </ion-item>
        <ion-button expand="block" (click)="getCurrentLocation()">
          <ion-icon name="location" slot="start"></ion-icon>
          Get Current Location
        </ion-button>
        <ion-button expand="block" type="submit" [disabled]="!eventForm.valid">Save Event</ion-button>
      </form>
      <ion-button expand="block" (click)="takePicture()">
        <ion-icon name="camera" slot="start"></ion-icon>
        Take Picture
      </ion-button>
      <ion-button expand="block" [routerLink]="['/guest-list', event?.id]">
        <ion-icon name="people" slot="start"></ion-icon>
        Guest List
      </ion-button>
      <ion-button expand="block" color="danger" (click)="deleteEvent()">
        <ion-icon name="trash" slot="start"></ion-icon>
        Delete Event
      </ion-button>
    </ion-content>
  `,
  standalone: true,
  imports: [
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    IonButton, 
    IonIcon, 
    IonInput,
    IonTextarea,
    IonButtons,
    IonBackButton,
    IonItem,
    ReactiveFormsModule,
    RouterLink
  ],
})
export class EventDetailsPage implements OnInit {
  event: Event | undefined;
  eventForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private notificationService: NotificationService,
    private formBuilder: FormBuilder
  ) {
    this.eventForm = this.formBuilder.group({
      title: ['', Validators.required],
      description: [''],
      location: ['']
    });
  }

  ngOnInit() {
    const eventId = Number(this.route.snapshot.paramMap.get('id'));
    this.eventService.getEvent(eventId).subscribe(event => {
      this.event = event;
      if (this.event) {
        this.eventForm.patchValue(this.event);
      }
    });
  }

  saveEvent() {
    if (this.eventForm.valid && this.event) {
      const updatedEvent: Event = {
        ...this.event,
        title: this.eventForm.value.title,
        description: this.eventForm.value.description,
        location: this.eventForm.value.location
      };
      this.eventService.updateEvent(updatedEvent);
      this.notificationService.log('Event updated');
      this.router.navigate(['/dashboard']);
    }
  }

  deleteEvent() {
    if (this.event) {
      this.eventService.deleteEvent(this.event.id!);
      this.notificationService.log('Event deleted');
      this.router.navigate(['/dashboard']);
    }
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

  async takePicture() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri
      });
      console.log('Captured image:', image);
      this.notificationService.log('Picture taken');
      // Handle the captured image
    } catch (error) {
      console.error('Error taking picture:', error);
      this.notificationService.log('Error taking picture');
    }
  }
}

