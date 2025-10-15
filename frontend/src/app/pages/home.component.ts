import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Destination, DestinationService } from '../services/destination.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  template: `
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="container">
        <h1 class="display-3 fw-bold mb-4">
          🌄 Explora la Magia del Eje Cafetero
        </h1>
        <p class="lead mb-5" style="font-size: 1.4rem;">
          Aventuras de montaña, senderismo y naturaleza a tu alcance.<br>
          Descubre paisajes únicos y vive experiencias inolvidables.
        </p>
        <div class="d-flex justify-content-center gap-3 flex-wrap">
          <button class="btn btn-primary btn-lg" (click)="scrollToDestinations()">
            <i class="fas fa-compass"></i> Ver Destinos
          </button>
          <button 
            *ngIf="!auth.isAuthenticated" 
            class="btn btn-warning btn-lg" 
            routerLink="/register">
            <i class="fas fa-user-plus"></i> Únete Ahora
          </button>
        </div>
      </div>
    </section>

    <!-- Destinations Section -->
    <section class="container py-5" id="destinations">
      <div class="text-center mb-5">
        <h2 class="display-5 fw-bold text-gradient mb-3">Nuestros Destinos</h2>
        <p class="lead text-muted">Elige tu próxima aventura en la naturaleza colombiana</p>
      </div>

      <div *ngIf="loading" class="text-center py-5">
        <div class="spinner-border" style="width: 3rem; height: 3rem;" role="status">
          <span class="visually-hidden">Cargando destinos...</span>
        </div>
        <p class="mt-3 text-muted">Cargando destinos increíbles...</p>
      </div>

      <div *ngIf="!loading && destinations.length === 0" class="alert alert-info shadow-soft" role="alert">
        <i class="fas fa-info-circle me-2"></i>
        No hay destinos disponibles en este momento. ¡Vuelve pronto!
      </div>

      <div class="row g-4" *ngIf="!loading && destinations.length > 0">
        <div class="col-md-6 col-lg-4" *ngFor="let dest of destinations; let i = index" 
             [style.animation-delay]="(i * 0.1) + 's'">
          <div class="card h-100">
            <img 
              [src]="getDestinationImage(i)" 
              class="card-img-top" 
              [alt]="dest.name"
              style="height: 240px; object-fit: cover;">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title" style="color: #2d5f7e;">
                <i class="fas fa-mountain" style="color: #00b09b;"></i> 
                {{ dest.name }}
              </h5>
              <p class="card-text flex-grow-1" *ngIf="dest.description">
                {{ dest.description }}
              </p>
              <div class="mb-3 d-flex gap-2 flex-wrap">
                <span class="badge bg-secondary" *ngIf="dest.region">
                  <i class="fas fa-map-marker-alt"></i> {{ dest.region }}
                </span>
                <span class="badge bg-success" *ngIf="dest.price" style="font-size: 0.95rem;">
                  <i class="fas fa-tag"></i> \${{ dest.price | number:'1.0-0' }} COP / día
                </span>
              </div>
              <button 
                *ngIf="auth.isAuthenticated"
                class="btn btn-primary w-100" 
                (click)="goToReserve(dest.id)">
                <i class="fas fa-calendar-check me-1"></i> Reservar Ahora
              </button>
              <div *ngIf="!auth.isAuthenticated" class="alert alert-warning mb-0 shadow-soft text-center">
                <small>
                  <i class="fas fa-lock me-1"></i>
                  <a routerLink="/login" class="fw-bold text-decoration-none">Inicia sesión</a> para reservar
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Call to Action Section -->
    <section class="py-5" style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);">
      <div class="container text-center">
        <h3 class="fw-bold mb-3" style="color: #2d5f7e;">
          ¿Listo para tu próxima aventura?
        </h3>
        <p class="lead mb-4" style="color: #6c757d;">
          Únete a miles de aventureros que han descubierto la magia de Colombia
        </p>
        <button 
          *ngIf="!auth.isAuthenticated" 
          class="btn btn-primary btn-lg" 
          routerLink="/register">
          <i class="fas fa-rocket me-2"></i> Comienza Tu Viaje
        </button>
        <button 
          *ngIf="auth.isAuthenticated" 
          class="btn btn-primary btn-lg" 
          routerLink="/reservations">
          <i class="fas fa-list-check me-2"></i> Ver Mis Reservas
        </button>
      </div>
    </section>
  `
})
export class HomeComponent implements OnInit {
  destinations: Destination[] = [];
  loading = false;
  
  // Array de imágenes de destinos de naturaleza y montaña
  destinationImages = [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=800&q=80'
  ];
  
  constructor(
    private destSvc: DestinationService, 
    public auth: AuthService,
    private router: Router
  ) {}
  
  ngOnInit(): void { 
    this.loading = true;
    this.destSvc.list().subscribe({
      next: (d) => {
        this.destinations = d;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    }); 
  }
  
  goToReserve(destinationId: number) {
    this.router.navigate(['/reserve', destinationId]);
  }
  
  scrollToDestinations() {
    const element = document.getElementById('destinations');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
  
  getDestinationImage(index: number): string {
    return this.destinationImages[index % this.destinationImages.length];
  }
}
