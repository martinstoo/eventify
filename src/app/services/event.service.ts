import { Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { NotificationService } from './notification.service';

export interface Event {
  id: number;
  title: string;
  date: string;
  description: string | null;
  location: string | null;
}

export interface Guest {
  id: number;
  name: string;
  event_id: number;
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
    try {
      const { data, error } = await this.supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      this.eventsSubject.next(data || []);
    } catch (error: any) {
      this.notificationService.log(`Error loading events: ${error.message}`);
    }
  }

  getEvents(): Observable<Event[]> {
    return this.eventsSubject.asObservable();
  }

  getEvent(id: number): Observable<Event | undefined> {
    return from(this.supabase
      .from('events')
      .select(`
        *,
        guests (*)
      `)
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
    try {
      const { data, error } = await this.supabase
        .from('events')
        .insert([{
          title: event.title,
          date: event.date,
          description: event.description || null,
          location: event.location || null
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const currentEvents = this.eventsSubject.value;
        this.eventsSubject.next([...currentEvents, data]);
        this.scheduleNotification(data);
      }
    } catch (error: any) {
      this.notificationService.log(`Error adding event: ${error.message}`);
    }
  }

  async updateEvent(event: Event): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('events')
        .update({
          title: event.title,
          date: event.date,
          description: event.description,
          location: event.location
        })
        .eq('id', event.id);

      if (error) throw error;

      await this.loadEvents();
      this.scheduleNotification(event);
    } catch (error: any) {
      this.notificationService.log(`Error updating event: ${error.message}`);
    }
  }

  async deleteEvent(id: number): Promise<void> {
    try {
      await this.supabase
        .from('guests')
        .delete()
        .eq('event_id', id);

      const { error } = await this.supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await this.loadEvents();
    } catch (error: any) {
      this.notificationService.log(`Error deleting event: ${error.message}`);
    }
  }

  getGuests(eventId: number): Observable<Guest[]> {
    return from(this.loadGuestsForEvent(eventId)).pipe(
      tap(guests => {
        const currentGuests = { ...this.guestsSubject.value };
        currentGuests[eventId] = guests;
        this.guestsSubject.next(currentGuests);
      })
    );
  }

  private async loadGuestsForEvent(eventId: number): Promise<Guest[]> {
    try {
      const { data, error } = await this.supabase
        .from('guests')
        .select('*')
        .eq('event_id', eventId)
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      this.notificationService.log(`Error loading guests: ${error.message}`);
      return [];
    }
  }

  async addGuest(eventId: number, guestName: string): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from('guests')
        .insert([{
          name: guestName,
          event_id: eventId
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const currentGuests = { ...this.guestsSubject.value };
        const eventGuests = currentGuests[eventId] || [];
        currentGuests[eventId] = [...eventGuests, data];
        this.guestsSubject.next(currentGuests);
        this.notificationService.log('Guest added successfully');
      }
    } catch (error: any) {
      this.notificationService.log(`Error adding guest: ${error.message}`);
    }
  }

  async removeGuest(guestId: number): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from('guests')
        .delete()
        .eq('id', guestId)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const currentGuests = { ...this.guestsSubject.value };
        const eventId = data.event_id;
        currentGuests[eventId] = (currentGuests[eventId] || []).filter(
          guest => guest.id !== guestId
        );
        this.guestsSubject.next(currentGuests);
        this.notificationService.log('Guest removed successfully');
      }
    } catch (error: any) {
      this.notificationService.log(`Error removing guest: ${error.message}`);
    }
  }

  private scheduleNotification(event: Event) {
    const notificationDate = new Date(event.date);
    notificationDate.setHours(notificationDate.getHours() - 1);

    this.notificationService.scheduleNotification(
      'Upcoming Event',
      `${event.title} starts in 1 hour`,
      event.id,
      { at: notificationDate }
    );
  }
}

