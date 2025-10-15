import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-header',
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark" style="background: linear-gradient(135deg, #2d5f7e 0%, #00b09b 100%);">
      <div class="container">
        <a class="navbar-brand" routerLink="/">
          <span style="font-size: 1.5rem;">🌄</span> Colombia Explora
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item"><a class="nav-link" routerLink="/">Inicio</a></li>
            <li class="nav-item" *ngIf="auth.isAuthenticated"><a class="nav-link" routerLink="/reservations">Mis Reservas</a></li>
            <li class="nav-item" *ngIf="auth.isAdmin"><a class="nav-link" routerLink="/admin">Administración</a></li>
            <li class="nav-item" *ngIf="!auth.isAuthenticated"><a class="nav-link" routerLink="/login">Iniciar sesión</a></li>
            <li class="nav-item" *ngIf="!auth.isAuthenticated"><a class="nav-link" routerLink="/register">Registrarse</a></li>
            <li class="nav-item" *ngIf="auth.isAuthenticated">
              <a class="nav-link" href="#" (click)="logout($event)">
                <span style="margin-right: 0.3rem;">👤</span> Salir
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  `
})
export class HeaderComponent {
  constructor(public auth: AuthService, private router: Router) {}
  logout(e: Event) { 
    e.preventDefault();
    this.auth.logout(); 
    this.router.navigate(['/login']);
  }
}
