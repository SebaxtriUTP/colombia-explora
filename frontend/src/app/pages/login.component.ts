import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  template: `
    <section class="container py-5" style="max-width: 500px;">
      <div class="card shadow-medium">
        <div class="card-body p-5">
          <div class="text-center mb-4">
            <div style="font-size: 4rem; margin-bottom: 1rem;">🏔️</div>
            <h2 class="fw-bold mb-2" style="color: #2d5f7e;">Bienvenido de Nuevo</h2>
            <p class="text-muted">Inicia sesión para continuar tu aventura</p>
          </div>

          <div *ngIf="error" class="alert alert-danger alert-dismissible fade show shadow-soft" role="alert">
            <i class="fas fa-exclamation-circle me-2"></i>{{ error }}
            <button type="button" class="btn-close" (click)="error = ''" aria-label="Close"></button>
          </div>

          <form (ngSubmit)="submit()" #f="ngForm" class="vstack gap-4">
            <div>
              <label class="form-label">
                <i class="fas fa-user me-2" style="color: #00b09b;"></i>Usuario
              </label>
              <input 
                class="form-control" 
                name="username" 
                [(ngModel)]="username" 
                required 
                placeholder="Ingresa tu usuario"
                autocomplete="username" />
            </div>
            
            <div>
              <label class="form-label">
                <i class="fas fa-lock me-2" style="color: #00b09b;"></i>Contraseña
              </label>
              <input 
                class="form-control" 
                name="password" 
                type="password" 
                [(ngModel)]="password" 
                required 
                placeholder="Ingresa tu contraseña"
                autocomplete="current-password" />
            </div>

            <div class="d-grid">
              <button class="btn btn-primary btn-lg" [disabled]="f.invalid || loading">
                <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
                <i *ngIf="!loading" class="fas fa-sign-in-alt me-2"></i>
                {{ loading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
              </button>
            </div>
          </form>

          <hr class="my-4">

          <div class="text-center">
            <p class="mb-0 text-muted">
              ¿No tienes una cuenta? 
              <a routerLink="/register" class="fw-bold text-decoration-none" style="color: #00b09b;">
                Regístrate aquí
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  `
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  submit() {
    this.loading = true;
    this.error = '';
    this.auth.login(this.username, this.password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.detail || 'Error al iniciar sesión';
      }
    });
  }
}
