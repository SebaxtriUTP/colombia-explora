# 🤝 Guía de Contribución - Colombia Explora

¡Gracias por tu interés en contribuir a Colombia Explora! Este documento te guiará en el proceso.

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [Cómo Empezar](#cómo-empezar)
- [Proceso de Desarrollo](#proceso-de-desarrollo)
- [Estándares de Código](#estándares-de-código)
- [Commits](#commits)
- [Pull Requests](#pull-requests)
- [Reportar Bugs](#reportar-bugs)

---

## 📜 Código de Conducta

Este proyecto se adhiere a un código de conducta. Al participar, se espera que mantengas un ambiente respetuoso y colaborativo.

---

## 🚀 Cómo Empezar

### 1. Fork y Clona el Repositorio

```bash
# Fork en GitHub, luego:
git clone https://github.com/TU_USUARIO/explora.git
cd explora
```

### 2. Configura el Entorno de Desarrollo

```bash
# Levanta los servicios
docker-compose up --build -d

# Verifica que todo funcione
./scripts/health_check.sh
```

### 3. Crea una Rama para tu Feature

```bash
git checkout -b feature/nombre-descriptivo
# o
git checkout -b fix/descripcion-del-bug
```

---

## 💻 Proceso de Desarrollo

### Estructura de Ramas

- `main` - Rama principal, siempre estable
- `develop` - Rama de desarrollo activo
- `feature/` - Nuevas funcionalidades
- `fix/` - Corrección de bugs
- `hotfix/` - Correcciones urgentes en producción
- `docs/` - Mejoras en documentación

### Workflow

1. **Crea tu rama** desde `develop`
2. **Desarrolla** tu feature/fix
3. **Prueba** localmente
4. **Commit** con mensajes descriptivos
5. **Push** a tu fork
6. **Abre un Pull Request** hacia `develop`

---

## 📏 Estándares de Código

### Python (Backend)

```python
# Usa type hints
def create_reservation(
    user_id: int, 
    destination_id: int, 
    people: int
) -> Reservation:
    pass

# Docstrings para funciones públicas
def calculate_price(price: float, people: int, days: int) -> float:
    """
    Calcula el precio total de una reserva.
    
    Args:
        price: Precio por persona por día
        people: Número de personas
        days: Número de días
        
    Returns:
        Precio total calculado
    """
    return price * people * days

# Nombres descriptivos
destination_service.get_by_id()  # ✅ Bien
dest_svc.get()                   # ❌ Evitar
```

**Herramientas:**
- **Formatter:** `black`
- **Linter:** `flake8`
- **Type checker:** `mypy`

```bash
# Formatea tu código
black api/app/*.py auth/app/*.py

# Verifica linting
flake8 api/ auth/ --max-line-length=100
```

### TypeScript/Angular (Frontend)

```typescript
// Usa tipos explícitos
interface Destination {
  id: number;
  name: string;
  price?: number;
}

// Componentes descriptivos
export class ReservationListComponent implements OnInit {
  // Propiedades públicas primero
  destinations: Destination[] = [];
  
  // Propiedades privadas después
  private destroyed$ = new Subject<void>();
  
  // Constructor con inyección de dependencias
  constructor(
    private destinationService: DestinationService,
    private router: Router
  ) {}
}

// Usa RxJS operators apropiadamente
this.service.getData().pipe(
  takeUntil(this.destroyed$),
  map(data => transform(data))
).subscribe();
```

**Herramientas:**
- **Formatter:** Prettier (integrado)
- **Linter:** ESLint

```bash
cd frontend
npm run lint
npm run format
```

### CSS/SCSS

```scss
// Usa variables para colores
:root {
  --primary-color: #00b09b;
}

// BEM naming convention
.destination-card {
  &__title { }
  &__description { }
  &--featured { }
}

// Mobile-first
.card {
  width: 100%;
  
  @media (min-width: 768px) {
    width: 50%;
  }
}
```

---

## 📝 Commits

### Formato de Commits

Usa [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Tipos:**
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Formato, punto y coma faltante, etc.
- `refactor`: Refactorización de código
- `test`: Agregar tests
- `chore`: Tareas de mantenimiento

**Ejemplos:**

```bash
git commit -m "feat(reservations): add date validation"
git commit -m "fix(auth): resolve JWT expiration issue"
git commit -m "docs(readme): update installation steps"
git commit -m "style(frontend): format home component"
git commit -m "refactor(api): extract price calculation logic"
```

### Commits Atómicos

- Un commit = un cambio lógico
- Commits pequeños y frecuentes
- No mezcles refactoring con features

---

## 🔀 Pull Requests

### Antes de Crear un PR

- ✅ Tu código compila sin errores
- ✅ Los tests pasan
- ✅ Has probado localmente
- ✅ El código sigue los estándares
- ✅ Has actualizado la documentación si es necesario

### Plantilla de PR

```markdown
## 🎯 Descripción

Breve descripción de los cambios realizados.

## 🔗 Issue Relacionado

Closes #123

## 📸 Screenshots (si aplica)

![screenshot](url)

## ✅ Checklist

- [ ] Mi código sigue los estándares del proyecto
- [ ] He agregado tests que prueban mi fix/feature
- [ ] He actualizado la documentación
- [ ] Todos los tests pasan localmente
- [ ] He revisado mi propio código
```

### Proceso de Revisión

1. **CI Checks** - Deben pasar automáticamente
2. **Code Review** - Al menos 1 aprobación requerida
3. **Testing** - Verificación manual si es necesario
4. **Merge** - Squash o merge según el caso

---

## 🐛 Reportar Bugs

### Antes de Reportar

1. **Busca** en issues existentes
2. **Reproduce** el bug localmente
3. **Verifica** que sea realmente un bug

### Plantilla de Bug Report

```markdown
## 🐛 Descripción del Bug

Descripción clara y concisa del bug.

## 🔄 Pasos para Reproducir

1. Ve a '...'
2. Haz click en '...'
3. Scroll hasta '...'
4. Ver error

## ✅ Comportamiento Esperado

Lo que debería pasar.

## ❌ Comportamiento Actual

Lo que realmente pasa.

## 📸 Screenshots

Si aplica, agrega screenshots.

## 🖥️ Entorno

- OS: [e.g. Ubuntu 22.04]
- Docker version: [e.g. 20.10.21]
- Browser: [e.g. Chrome 120]

## 📋 Logs

```
Pega logs relevantes aquí
```

## 💡 Posible Solución (opcional)

Si tienes una idea de cómo arreglarlo.
```

---

## 🧪 Testing

### Backend Tests

```bash
# Ejecutar tests del API
docker exec explora_api pytest

# Con cobertura
docker exec explora_api pytest --cov=app
```

### Frontend Tests

```bash
cd frontend

# Unit tests
npm run test

# E2E tests
npm run e2e
```

---

## 📚 Recursos Útiles

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Angular Documentation](https://angular.io/docs)
- [SQLModel Documentation](https://sqlmodel.tiangolo.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

---

## 🙏 Agradecimientos

¡Gracias por contribuir a Colombia Explora! Cada contribución, grande o pequeña, es valiosa.

---

## ❓ Preguntas

Si tienes preguntas, puedes:

1. Abrir un issue con la etiqueta `question`
2. Contactar a los maintainers
3. Revisar la documentación existente

---

**¡Feliz Coding!** 🚀🏔️
