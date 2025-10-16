# 🐛 Ejemplos Prácticos de Debugging

Esta guía te muestra ejemplos reales de cómo debugear problemas comunes.

---

## 📋 Contenidos

- [Debugging de Autenticación](#debugging-de-autenticación)
- [Debugging de API Calls](#debugging-de-api-calls)
- [Debugging de Database Queries](#debugging-de-database-queries)
- [Debugging de Errores 500](#debugging-de-errores-500)
- [Debugging con Logs](#debugging-con-logs)

---

## 🔐 Debugging de Autenticación

### Problema: "Usuario no puede hacer login"

**Setup en PyCharm:**

1. Abre `auth/app/main.py`
2. Pon breakpoint en línea 85 (función `token`)

```python
@app.post("/token")
async def token(req: TokenRequest, session: AsyncSession = Depends(get_session)):
    # BREAKPOINT AQUÍ (línea 85) ⬇️
    q = select(User).where(User.username == req.username)
    r = await session.exec(q)
    user = r.first()
    # BREAKPOINT AQUÍ (línea 89) ⬇️
    if not user or not pwd_context.verify(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
```

**Ejecutar:**

1. Inicia Auth Service en modo debug en PyCharm
2. Desde el navegador, intenta hacer login
3. El debugger se detendrá en línea 85

**Inspecciona:**

```python
# En la ventana de debug de PyCharm:
req.username  # Ver qué username se está enviando
req.password  # Ver qué password (antes de hashear)

# Avanza hasta línea 89
user          # ¿El usuario existe en la BD?
user.hashed_password  # ¿Cuál es el hash guardado?

# Si user es None → El usuario no existe en la BD
# Si user existe pero pwd_context.verify retorna False → Password incorrecto
```

**Solución común:**
```python
# El usuario no existe → Crearlo manualmente
# Conéctate a PostgreSQL:
docker exec -it explora_postgres_dev psql -U explora -d explora_dev

# Verifica si existe:
SELECT * FROM "user" WHERE username = 'admin';

# Si no existe, reinicia auth para que cree el admin:
# En PyCharm, detén el debug y vuelve a ejecutar
```

---

## 📡 Debugging de API Calls

### Problema: "Frontend no carga los destinos"

**Setup en PyCharm:**

1. Abre `api/app/main.py`
2. Pon breakpoint en línea 87 (función `list_destinations`)

```python
@app.get("/destinations")
async def list_destinations(session: AsyncSession = Depends(get_session)):
    # BREAKPOINT AQUÍ (línea 87) ⬇️
    result = await session.exec(select(Destination))
    destinations = result.all()
    # BREAKPOINT AQUÍ (línea 89) ⬇️
    return destinations
```

**Ejecutar:**

1. Inicia API Service en modo debug
2. Abre el navegador en `http://localhost:4200`
3. El debugger se detendrá cuando el frontend llame a `/destinations`

**Inspecciona:**

```python
# Primera pausa (línea 87):
session  # ¿La sesión de DB está activa?

# Segunda pausa (línea 89):
destinations  # ¿Qué hay en la lista?
len(destinations)  # ¿Cuántos destinos hay?

# Si destinations está vacío → No hay datos en la BD
# Si destinations tiene datos → El problema está en el frontend
```

**Agregar datos de prueba:**

```python
# Si la BD está vacía, agrégalos desde la consola de debug:

# En la ventana "Console" de PyCharm durante el debug:
from .models import Destination

# Crea un destino
dest = Destination(
    name="Salento",
    description="Pueblo colorido del Eje Cafetero",
    region="Quindío",
    price=150000.0
)
session.add(dest)
await session.commit()

# Ahora reinicia la request desde el navegador
```

---

## 🗄️ Debugging de Database Queries

### Problema: "Error al crear una reserva"

**Setup en PyCharm:**

1. Abre `api/app/main.py`
2. Pon breakpoint en la función `create_reservation`

```python
@app.post("/reservations")
async def create_reservation(body: ReservationCreate, session: AsyncSession = Depends(get_session), payload=Depends(require_token)):
    # BREAKPOINT AQUÍ ⬇️
    if body.check_out <= body.check_in:
        raise HTTPException(status_code=400, detail="Check-out date must be after check-in date")
    
    # BREAKPOINT AQUÍ ⬇️
    q = select(Destination).where(Destination.id == body.destination_id)
    r = await session.exec(q)
    dest = r.first()
    
    # BREAKPOINT AQUÍ ⬇️
    if not dest:
        raise HTTPException(status_code=404, detail="Destination not found")
    
    # BREAKPOINT AQUÍ ⬇️
    days = (body.check_out - body.check_in).days
    total_price = dest.price * body.people * days
    
    reservation = Reservation(
        user_id=payload["user_id"],
        destination_id=body.destination_id,
        people=body.people,
        check_in=body.check_in,
        check_out=body.check_out,
        total_price=total_price,
        status="pending"
    )
    
    # BREAKPOINT AQUÍ ⬇️
    session.add(reservation)
    await session.commit()
    await session.refresh(reservation)
    return reservation
```

**Inspecciona paso a paso:**

```python
# Breakpoint 1: Validar fechas
body.check_in   # Ej: 2025-10-20
body.check_out  # Ej: 2025-10-25
# Si check_out <= check_in → HTTPException 400

# Breakpoint 2: Buscar destino
body.destination_id  # Ej: 1
dest                 # ¿Existe el destino?

# Breakpoint 3: Verificar que existe
# Si dest es None → El destino no existe en la BD

# Breakpoint 4: Calcular precio
days         # Ej: 5
dest.price   # Ej: 150000.0
body.people  # Ej: 2
total_price  # Ej: 1500000.0 (150000 * 2 * 5)

# Breakpoint 5: Guardar en BD
reservation.user_id      # Del token JWT
reservation.total_price  # Calculado
```

**Error común:**

```python
# Si falla en session.commit():
# - Ver el error en la consola
# - Usualmente es un constraint de BD (foreign key, null, etc.)

# Ejemplo: "user_id not found"
# Solución: El user_id del token no existe en la tabla user
```

---

## ⚠️ Debugging de Errores 500

### Problema: "Internal Server Error 500"

**Estrategia:**

Los errores 500 usualmente son **excepciones no capturadas**. El debugger te mostrará exactamente dónde.

**Setup:**

1. Reproduce el error (haz la request que falla)
2. PyCharm automáticamente se detiene en la excepción
3. Inspecciona el traceback

**Ejemplo:**

```python
# Supongamos que tienes este código con un bug:
@app.post("/destinations")
async def create_destination(dest: Destination, session: AsyncSession = Depends(get_session), payload=Depends(require_admin)):
    # Bug: olvidaste validar que dest.price no sea None
    total_cost = dest.price * 1.2  # Si dest.price es None → TypeError!
    session.add(dest)
    await session.commit()
    return dest
```

**Cuando ejecutas:**

1. El debugger se detiene en la línea del error:
   ```
   TypeError: unsupported operand type(s) for *: 'NoneType' and 'float'
   ```

2. Inspecciona:
   ```python
   dest.price  # None ← AH! El problema está aquí
   ```

3. Fix:
   ```python
   if dest.price is None:
       raise HTTPException(status_code=400, detail="Price is required")
   total_cost = dest.price * 1.2
   ```

---

## 📝 Debugging con Logs

Si prefieres usar logs en lugar de breakpoints:

### Configurar logging

```python
# En auth/app/main.py o api/app/main.py
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

@app.post("/token")
async def token(req: TokenRequest, session: AsyncSession = Depends(get_session)):
    logger.info(f"Login attempt for user: {req.username}")
    
    q = select(User).where(User.username == req.username)
    r = await session.exec(q)
    user = r.first()
    
    if not user:
        logger.warning(f"User not found: {req.username}")
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    logger.debug(f"User found: {user.username}, role: {user.role}")
    
    if not pwd_context.verify(req.password, user.hashed_password):
        logger.warning(f"Invalid password for user: {req.username}")
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    logger.info(f"Login successful for user: {req.username}")
    # ...
```

**Ver los logs:**

```bash
# En la terminal donde ejecutaste uvicorn verás:
INFO:     Login attempt for user: admin
DEBUG:    User found: admin, role: admin
INFO:     Login successful for user: admin
```

---

## 🔍 Debugging de Queries SQL

### Ver las queries SQL que se ejecutan

```python
# En auth/app/db.py o api/app/db.py
from sqlalchemy import event
from sqlalchemy.engine import Engine
import logging

logging.basicConfig()
logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)

# Esto imprimirá todas las queries SQL en la consola
```

**Ejemplo de output:**

```sql
SELECT user.id, user.username, user.email, user.hashed_password, user.role 
FROM user 
WHERE user.username = ?
-- ('admin',)
```

---

## 🛠️ Herramientas Adicionales

### 1. PostgreSQL UI (pgAdmin)

```bash
# Iniciar pgAdmin (incluido en docker-compose.dev.yml)
docker-compose -f docker-compose.dev.yml --profile tools up -d pgadmin

# Abrir en: http://localhost:5050
# Email: admin@explora.com
# Password: admin
```

### 2. FastAPI Docs Interactivas

```
http://localhost:8001/docs  # Auth Service
http://localhost:8000/docs  # API Service
```

Puedes probar endpoints directamente desde ahí con "Try it out".

### 3. curl para requests rápidas

```bash
# Login
curl -X POST http://localhost:8001/token \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Listar destinos
curl http://localhost:8000/destinations

# Crear destino (necesitas token)
TOKEN="<tu_token_aquí>"
curl -X POST http://localhost:8000/destinations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cocora Valley",
    "description": "Valle de palmas de cera",
    "region": "Quindío",
    "price": 50000
  }'
```

---

## 💡 Tips Generales

1. **Usa breakpoints condicionales:**
   ```python
   # Clic derecho en el breakpoint → Condition
   # Ej: req.username == "admin"
   # Solo se detiene si el username es "admin"
   ```

2. **Evalúa expresiones en tiempo real:**
   ```python
   # En la ventana "Evaluate Expression" de PyCharm
   # Puedes ejecutar código Python mientras está pausado
   len(destinations)
   user.role
   pwd_context.hash("newpassword")
   ```

3. **Step Over vs Step Into:**
   - **Step Over (F8):** Ejecuta la línea completa
   - **Step Into (F7):** Entra en la función
   - **Step Out (Shift+F8):** Sale de la función actual

4. **Resume Program:**
   - **F9:** Continúa hasta el siguiente breakpoint

---

## 🆘 Problemas Comunes

| Síntoma | Causa Probable | Solución |
|---------|----------------|----------|
| Breakpoint no se activa | Código no se está ejecutando | Verifica que la request llegue al endpoint |
| "Module not found" | Virtualenv no activado | `source venv/bin/activate` |
| "Connection refused" | PostgreSQL no está corriendo | `docker-compose -f docker-compose.dev.yml up -d postgres` |
| Cambios no se reflejan | Hot reload desactivado | Asegúrate de tener `--reload` en uvicorn |
| Error de import | Dependencias faltantes | `pip install -r requirements.txt` |

---

**¿Más preguntas?** Consulta [DEVELOPMENT.md](DEVELOPMENT.md) para la guía completa.
