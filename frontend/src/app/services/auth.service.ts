import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EnvService } from './env.service';
import { Observable, map } from 'rxjs';

export interface LoginResponse { access_token: string; token_type: string }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'explora_token';
  constructor(private http: HttpClient, private env: EnvService) {}

  login(username: string, password: string): Observable<void> {
    return this.http.post<LoginResponse>(`${this.env.authUrl}/token`, { username, password })
      .pipe(map(res => { localStorage.setItem(this.tokenKey, res.access_token); }));
  }

  register(username: string, email: string, password: string): Observable<void> {
    return this.http.post<void>(`${this.env.authUrl}/register`, { username, email, password });
  }

  logout(): void { localStorage.removeItem(this.tokenKey); }
  get token(): string | null { return localStorage.getItem(this.tokenKey); }
  get isAuthenticated(): boolean { return !!this.token; }

  get isAdmin(): boolean {
    const token = this.token;
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role === 'admin';
    } catch {
      return false;
    }
  }
}
