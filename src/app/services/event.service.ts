import { Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { NotificationService } from './notification.service';

export interface Event {
  id?: number;
  title: string;
  date: Date;
  description: string;
  location?: string;
  guestList?: Guest[];
}

export interface Guest {
  id: number;
  name: string;
  eventId: number;
}

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private supabase: SupabaseClient;
  private eventsSubject = new BehaviorSubject<Event[]>([]);
  private guestsSubject = new BehaviorSubject<{ [eventId: number]: Guest[] }>({});

  constructor(private notificationService: NotificationService) {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
    this.loadEvents();
  }

  private async loadEvents() {
    const { data, error } = await this.supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      this.notificationService.log(`Error loading events: ${error.message}`);
    } else {
      this.eventsSubject.next(data || []);
    }
  }

  getEvents(): Observable<Event[]> {
    return this.eventsSubject.asObservable();
  }

  getEvent(id: number): Observable<Event | undefined> {
    return from(this.supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          this.notificationService.log(`Error fetching event: ${error.message}`);
          return undefined;
        }
        return data as Event;
      })
    );
  }

  async addEvent(event: Omit<Event, 'id'>): Promise<void> {
    const { data, error } = await this.supabase
      .from('events')
      .insert(event)
      .select();

    if (error) {
      this.notificationService.log(`Error adding event: ${error.message}`);
    } else if (data) {
      this.eventsSubject.next([...this.eventsSubject.value, data[0]]);
      this.scheduleNotification(data[0]);
    }
  }

  async updateEvent(event: Event): Promise<void> {
    const { error } = await this.supabase
      .from('events')
      .update(event)
      .eq('id', event.id);

    if (error) {
      this.notificationService.log(`Error updating event: ${error.message}`);
    } else {
      this.loadEvents();
      this.scheduleNotification(event);
    }
  }

  async deleteEvent(id: number): Promise<void> {
    const { error } = await this.supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) {
      this.notificationService.log(`Error deleting event: ${error.message}`);
    } else {
      this.loadEvents();
    }
  }

  private scheduleNotification(event: Event) {
    const notificationDate = new Date(event.date);
    notificationDate.setHours(notificationDate.getHours() - 1);

    this.notificationService.scheduleNotification(
      'Upcoming Event',
      `${event.title} starts in 1 hour`,
      event.id!,
      { at: notificationDate }
    );
  }

  getGuests(eventId: number): Observable<Guest[]> {
    return from(this.loadGuestsForEvent(eventId)).pipe(
      map(guests => guests || [])
    );
  }

  private async loadGuestsForEvent(eventId: number): Promise<Guest[]> {
    const { data, error } = await this.supabase
      .from('guests')
      .select('*')
      .eq('eventId', eventId)
      .order('name', { ascending: true });

    if (error) {
      this.notificationService.log(`Error fetching guests: ${error.message}`);
      return [];
    }

    const currentGuests = { ...this.guestsSubject.value };
    currentGuests[eventId] = data as Guest[];
    this.guestsSubject.next(currentGuests);
    return data as Guest[];
  }

  async addGuest(eventId: number, guestName: string): Promise<void> {
    const { error } = await this.supabase
      .from('guests')
      .insert([{ name: guestName, eventId }]);

    if (error) {
      this.notificationService.log(`Error adding guest: ${error.message}`);
    } else {
      await this.loadGuestsForEvent(eventId);
      this.notificationService.log('Guest added successfully');
    }
  }

  async removeGuest(guestId: number): Promise<void> {
    const { error, data } = await this.supabase
      .from('guests')
      .delete()
      .eq('id', guestId)
      .select('eventId')
      .single();

    if (error) {
      this.notificationService.log(`Error removing guest: ${error.message}`);
    } else if (data) {
      await this.loadGuestsForEvent(data.eventId);
      this.notificationService.log('Guest removed successfully');
    }
  }
}