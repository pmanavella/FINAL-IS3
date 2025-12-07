# decisiones.md

## 1. Justificación Tecnológica

El proyecto utiliza el siguiente stack:
- Frontend: React + Vite
- Backend: Node.js + Express
- Base de datos: SQLite
- Testing: Vitest (frontend), Jest (backend), Cypress (E2E)
- Análisis estático: SonarCloud
- CI/CD: Azure DevOps Pipelines
- Hosting: Render (ambientes QA y PROD separados)

La elección se fundamenta en:
- React: permite una interfaz rápida, modular y moderna.
- Node.js: integra fácilmente herramientas de testing, coverage y CI/CD.
- SonarCloud: agrega análisis estático sin infraestructura adicional.
- Render: hosting simple, gratuito y adecuado para diferenciar QA y PROD.
- Azure DevOps: permite un pipeline CI/CD profesional y automatizado.

---

## 2. Base de Datos: Elección de SQLite

SQLite fue elegida porque:
- No requiere levantar un servidor de base de datos.
- Es gratuita.
- Permite persistencia embebida dentro del backend.
- Funciona perfecto en Render en ambientes QA y PROD.
- Facilita las pruebas y el despliegue.
- Reduce la complejidad y los costos.

Ventajas concretas:
- Simplicidad en el setup.
- Velocidad en pruebas.
- Portabilidad del archivo .sqlite.
- Independencia entre QA y PROD (cada uno con su propia BD).

---

## 3. Análisis de Cobertura: Inicial vs Final

Frontend (Vitest):
- Tests ubicados en frontend/src/__tests__
- Cobertura final aprox: 80% en statements y 84% en líneas.
- Se probaron componentes, lógica de filtros, rutas y servicios mockeados.

Backend (Jest):
- Tests ubicados en backend/__tests__
- Cobertura final aprox: 70% en líneas.
- Se probaron controladores, servicios, validaciones y manejo de errores mockeando la BD.

El nivel de cobertura aumentó tras el agregado de nuevos casos de prueba y mocks.

---

## 4. Análisis Estático con SonarCloud

El pipeline CI ejecuta:
- Preparación del análisis SonarCloud
- Análisis de código
- Publicación del Quality Gate

Resultados:
- Quality Gate: Passed
- Coverage reportado por SonarCloud: 42.4%
- 0 vulnerabilidades
- 0 code smells críticos
- 0 duplicaciones

SonarCloud asegura calidad continua del código.

---

## 5. Pruebas Implementadas

### 5.1 Pruebas Unitarias

Frontend:
- Ubicadas en frontend/src/__tests__
- Mock de API, pruebas de componentes, filtros, rutas y flujos
- Más de 40 tests

Backend:
- Ubicadas en backend/__tests__
- Mock de la base SQLite
- Pruebas de controladores, servicios y validaciones
- Más de 40 tests

### 5.2 Pruebas de Integración

Se consideran integración:
- Backend: interacción entre controladores y servicios mockeados
- Frontend: componentes que dependen de funciones API simuladas

### 5.3 Pruebas E2E con Cypress

Ubicadas en frontend/cypress/e2e.

Validan el flujo real del usuario:
- Listar libros
- Agregar libros
- Navegar entre páginas
- Registrar ventas y préstamos

Estas pruebas simulan la experiencia completa del usuario final.

---

## 6. Pipeline CI/CD

### Stage 1 - CI: Tests + Sonar
Incluye:
- Ejecución de pruebas unitarias
- Reportes de cobertura
- Análisis SonarCloud
- Quality Gate obligatorio

### Stage 2 - QA: Build + Push + Deploy
Incluye:
- Construcción de imágenes Docker
- Push a GHCR
- Deploy automático a QA en Render
- Espera de healthcheck (respuesta 200)
- Cypress E2E opcional

### Stage 3 - PROD: Approval → Deploy
Incluye:
- Aprobación manual obligatoria
- Promoción de imagen a prod
- Build frontend con VITE_ENV=prod
- Deploy al backend y frontend de producción

---

## 7. Generación de Imágenes QA y PROD

Azure DevOps crea imágenes Docker:

docker build -t ghcr.io/pmanavella/books-backend:<tag> backend
docker build -t ghcr.io/pmanavella/books-frontend:<tag> frontend

Luego se suben:

docker push ghcr.io/pmanavella/...

Los webhooks de Render disparan el deploy automático, lo que nos permite garantizar un:

- Versionado controlado
- Igual entorno en QA y PROD
- Deploys reproducibles y consistentes

---

## 8. Reflexión Personal

La combinación de:
- SQLite
- Unit tests
- Cypress E2E
- SonarCloud
- Azure Pipelines
- Render QA/PROD

permitió construir un flujo profesional de DevOps con CI/CD completo, testing automatizado y ambientes diferenciados.

Esto mejora:
- Calidad del software
- Mantenibilidad
- Robustez del ciclo de deploy
- Seguridad del proceso

---

## 9. Conclusión Final

Se implementó:

- Coverage configurado
- Pruebas unitarias reales
- Pruebas E2E reales (Cypress)
- Pruebas de integración
- Análisis estático SonarCloud
- Pipeline CI/CD con stages CI → QA → PROD
- Deploy automático + approval gate
- QA y PROD funcionando en Render
- Evidencias completas en imágenes

El sistema quedó totalmente automatizado y completo.

