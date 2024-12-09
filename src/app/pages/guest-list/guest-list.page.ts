import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonLabel, IonButton, IonIcon, IonInput, IonButtons, IonBackButton } from '@ionic/angular/standalone';
import { NgFor } from '@angular/common';
import { EventService, Guest } from '../../services/event.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-guest-list',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button></ion-back-button>
        </ion-buttons>
        <ion-title>Guest List</ion-title>
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
        <ion-item *ngFor="let guest of guests">
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
    ReactiveFormsModule,
    NgFor
  ],
})
export class GuestListPage implements OnInit, OnDestroy {
  eventId: number = 0;
  guests: Guest[] = [];
  guestForm: FormGroup;
  private guestSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private eventService: EventService
  ) {
    this.guestForm = this.formBuilder.group({
      name: ['', Validators.required]
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.eventId = parseInt(id, 10);
      this.loadGuests();
    }
  }

  ngOnDestroy() {
    if (this.guestSubscription) {
      this.guestSubscription.unsubscribe();
    }
  }

  private loadGuests() {
    this.guestSubscription = this.eventService.getGuests(this.eventId)
      .subscribe(guests => {
        this.guests = guests;
      });
  }

  async addGuest() {
    if (this.guestForm.valid) {
      const guestName = this.guestForm.value.name;
      await this.eventService.addGuest(this.eventId, guestName);
      this.guestForm.reset();
    }
  }

  async removeGuest(guest: Guest) {
    await this.eventService.removeGuest(guest.id);
  }
}