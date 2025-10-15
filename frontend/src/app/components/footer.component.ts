import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-footer',
  encapsulation: ViewEncapsulation.None,
  template: `
    <footer class="custom-footer">
      <div class="container">
        <div class="row py-4">
          <!-- Columna 1: Información -->
          <div class="col-md-4 mb-4 mb-md-0">
            <h5 class="fw-bold mb-3" style="color: white;">
              <i class="fas fa-mountain me-2"></i>Colombia Explora
            </h5>
            <p style="color: rgba(255, 255, 255, 0.85); font-size: 0.95rem; line-height: 1.6;">
              Tu puerta de entrada a la aventura y la naturaleza del Eje Cafetero. 
              Descubre paisajes únicos y vive experiencias inolvidables.
            </p>
          </div>
          
          <!-- Columna 2: Enlaces Rápidos -->
          <div class="col-md-4 mb-4 mb-md-0">
            <h6 class="fw-bold mb-3" style="color: white;">Enlaces Rápidos</h6>
            <ul class="list-unstyled footer-links">
              <li><a routerLink="/">
                <i class="fas fa-home me-2"></i>Inicio
              </a></li>
              <li><a routerLink="/login">
                <i class="fas fa-sign-in-alt me-2"></i>Iniciar Sesión
              </a></li>
              <li><a routerLink="/register">
                <i class="fas fa-user-plus me-2"></i>Registrarse
              </a></li>
              <li><a href="#" (click)="$event.preventDefault()">
                <i class="fas fa-phone me-2"></i>Contacto
              </a></li>
            </ul>
          </div>
          
          <!-- Columna 3: Síguenos -->
          <div class="col-md-4 text-center text-md-start">
            <h6 class="fw-bold mb-3" style="color: white;">Síguenos</h6>
            <div class="social-icons-grid">
              <a href="#" title="Facebook" aria-label="Facebook">
                <i class="fab fa-facebook-f"></i>
              </a>
              <a href="#" title="Instagram" aria-label="Instagram">
                <i class="fab fa-instagram"></i>
              </a>
              <a href="#" title="Twitter" aria-label="Twitter">
                <i class="fab fa-twitter"></i>
              </a>
              <a href="#" title="YouTube" aria-label="YouTube">
                <i class="fab fa-youtube"></i>
              </a>
              <a href="#" title="WhatsApp" aria-label="WhatsApp">
                <i class="fab fa-whatsapp"></i>
              </a>
              <a href="#" title="TripAdvisor" aria-label="TripAdvisor">
                <i class="fab fa-tripadvisor"></i>
              </a>
            </div>
            <p class="mt-3 mb-0" style="color: rgba(255, 255, 255, 0.85); font-size: 0.9rem;">
              <i class="fas fa-envelope me-2"></i>info@colombiaexplora.com
            </p>
          </div>
        </div>
        
        <!-- Línea divisoria -->
        <hr style="border-color: rgba(255, 255, 255, 0.2); margin: 0;">
        
        <!-- Footer Bottom -->
        <div class="py-3">
          <div class="row align-items-center">
            <div class="col-md-6 text-center text-md-start mb-2 mb-md-0">
              <p class="mb-0" style="font-size: 0.9rem; color: rgba(255, 255, 255, 0.8);">
                &copy; {{year}} Colombia Explora. Todos los derechos reservados.
              </p>
            </div>
            <div class="col-md-6 text-center text-md-end">
              <a href="#" class="footer-legal-link me-3">Términos y Condiciones</a>
              <a href="#" class="footer-legal-link me-3">Privacidad</a>
              <a href="#" class="footer-legal-link">Cookies</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent { year = new Date().getFullYear(); }
