import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  template: `
    <section class="container py-5" style="max-width: 500px;">
      <div class="card shadow-medium">
        <div class="card-body p-5">
          <div class="text-center mb-4">
            <div style="font-size: 4rem; margin-bottom: 1rem;">🌿</div>
            <h2 class="fw-bold mb-2" style="color: #2d5f7e;">Únete a la Aventura</h2>
            <p class="text-muted">Crea tu cuenta y comienza a explorar</p>
          </div>

          <div *ngIf="error" class="alert alert-danger alert-dismissible fade show shadow-soft" role="alert">
            <i class="fas fa-exclamation-circle me-2"></i>{{ error }}
            <button type="button" class="btn-close" (click)="error = ''" aria-label="Close"></button>
          </div>

          <div *ngIf="success" class="alert alert-success alert-dismissible fade show shadow-soft" role="alert">
            <i class="fas fa-check-circle me-2"></i>{{ success }}
            <button type="button" class="btn-close" (click)="success = ''" aria-label="Close"></button>
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
                placeholder="Elige un nombre de usuario"
                autocomplete="username" />
            </div>

            <div>
              <label class="form-label">
                <i class="fas fa-envelope me-2" style="color: #00b09b;"></i>Email
              </label>
              <input 
                class="form-control" 
                name="email" 
                type="email" 
                [(ngModel)]="email" 
                required 
                placeholder="tu@email.com"
                autocomplete="email" />
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
                placeholder="Crea una contraseña segura"
                autocomplete="new-password" />
              <small class="text-muted">
                <i class="fas fa-info-circle me-1"></i>Mínimo 6 caracteres
              </small>
            </div>

            <div class="d-grid">
              <button class="btn btn-primary btn-lg" [disabled]="f.invalid || loading">
                <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
                <i *ngIf="!loading" class="fas fa-user-plus me-2"></i>
                {{ loading ? 'Creando cuenta...' : 'Crear Cuenta' }}
              </button>
            </div>
          </form>

          <hr class="my-4">

          <div class="text-center">
            <p class="mb-0 text-muted">
              ¿Ya tienes una cuenta? 
              <a routerLink="/login" class="fw-bold text-decoration-none" style="color: #00b09b;">
                Inicia sesión aquí
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  `
})
export class RegisterComponent {
  username = '';
  email = '';
  password = '';
  error = '';
  success = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  submit() {
    this.loading = true;
    this.error = '';
    this.success = '';
    this.auth.register(this.username, this.email, this.password).subscribe({
      next: (res) => {
        this.success = 'Cuenta creada. Iniciando sesión...';
        // Auto-login after successful registration
        this.auth.login(this.username, this.password).subscribe({
          next: () => {
            this.loading = false;
            this.router.navigate(['/']);
          },
          error: (err) => {
            this.loading = false;
            this.error = 'Cuenta creada pero hubo un error al iniciar sesión. Por favor inicia sesión manualmente.';
          }
        });
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.detail || 'Error al crear la cuenta';
      }
    });
  }
}
