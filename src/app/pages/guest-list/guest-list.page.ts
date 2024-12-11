import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonLabel, IonButton, IonIcon, IonInput, IonButtons, IonBackButton, IonToggle } from '@ionic/angular/standalone';
import { NgFor, AsyncPipe } from '@angular/common';
import { EventService, Guest } from '../../services/event.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-guest-list',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button></ion-back-button>
        </ion-buttons>
        <ion-title>Guest List</ion-title>
        <ion-buttons slot="end">
          <ion-toggle (ionChange)="toggleDarkMode($event)" [checked]="isDarkMode">
            <ion-icon slot="start" [name]="isDarkMode ? 'moon' : 'sunny'"></ion-icon>
          </ion-toggle>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <form [formGroup]="guestForm" (ngSubmit)="addGuest()">
        <ion-item>
          <ion-input formControlName="name" placeholder="New guest name"></ion-input>
          <ion-button slot="end" type="submit" [disabled]="!guestForm.valid">
            <ion-icon name="add" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-item>
      </form>

      <ion-list>
        <ion-item *ngFor="let guest of guests$ | async">
          <ion-label>{{ guest.name }}</ion-label>
          <ion-button slot="end" (click)="removeGuest(guest)">
            <ion-icon name="trash" slot="icon-only"></ion-icon>
          </ion-button>
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
    IonButtons,
    IonBackButton,
    IonToggle,
    NgFor,
    AsyncPipe,
    ReactiveFormsModule
  ],
})
export class GuestListPage implements OnInit {
  eventId: number = 0;
  guests$: Observable<Guest[]>;
  guestForm: FormGroup;
  isDarkMode = false;

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private eventService: EventService
  ) {
    this.guestForm = this.formBuilder.group({
      name: ['', Validators.required]
    });
    this.guests$ = new Observable<Guest[]>();
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.eventId = parseInt(id, 10);
      this.loadGuests();
    }
    this.isDarkMode = document.body.classList.contains('dark');
  }

  private loadGuests() {
    this.guests$ = this.eventService.getGuests(this.eventId);
  }

  async addGuest() {
    if (this.guestForm.valid) {
      await this.eventService.addGuest(this.eventId, this.guestForm.value.name);
      this.guestForm.reset();
      this.loadGuests();
    }
  }

  async removeGuest(guest: Guest) {
    await this.eventService.removeGuest(guest.id);
    this.loadGuests();
  }

  toggleDarkMode(event: CustomEvent) {
    const isDark = event.detail.checked;
    document.body.classList.toggle('dark', isDark);
    this.isDarkMode = isDark;
  }
}
