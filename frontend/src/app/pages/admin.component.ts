import { Component, OnInit } from '@angular/core';
import { DestinationService } from '../services/destination.service';

@Component({
  selector: 'app-admin',
  template: `
    <section class="container py-4">
      <h2 class="mb-4">Panel de Administración</h2>
      
      <!-- Create Destination Form -->
      <div class="card mb-4">
        <div class="card-header">
          <h3 class="h5 mb-0">Crear Nuevo Destino</h3>
        </div>
        <div class="card-body">
          <div *ngIf="createSuccess" class="alert alert-success alert-dismissible fade show" role="alert">
            {{ createSuccess }}
            <button type="button" class="btn-close" (click)="createSuccess = ''" aria-label="Close"></button>
          </div>
          <div *ngIf="createError" class="alert alert-danger alert-dismissible fade show" role="alert">
            {{ createError }}
            <button type="button" class="btn-close" (click)="createError = ''" aria-label="Close"></button>
          </div>
          
          <form (ngSubmit)="createDestination()" #f="ngForm" class="row g-3">
            <div class="col-md-6">
              <label class="form-label">Nombre</label>
              <input class="form-control" name="name" [(ngModel)]="newDest.name" required />
            </div>
            <div class="col-md-6">
              <label class="form-label">Región</label>
              <input class="form-control" name="region" [(ngModel)]="newDest.region" />
            </div>
            <div class="col-md-6">
              <label class="form-label">Precio</label>
              <input class="form-control" name="price" type="number" [(ngModel)]="newDest.price" />
            </div>
            <div class="col-12">
              <label class="form-label">Descripción</label>
              <textarea class="form-control" name="description" rows="3" [(ngModel)]="newDest.description"></textarea>
            </div>
            <div class="col-12">
              <button class="btn btn-primary" [disabled]="f.invalid || creating">
                <span *ngIf="creating" class="spinner-border spinner-border-sm me-2"></span>
                {{ creating ? 'Creando...' : 'Crear Destino' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Destinations List -->
      <div class="card">
        <div class="card-header">
          <h3 class="h5 mb-0">Destinos Existentes</h3>
        </div>
        <div class="card-body">
          <div *ngIf="loading" class="text-center py-3">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
          </div>
          
          <div *ngIf="!loading && destinations.length === 0" class="text-muted text-center py-3">
            No hay destinos creados aún.
          </div>

          <div class="table-responsive" *ngIf="!loading && destinations.length > 0">
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Región</th>
                  <th>Precio</th>
                  <th>Descripción</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let d of destinations">
                  <td>{{ d.id }}</td>
                  <td>{{ d.name }}</td>
                  <td><span class="badge bg-secondary">{{ d.region }}</span></td>
                  <td>\${{ d.price }}</td>
                  <td>{{ d.description }}</td>
                  <td>
                    <button class="btn btn-sm btn-warning me-1" (click)="startEdit(d)">
                      <i class="bi bi-pencil"></i> Editar
                    </button>
                    <button class="btn btn-sm btn-danger" (click)="confirmDelete(d)">
                      <i class="bi bi-trash"></i> Eliminar
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Edit Modal -->
      <div class="modal fade" [class.show]="editingDest" [style.display]="editingDest ? 'block' : 'none'" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Editar Destino</h5>
              <button type="button" class="btn-close" (click)="cancelEdit()"></button>
            </div>
            <div class="modal-body">
              <div *ngIf="editError" class="alert alert-danger">{{ editError }}</div>
              <form #editForm="ngForm">
                <div class="mb-3">
                  <label class="form-label">Nombre</label>
                  <input class="form-control" name="editName" [(ngModel)]="editData.name" required />
                </div>
                <div class="mb-3">
                  <label class="form-label">Región</label>
                  <input class="form-control" name="editRegion" [(ngModel)]="editData.region" />
                </div>
                <div class="mb-3">
                  <label class="form-label">Precio</label>
                  <input class="form-control" name="editPrice" type="number" [(ngModel)]="editData.price" />
                </div>
                <div class="mb-3">
                  <label class="form-label">Descripción</label>
                  <textarea class="form-control" name="editDescription" rows="3" [(ngModel)]="editData.description"></textarea>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="cancelEdit()">Cancelar</button>
              <button type="button" class="btn btn-primary" (click)="saveEdit()" [disabled]="updating || editForm.invalid">
                <span *ngIf="updating" class="spinner-border spinner-border-sm me-2"></span>
                {{ updating ? 'Guardando...' : 'Guardar Cambios' }}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-backdrop fade" [class.show]="editingDest" *ngIf="editingDest"></div>

      <!-- Delete Confirmation Modal -->
      <div class="modal fade" [class.show]="deletingDest" [style.display]="deletingDest ? 'block' : 'none'" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Confirmar Eliminación</h5>
              <button type="button" class="btn-close" (click)="cancelDelete()"></button>
            </div>
            <div class="modal-body">
              <div *ngIf="deleteError" class="alert alert-danger">{{ deleteError }}</div>
              <p>¿Estás seguro de que deseas eliminar el destino <strong>{{ deletingDest?.name }}</strong>?</p>
              <p class="text-muted">Esta acción no se puede deshacer.</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="cancelDelete()">Cancelar</button>
              <button type="button" class="btn btn-danger" (click)="executeDelete()" [disabled]="deleting">
                <span *ngIf="deleting" class="spinner-border spinner-border-sm me-2"></span>
                {{ deleting ? 'Eliminando...' : 'Eliminar' }}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-backdrop fade" [class.show]="deletingDest" *ngIf="deletingDest"></div>
    </section>
  `
})
export class AdminComponent implements OnInit {
  destinations: any[] = [];
  newDest = { name: '', description: '', region: '', price: 0 };
  createSuccess = '';
  createError = '';
  creating = false;
  loading = false;

  // Edit state
  editingDest: any = null;
  editData = { name: '', description: '', region: '', price: 0 };
  editError = '';
  updating = false;

  // Delete state
  deletingDest: any = null;
  deleteError = '';
  deleting = false;

  constructor(private destinationService: DestinationService) {}

  ngOnInit() {
    this.loadDestinations();
  }

  loadDestinations() {
    this.loading = true;
    this.destinationService.list().subscribe({
      next: (data) => {
        this.destinations = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  createDestination() {
    this.creating = true;
    this.createSuccess = '';
    this.createError = '';
    this.destinationService.create(this.newDest).subscribe({
      next: () => {
        this.createSuccess = 'Destino creado exitosamente';
        this.creating = false;
        this.newDest = { name: '', description: '', region: '', price: 0 };
        this.loadDestinations();
      },
      error: (err) => {
        this.creating = false;
        this.createError = err.error?.detail || 'Error al crear el destino';
      }
    });
  }

  startEdit(dest: any) {
    this.editingDest = dest;
    this.editData = {
      name: dest.name,
      description: dest.description || '',
      region: dest.region || '',
      price: dest.price || 0
    };
    this.editError = '';
  }

  cancelEdit() {
    this.editingDest = null;
    this.editData = { name: '', description: '', region: '', price: 0 };
    this.editError = '';
  }

  saveEdit() {
    if (!this.editingDest) return;
    this.updating = true;
    this.editError = '';
    this.destinationService.update(this.editingDest.id, this.editData).subscribe({
      next: () => {
        this.updating = false;
        this.createSuccess = 'Destino actualizado exitosamente';
        this.cancelEdit();
        this.loadDestinations();
      },
      error: (err) => {
        this.updating = false;
        this.editError = err.error?.detail || 'Error al actualizar el destino';
      }
    });
  }

  confirmDelete(dest: any) {
    this.deletingDest = dest;
    this.deleteError = '';
  }

  cancelDelete() {
    this.deletingDest = null;
    this.deleteError = '';
  }

  executeDelete() {
    if (!this.deletingDest) return;
    this.deleting = true;
    this.deleteError = '';
    this.destinationService.delete(this.deletingDest.id).subscribe({
      next: () => {
        this.deleting = false;
        this.createSuccess = 'Destino eliminado exitosamente';
        this.cancelDelete();
        this.loadDestinations();
      },
      error: (err) => {
        this.deleting = false;
        this.deleteError = err.error?.detail || 'Error al eliminar el destino';
      }
    });
  }
}
