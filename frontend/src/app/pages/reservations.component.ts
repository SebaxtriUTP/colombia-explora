import { Component, OnInit } from '@angular/core';
import { Reservation, ReservationService } from '../services/reservation.service';

@Component({
  selector: 'app-reservations',
  template: `
    <section class="container py-4">
      <h2 class="mb-4">Mis Reservas</h2>

      <div *ngIf="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
      </div>

      <div *ngIf="!loading && reservations.length === 0" class="alert alert-info">
        No tienes reservas registradas aún.
      </div>

      <div class="row g-4" *ngIf="!loading && reservations.length > 0">
        <div class="col-md-6 col-lg-4" *ngFor="let r of reservations">
          <div class="card h-100 shadow-sm">
            <div class="card-header bg-primary text-white">
              <strong>Reserva #{{ r.id }}</strong>
            </div>
            <div class="card-body">
              <h5 class="card-title">Destino ID: {{ r.destination_id }}</h5>
              <hr>
              <div class="mb-2">
                <i class="bi bi-people"></i>
                <strong>Personas:</strong> {{ r.people }}
              </div>
              <div class="mb-2">
                <i class="bi bi-calendar-check"></i>
                <strong>Llegada:</strong> {{ r.check_in | date:'mediumDate' }}
              </div>
              <div class="mb-2">
                <i class="bi bi-calendar-x"></i>
                <strong>Salida:</strong> {{ r.check_out | date:'mediumDate' }}
              </div>
              <hr>
              <div class="d-flex justify-content-between align-items-center">
                <span class="text-muted">Total:</span>
                <strong class="h5 text-success mb-0">\${{ r.total_price.toFixed(2) }}</strong>
              </div>
              <div class="text-muted small mt-2">
                Creada: {{ r.created_at | date:'short' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `
})
export class ReservationsComponent implements OnInit {
  reservations: Reservation[] = [];
  loading = false;

  constructor(private svc: ReservationService) {}

  ngOnInit(): void {
    this.loading = true;
    this.svc.list().subscribe({
      next: (r) => {
        this.reservations = r;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
