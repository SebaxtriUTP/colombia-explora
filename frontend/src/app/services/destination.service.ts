import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EnvService } from './env.service';
import { Observable } from 'rxjs';

export interface Destination { id: number; name: string; description?: string; region?: string; price?: number }
export interface CreateDestination { name: string; description?: string; region?: string; price?: number }
export interface UpdateDestination { name?: string; description?: string; region?: string; price?: number }

@Injectable({ providedIn: 'root' })
export class DestinationService {
  constructor(private http: HttpClient, private env: EnvService) {}
  
  list(): Observable<Destination[]> {
    return this.http.get<Destination[]>(`${this.env.apiUrl}/destinations`);
  }
  
  create(payload: CreateDestination): Observable<Destination> {
    return this.http.post<Destination>(`${this.env.apiUrl}/destinations`, payload);
  }
  
  update(id: number, payload: UpdateDestination): Observable<Destination> {
    return this.http.patch<Destination>(`${this.env.apiUrl}/destinations/${id}`, payload);
  }
  
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.env.apiUrl}/destinations/${id}`);
  }
}
