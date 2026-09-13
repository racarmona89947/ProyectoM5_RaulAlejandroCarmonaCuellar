# NexoMarket

AI Driven E-Commerce desarrollado para el Proyecto Integrador de Henry y el contexto de cliente de Patagonix Tech.

## Estado del proyecto

Etapa 5 completada: React 18, TypeScript, autenticación Firebase, catálogo Firestore, header funcional, modo claro/oscuro, carrito con `useReducer`, checkout simulado, historial de órdenes y panel administrativo.

El checkout valida el carrito contra Firestore dentro de una transacción: recalcula precios, comprueba stock, descuenta cantidades y crea la orden en estado `pending`. Los estados disponibles son `pending`, `processing`, `shipped`, `completed` y `cancelled`.

Pendiente: deploy público y documentación final de producción.

## Tecnologías

- React 18 + TypeScript + Vite
- React Router
- TailwindCSS
- Firebase Authentication y Cloud Firestore
- AWS S3 mediante presigned URLs
- Vercel Serverless Functions
- Vitest y React Testing Library

## Instalación

```bash
npm install
```

Copia `.env.example` como `.env` y completa las variables. `.env` está excluido del repositorio.

## Comandos ejecutados durante el desarrollo

### Creación e instalación

```bash
npm create vite@latest ProyectoM5_RaulAlejandroCarmonaCuellar -- --template react-ts
npm install react-router-dom firebase tailwindcss @tailwindcss/vite --no-audit --no-fund
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom --no-audit --no-fund
npm install -D @vitest/coverage-v8 --no-audit --no-fund
```

### Desarrollo y validación

```bash
npm run dev
npm run typecheck
npm run test
npm run test:coverage
npm run lint
npm run build
```

## Scripts

| Script | Propósito |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run typecheck` | Comprobación TypeScript |
| `npm run test` | Tests unitarios e integración |
| `npm run test:coverage` | Reporte de cobertura |
| `npm run lint` | ESLint |
| `npm run build` | Build de producción |

## Arquitectura

```text
src/
├── components/   # UI reutilizable y MarketplaceHeader
├── features/     # auth, cart, products y theme
├── pages/        # pantallas customer y admin
├── routes/       # rutas y guards
├── services/     # Firebase, Firestore y órdenes
├── types/        # contratos del dominio
└── main.tsx      # composición de providers
```

El carrito usa Context API + `useReducer` porque concentra acciones relacionadas en un reducer puro. Auth, carrito y tema están separados para reducir acoplamiento.

## Funcionalidades implementadas

- Registro, login, Google, logout y persistencia Firebase.
- Roles `customer` y `admin` con rutas protegidas.
- Catálogo, búsqueda con debounce, categorías y detalle.
- Header funcional: categorías, búsqueda, login/cuenta, favoritos, carrito y tema.
- Carrito persistente con cantidades, eliminación y total.
- Checkout simulado e historial de órdenes.
- Panel admin con CRUD de productos y estados de órdenes.
- Modo claro/oscuro persistente.

## Autenticación y seguridad

Los registros nuevos siempre reciben rol `customer`. El rol admin debe asignarse mediante un proceso confiable fuera del formulario público.

### Crear el primer admin

1. Activa Email/Password o Google en Firebase Authentication.
2. Registra el usuario desde la aplicación para que se cree su perfil `users/{uid}`.
3. Copia el UID desde Authentication > Users.
4. En Firestore crea o edita `users/{uid}` y cambia únicamente `role` a `admin`.
5. Cierra sesión y vuelve a iniciar sesión para que el frontend cargue el nuevo perfil.

La aplicación nunca permite seleccionar `admin` durante el registro. Esto evita que cualquier visitante se autoasigne permisos administrativos.

Las reglas están en `firestore.rules`: productos públicos de lectura, órdenes privadas por `userId`, carrito privado y operaciones administrativas restringidas a `role: "admin"`. Se despliegan con:

```bash
firebase deploy --only firestore:rules
```

Firebase CLI está instalada localmente, pero requiere autenticación de tu cuenta para publicar:

El proyecto Firebase configurado localmente está en `.firebaserc`. El login del CLI es independiente del login de la aplicación:

```bash
npx firebase login
npm run firebase:rules
```

La validación de despliegue quedó pendiente porque el entorno actual respondió `Failed to authenticate`. No se ejecutó ningún deploy parcial.

La aplicación sí puede probar registro y login localmente con `.env`; Vercel solo será necesario para producción y para ejecutar la Function de S3 públicamente.

## Modelo de datos

Colecciones previstas: `users`, `products`, `categories`, `carts`, `favorites` y `orders`. `carts/{uid}` y `favorites/{uid}` se crean automáticamente al guardar datos de un usuario autenticado; no es necesario crearlas manualmente desde la consola. Las reglas restringen ambos documentos al UID propietario. Los tipos están en `src/types/domain.ts`.

La validación visual local mostró `Database '(default)' not found` desde Firebase. Antes de probar catálogo, usuarios, categorías u órdenes, crea la base de datos Firestore en Firebase Console para el proyecto `proyectom5-1ca04`, selecciona una región y publica las reglas con `npm run firebase:rules` después de autenticar el CLI.

## S3 y Vercel Functions

Flujo previsto:

```text
Admin -> Vercel Function -> presigned URL -> S3 -> URL de imagen -> Firestore
Customer -> Vercel Function -> Firebase Admin transaction -> stock + order
```

Las credenciales AWS nunca estarán en el frontend. Esta integración es el siguiente bloque de implementación.

La Function `api/upload-url.ts` acepta únicamente imágenes JPEG, PNG o WebP de hasta 5 MB y genera una URL PUT válida durante 5 minutos. También verifica el ID token de Firebase y exige que el usuario tenga rol `admin`.

En Vercel configura como variables server-only `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET`, `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL` y `FIREBASE_PRIVATE_KEY`. Las credenciales de AWS y Firebase Admin nunca deben comenzar con `VITE_` ni publicarse en el navegador. En `FIREBASE_PRIVATE_KEY`, conserva el valor completo de la clave y sus saltos de línea como `\\n` si Vercel lo requiere.

Para S3, permite en CORS el origen exacto de producción y `PUT`/`GET`, y asigna al usuario IAM únicamente `s3:PutObject` sobre `arn:aws:s3:::TU_BUCKET/products/*`. La URL pública solo funcionará si el bucket o una distribución CDN permite lectura; una alternativa más segura es guardar una URL CDN pública.

## Testing

Los tests viven en `src/test/`, separados por alcance:

```text
src/test/
├── unit/          # reducer, shell y componentes aislados
└── integration/   # flujos con providers y acciones del usuario
```

Comandos disponibles:

```bash
npm run test:unit
npm run test:integration
npm run test
npm run test:coverage
```

La suite actual cubre el shell de la aplicación, el header, el reducer y el flujo de agregar, actualizar y eliminar productos del carrito. Firebase y AWS deben mockearse para ampliar formularios, autenticación, checkout, Firestore y S3 sin depender de servicios externos.

## Validación visual

Se verificaron home, catálogo, carrito vacío, redirecciones protegidas, favoritos, menú de categorías y cambio de tema en el navegador local.

## Bitácora de IA

### Entrada 1: auditoría del dominio y del inventario

La revisión asistida detectó que el checkout confiaba en el precio y la cantidad enviados desde el navegador. Se decidió mover la creación de órdenes a una Function de Vercel con Firebase Admin y una transacción: leer productos, validar stock, recalcular total, descontar inventario y crear la orden como `pending`.

### Entrada 2: seguridad de imágenes

La revisión del flujo S3 mostró que solicitar una presigned URL sin verificar el usuario dejaba el endpoint expuesto. Se incorporó validación del ID token de Firebase y consulta del rol `admin` en `users/{uid}` antes de generar la URL.

### Entrada 3: persistencia por usuario

Al revisar el carrito y favoritos se comprobó que solo usaban `localStorage`. La decisión fue usar Firestore como fuente principal en `carts/{uid}` y `favorites/{uid}`, dejando `localStorage` como fallback local para desarrollo y tests. Las reglas restringen cada documento a su propietario.

### Entrada 4: experiencia de autenticación

La prueba visual mostró que después de iniciar sesión el usuario terminaba en `/account` aunque estaba explorando el catálogo. Se cambió el destino de login, Google y registro a `/`, manteniendo al usuario en la experiencia principal.

### Entrada 5: feedback y calidad

Se diseñó un `ToastProvider` global para informar éxitos y errores de autenticación, favoritos, carrito, checkout y administración. También se reorganizaron los tests en `src/test/unit` y `src/test/integration`, y se añadió un flujo que prueba agregar, cambiar cantidad y eliminar del carrito.

## Deploy

1. Crea la base de datos Firestore, habilita Authentication con Email/Password y/o Google y despliega `firestore.rules`.
2. Configura las variables `VITE_FIREBASE_*` en Vercel para el navegador y las variables server-only descritas arriba para `/api/upload-url`.
3. Importa el repositorio en Vercel con el framework Vite; el comando de build es `npm run build` y la salida es `dist`.
4. Después del primer registro, asigna `role: "admin"` al documento `users/{uid}` desde un entorno confiable.
5. Verifica en producción un flujo customer completo, un cambio de estado desde admin y un upload de imagen antes de publicar.

## Autor

Raul Alejandro Carmona Cuellar

