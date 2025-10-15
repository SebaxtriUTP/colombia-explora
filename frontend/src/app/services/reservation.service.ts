import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EnvService } from './env.service';
import { Observable } from 'rxjs';

export interface Reservation {
  id: number;
  user_id: number;
  destination_id: number;
  people: number;
  check_in: string;
  check_out: string;
  total_price: number;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class ReservationService {
  constructor(private http: HttpClient, private env: EnvService) {}
  
  list(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.env.apiUrl}/reservations`);
  }
  
  create(destination_id: number, people: number, check_in: string, check_out: string): Observable<Reservation> {
    return this.http.post<Reservation>(`${this.env.apiUrl}/reservations`, { 
      destination_id, 
      people,
      check_in,
      check_out
    });
  }
}
