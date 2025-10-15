# Taller Colaborativo: Construyendo una Aplicación en Contenedores

## Resumen del Taller

Este taller consiste en crear y mejorar una aplicación web basada en contenedores Docker, integrando servicios de aplicación, base de datos y administración, aplicando principios de arquitectura cloud y buenas prácticas de documentación.

---

## 1. Indicadores de Logro
- [x] Identifica y explica la función de los contenedores dentro de una aplicación distribuida
- [x] Comprende y modifica correctamente los archivos de configuración (Dockerfile, .env, docker-compose.yml)
- [x] Mejora y ejecuta un sistema web dentro de contenedores interconectados
- [x] Aplica buenas prácticas de documentación y control de cambios
- [x] Sustenta el funcionamiento técnico y conceptual del entorno montado en Docker

---

## 2. Equivalencias de Servicios en la Nube
| Servicio     | Tecnología      | Función                       | Equivalente en la nube         |
|--------------|----------------|-------------------------------|-------------------------------|
| app          | FastAPI/Angular| Lógica y presentación         | EC2/App Service/Compute Engine|
| db           | PostgreSQL      | Almacenamiento persistente    | RDS/Cloud SQL                 |
| admin        | N/A            | Administración visual (no aplica en este stack) | Consola RDS/Cloud Console |

---

## 3. Conceptos Clave
- **Contenedor:** Unidad ligera que incluye todo lo necesario para ejecutar una app
- **Imagen:** Plantilla base para crear contenedores
- **Dockerfile:** Define cómo se construye una imagen personalizada
- **docker-compose.yml:** Orquesta varios contenedores que trabajan juntos
- **Volumen:** Carpeta especial para datos persistentes
- **Red interna:** Permite comunicación entre servicios usando nombres de host

---

## 4. Revisión del Entorno Docker
- app: Servicio FastAPI/Angular (antes PHP/Apache)
- db: Servicio PostgreSQL (antes MySQL)
- Volumen: Carpeta `data/postgres` para persistencia
- Archivo `.env`: Variables de entorno (usuarios, contraseñas, puertos)
- Archivo `docker-compose.yml`: Define servicios, redes, puertos y volúmenes

---

## 5. Activación del Entorno
```bash
docker-compose down -v
docker-compose up -d --build
docker ps
```
Servicios esperados:
- api (FastAPI) → Up
- auth (FastAPI) → Up
- frontend (Angular) → Up
- postgres (DB) → Up

---

## 6. Mejoras Realizadas
### Interfaz y Usabilidad (Frontend)
- [x] Diseño profesional con Angular y SCSS
- [x] Hero section animada, cards con sombras 3D, botones modernos
- [x] Footer con iconos sociales y layout responsive
- [x] Validaciones visuales en formularios (Angular)

### Lógica del Servidor (Backend)
- [x] API RESTful con FastAPI
- [x] Validaciones de datos y autenticación JWT
- [x] Mensajes claros de error y confirmación
- [x] Conexión a PostgreSQL documentada en README

### Base de Datos
- [x] Migraciones automáticas y persistencia en volumen
- [x] Pruebas de inserción y consulta con endpoints y scripts

### Documentación
- [x] README.md completo con arquitectura, comandos y capturas
- [x] Scripts automáticos (`quick_start.sh`, `health_check.sh`)
- [x] Explicación de persistencia y arquitectura cloud

---

## 7. Reflexión Final
### Preguntas y Respuestas

**1. ¿Qué diferencia hay entre un contenedor y una máquina virtual?**
- Un contenedor comparte el kernel del host y es mucho más ligero; una VM emula hardware completo y es más pesada.

**2. ¿Qué pasaría si se elimina el contenedor de la base de datos pero no el volumen?**
- Los datos permanecen intactos en el volumen y se recuperan al crear un nuevo contenedor.

**3. ¿Qué rol cumple el archivo docker-compose.yml en la orquestación de servicios?**
- Define y coordina todos los servicios, redes, volúmenes y variables de entorno en un solo archivo.

**4. ¿Cómo se comunican los contenedores entre sí dentro de la red interna?**
- Usan el nombre del servicio como host y una red bridge interna de Docker.

**5. ¿Por qué es importante separar la aplicación web del motor de base de datos?**
- Permite escalabilidad, seguridad y mantenimiento independiente de cada componente.

**6. ¿Qué ventajas tiene Docker frente a un hosting tradicional?**
- Portabilidad, reproducibilidad, fácil escalado, menor consumo de recursos y despliegue automatizado.

**7. ¿Qué elementos del ejercicio serían equivalentes a servicios en AWS o Azure?**
- EC2/App Service (app), RDS/Cloud SQL (db), Cloud Console (admin visual)

**8. ¿Cómo se evidenció el trabajo colaborativo dentro del equipo?**
- ()

---

## 8. Comandos Ejecutados
```bash
docker-compose down -v
docker-compose up -d --build
docker ps
./scripts/quick_start.sh
./scripts/health_check.sh
```

---

## 9. Persistencia de Datos
- Los datos de la base de datos se almacenan en el volumen `data/postgres`, que persiste aunque el contenedor se elimine.

---

## 10. Capturas y Ejemplos
- ()

---

## 11. Objetivo del Ejercicio
Construir y mejorar una aplicación web contenedorizada, aplicando buenas prácticas de arquitectura cloud y documentación.

---

## 12. Sustentación
- Mejoras implementadas: Diseño profesional, validaciones, persistencia, documentación
- Comunicación entre contenedores: Red interna Docker, nombres de host
- Persistencia: Volumen de datos
- Aprendizaje: Modularidad, arquitectura cloud, automatización
