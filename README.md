# NexoMarket

Proyecto Integrador M5 de Henry: e-commerce SPA desarrollado para el contexto de Patagonix Tech.

**Descripcion corta:** Marketplace de tecnologia con React, Firebase, Firestore, AWS S3 y Vercel Functions.

**Produccion:** https://proyecto-m5-raul-alejandro-carmona-cuellar.vercel.app/

**Repositorio:** https://github.com/racarmona89947/ProyectoM5_RaulAlejandroCarmonaCuellar

---

## Que hace el proyecto

NexoMarket permite que clientes naveguen un catalogo, filtren productos, administren su carrito y realicen un checkout simulado. Los administradores gestionan productos, categorias, imagenes y estados de ordenes desde un panel protegido.

### Funcionalidades

- Registro, login con email/password, Google y logout.
- Roles `customer` y `admin`.
- Persistencia de carrito y favoritos por usuario en Firestore.
- Catalogo con busqueda con debounce, categorias y detalle de producto.
- Carrito con cantidades, eliminacion, total y validacion de stock.
- Checkout simulado con recalculo de precios y descuento atomico de inventario.
- Historial y detalle de ordenes.
- Estados `pending`, `processing`, `shipped`, `completed` y `cancelled`.
- Panel admin con CRUD de productos y categorias.
- Upload de imagen desde dispositivo a S3 mediante presigned URL.
- Opcion alternativa de guardar una URL de imagen desde Firestore.
- Toasts de exito, error, informacion y advertencia.
- Modo claro/oscuro y layout responsive mobile-first.
- Pagina interna 404 y rewrites SPA para Vercel.

---

## Stack tecnico

- React 18 + TypeScript + Vite.
- React Router.
- TailwindCSS.
- Firebase Authentication.
- Cloud Firestore.
- AWS S3 + presigned URLs.
- Vercel Serverless Functions.
- Vitest + React Testing Library.

---

## Arquitectura

```text
UI React
  -> Context / Reducer / Hooks
    -> Services
      -> Firebase Authentication / Firestore
      -> Vercel Functions
        -> Firebase Admin: ordenes e inventario
        -> AWS S3: imagenes de productos
```

### Estructura principal

```text
src/
  components/       UI reutilizable, header, formularios y tarjetas
  contexts/         Providers, stores y hooks de estado compartido
    auth/           sesion y perfil de usuario
    cart/           carrito por usuario
    favorites/      favoritos por usuario
    theme/          modo claro/oscuro
    toast/          notificaciones globales
  features/         logica de dominio, como reducer del carrito y productos
  pages/            catalogo, checkout, ordenes y panel admin
  routes/           router y guards de autenticacion/rol
  services/         Firebase, productos, ordenes, categorias y datos de usuario
  test/             pruebas unitarias y de integracion
  types/            contratos del dominio
api/
  create-order.ts  checkout e inventario con transaccion server-side
  upload-url.ts    presigned URLs para imagenes S3
scripts/
  seed-products.mjs seed reproducible de productos y categorias
```

---

## Flujo de compra e inventario

El navegador nunca decide el precio final ni descuenta stock.

```text
Cliente agrega productos
  -> checkout envia solo productId + quantity
  -> /api/create-order verifica token Firebase
  -> Firebase Admin lee productos dentro de una transaccion
  -> valida stock y recalcula precios
  -> descuenta inventario
  -> crea orden pending
  -> frontend limpia carrito y muestra detalle
```

Si no hay stock suficiente, la transaccion se cancela completa y el carrito permanece intacto.

---

## Flujo de imagenes

```text
Admin selecciona imagen local
  -> /api/upload-url valida token y rol admin
  -> genera presigned URL temporal
  -> navegador hace PUT directo a S3
  -> Firestore guarda la publicUrl en products.images
```

La API acepta JPEG, PNG y WebP de hasta 5 MB. Tambien se puede pegar una URL externa desde el formulario admin.

---

## Instalacion local

### Requisitos

- Node.js 18 o superior.
- npm.
- Proyecto Firebase con Authentication y Firestore.
- Bucket S3 y usuario IAM para el upload.
- Cuenta Vercel para publicar las Functions.

### Instalar

```bash
npm install
```

Copia `.env.example` como `.env` y completa las variables. Nunca subas `.env`, `.env.local` ni credenciales al repositorio.

### Desarrollo

Para desarrollo normal con Vite:

```bash
npm run dev
```

Para usar otro puerto:

```bash
npm run dev -- --port 3000
```

`vercel dev` puede interferir con el HMR de Vite debido al rewrite SPA. Para desarrollar usa `npm run dev`; Vercel utiliza el rewrite al desplegar.

---

## Variables de entorno

### Frontend

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

### Server-only

```env
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_S3_BUCKET=
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

Las variables AWS y Firebase Admin no deben comenzar con `VITE_`.

---

## Firebase y seguridad

Proyecto configurado:

```text
proyectom5-1ca04
```

Colecciones:

```text
users/{uid}
products
categories
carts/{uid}
favorites/{uid}
orders
```

Las reglas de `firestore.rules` ya fueron compiladas y desplegadas correctamente al proyecto Firebase.

### Crear admin

1. Registrar el usuario desde la aplicación.
2. Copiar su UID en Firebase Authentication.
3. Abrir `users/{uid}` en Firestore.
4. Cambiar `role` de `customer` a `admin` desde un entorno confiable.
5. Cerrar sesión y volver a iniciar sesión.

El registro público nunca permite elegir el rol `admin`.

### Organización de contextos

Los estados compartidos de la aplicación están agrupados en `src/contexts`:

- `contexts/auth`: sesión, perfil y rol.
- `contexts/cart`: carrito, cantidades y persistencia por usuario.
- `contexts/favorites`: favoritos y persistencia por usuario.
- `contexts/theme`: modo claro y oscuro.
- `contexts/toast`: notificaciones globales.

La lógica pura del carrito permanece en `features/cart/cartReducer.ts`, porque no es un Context sino una función de dominio independiente y testeable.

---

## Seed de productos

El seed está en `scripts/seed-products.mjs` y carga 20 productos en 7 categorias con IDs deterministas. Se puede ejecutar varias veces sin duplicar documentos:

```bash
npm run seed:products
```

Las imágenes iniciales quedan como `images: []`. Puedes agregarlas luego en Firestore:

```text
images: ["https://tu-cdn-o-bucket/products/laptop.jpg"]
```

El seed ya fue ejecutado sobre el proyecto Firebase configurado.

---

## AWS S3

El bucket debe tener:

- CORS para `http://localhost:5173` y el dominio de produccion.
- Metodo `PUT` permitido para el upload directo.
- Metodo `GET` permitido para visualizar imagenes.
- IAM limitado a `s3:PutObject` y `s3:GetObject` sobre `products/*`.
- Variables AWS configuradas solo en Vercel Functions.

La politica IAM recomendada:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ProductImagesAccess",
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject"],
      "Resource": "arn:aws:s3:::TU_BUCKET/products/*"
    }
  ]
}
```

No uses `AmazonS3FullAccess` en produccion.

---

## Testing

Los tests estan separados por alcance:

```text
src/test/
  unit/
    App.test.tsx
    MarketplaceHeader.test.tsx
    cartReducer.test.ts
    categoryService.test.ts
    orderService.test.ts
    routeGuards.test.tsx
    ToastContext.test.tsx
    userDataService.test.ts
  integration/
    CartContext.test.tsx
```

Comandos:

```bash
npm run test:unit
npm run test:integration
npm run test
npm run test:coverage
npm run typecheck
npm run lint
npm run build
```

Cobertura funcional actual:

- Shell inicial de la aplicacion.
- Header y busqueda.
- `cartReducer`.
- Agregar producto al carrito.
- Actualizar cantidad.
- Eliminar producto.

La suite actual pasa con 9 archivos y 21 casos. La cobertura se genera con `npm run test:coverage` y cubre reducer, guards, Toast, validaciones del checkout, categorias y persistencia Firestore mockeada.

---

## Deploy

1. Crear Firestore y habilitar Email/Password o Google Authentication.
2. Desplegar reglas:

```bash
npm run firebase:rules
```

3. Configurar las variables frontend y server-only en Vercel.
4. Configurar IAM, bucket y CORS de S3.
5. Importar el repositorio en Vercel.
6. Usar `npm run build` como comando de build.
7. Verificar customer, admin, checkout, inventario y upload en produccion.

El deployment actual de Vercel esta en estado `Ready` y publica `/api/create-order` y `/api/upload-url`.

---

---

## Bitacora de IA

### Entrada 1: inventario transaccional

La revision detecto que el navegador no debia decidir precio ni stock. Se movio la creacion de orden a una Vercel Function con Firebase Admin y transaccion.

### Entrada 2: seguridad S3

Se identifico que una presigned URL debia entregarse solo a un admin autenticado. Se agrego verificacion de token y rol en `users/{uid}`.

### Entrada 3: persistencia por usuario

Se reemplazo la dependencia principal de `localStorage` por Firestore en `carts/{uid}` y `favorites/{uid}`, manteniendo fallback local para desarrollo.

### Entrada 4: experiencia de usuario

Se corrigieron redirecciones de login, navegacion responsive, modo claro/oscuro, errores 404 y feedback Toast.

### Entrada 5: pruebas y documentacion

Se organizaron tests en unitarios e integracion, se agrego el flujo del carrito y se documento el proceso de seed, deploy y seguridad.

---

## Autor

Raul Alejandro Carmona Cuellar
