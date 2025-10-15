import { Injectable } from '@angular/core';

declare global {
  interface Window { __env?: any }
}

@Injectable({ providedIn: 'root' })
export class EnvService {
  get apiUrl(): string {
    return (window.__env?.API_URL as string) || 'http://localhost:8000';
  }
  get authUrl(): string {
    return (window.__env?.AUTH_URL as string) || 'http://localhost:8001';
  }
}
