import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DestinationService, Destination } from '../services/destination.service';
import { ReservationService } from '../services/reservation.service';

@Component({
  selector: 'app-reserve',
  template: `
    <section class="container py-4" style="max-width: 600px;">
      <h2 class="mb-4">Reservar Destino</h2>

      <div *ngIf="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
      </div>

      <div *ngIf="!loading && !destination" class="alert alert-warning">
        Destino no encontrado
      </div>

      <div *ngIf="destination && !loading">
        <!-- Destination Info Card -->
        <div class="card mb-4">
          <div class="card-body">
            <h3 class="card-title">{{ destination.name }}</h3>
            <p class="card-text text-muted" *ngIf="destination.description">{{ destination.description }}</p>
            <div class="d-flex gap-2 align-items-center">
              <span class="badge bg-secondary" *ngIf="destination.region">{{ destination.region }}</span>
              <span class="badge bg-success">\${{ destination.price }} / persona / día</span>
            </div>
          </div>
        </div>

        <!-- Reservation Form -->
        <div class="card">
          <div class="card-body">
            <h4 class="card-title mb-3">Detalles de la Reserva</h4>

            <div *ngIf="error" class="alert alert-danger alert-dismissible fade show" role="alert">
              {{ error }}
              <button type="button" class="btn-close" (click)="error = ''" aria-label="Close"></button>
            </div>

            <form (ngSubmit)="submitReservation()" #f="ngForm">
              <div class="mb-3">
                <label class="form-label">Número de Personas</label>
                <input 
                  type="number" 
                  class="form-control" 
                  name="people" 
                  [(ngModel)]="people" 
                  min="1" 
                  max="20"
                  required 
                  (ngModelChange)="calculateTotal()" />
              </div>

              <div class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label">Fecha de Llegada</label>
                  <input 
                    type="date" 
                    class="form-control" 
                    name="checkIn" 
                    [(ngModel)]="checkIn" 
                    [min]="minDate"
                    required 
                    (ngModelChange)="calculateTotal()" />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Fecha de Salida</label>
                  <input 
                    type="date" 
                    class="form-control" 
                    name="checkOut" 
                    [(ngModel)]="checkOut" 
                    [min]="checkIn || minDate"
                    required 
                    (ngModelChange)="calculateTotal()" />
                </div>
              </div>

              <!-- Price Summary -->
              <div class="card bg-light mb-3" *ngIf="totalPrice > 0">
                <div class="card-body">
                  <h5 class="card-title">Resumen de Precio</h5>
                  <div class="d-flex justify-content-between mb-2">
                    <span>Precio por persona/día:</span>
                    <strong>\${{ destination.price }}</strong>
                  </div>
                  <div class="d-flex justify-content-between mb-2">
                    <span>Personas:</span>
                    <strong>{{ people }}</strong>
                  </div>
                  <div class="d-flex justify-content-between mb-2">
                    <span>Días:</span>
                    <strong>{{ days }}</strong>
                  </div>
                  <hr>
                  <div class="d-flex justify-content-between">
                    <span class="h5">Total:</span>
                    <strong class="h5 text-success">\${{ totalPrice.toFixed(2) }}</strong>
                  </div>
                </div>
              </div>

              <div class="d-grid gap-2">
                <button 
                  type="submit" 
                  class="btn btn-primary btn-lg" 
                  [disabled]="f.invalid || submitting || !totalPrice">
                  <span *ngIf="submitting" class="spinner-border spinner-border-sm me-2"></span>
                  {{ submitting ? 'Reservando...' : 'Confirmar Reserva' }}
                </button>
                <button type="button" class="btn btn-outline-secondary" (click)="goBack()">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  `
})
export class ReserveComponent implements OnInit {
  destinationId: number = 0;
  destination: Destination | null = null;
  loading = true;
  error = '';
  submitting = false;

  people = 1;
  checkIn = '';
  checkOut = '';
  days = 0;
  totalPrice = 0;
  minDate = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private destService: DestinationService,
    private resService: ReservationService
  ) {
    // Set min date to today
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.destinationId = +params['id'];
      this.loadDestination();
    });
  }

  loadDestination() {
    this.loading = true;
    this.destService.list().subscribe({
      next: (destinations) => {
        this.destination = destinations.find(d => d.id === this.destinationId) || null;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = 'Error al cargar el destino';
      }
    });
  }

  calculateTotal() {
    if (!this.destination || !this.checkIn || !this.checkOut || !this.destination.price) {
      this.totalPrice = 0;
      this.days = 0;
      return;
    }

    const start = new Date(this.checkIn);
    const end = new Date(this.checkOut);
    
    if (end <= start) {
      this.totalPrice = 0;
      this.days = 0;
      return;
    }

    this.days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    this.totalPrice = this.destination.price * this.people * this.days;
  }

  submitReservation() {
    if (!this.checkIn || !this.checkOut) {
      this.error = 'Por favor selecciona las fechas';
      return;
    }

    this.submitting = true;
    this.error = '';

    this.resService.create(this.destinationId, this.people, this.checkIn, this.checkOut).subscribe({
      next: () => {
        this.submitting = false;
        this.router.navigate(['/reservations']);
      },
      error: (err) => {
        this.submitting = false;
        this.error = err.error?.detail || 'Error al crear la reserva';
      }
    });
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
