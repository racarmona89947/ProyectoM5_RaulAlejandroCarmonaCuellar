import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'

const requiredEnvironmentVariables = ['FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY']
const missingVariables = requiredEnvironmentVariables.filter((name) => !process.env[name])

if (missingVariables.length > 0) {
  throw new Error(`Faltan variables de entorno: ${missingVariables.join(', ')}`)
}

const firebaseApp = getApps()[0] ?? initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
})

const database = getFirestore(firebaseApp)

const categories = [
  { id: 'computadores', name: 'Computadores' },
  { id: 'celulares', name: 'Celulares' },
  { id: 'audio', name: 'Audio' },
  { id: 'gaming', name: 'Gaming' },
  { id: 'oficina', name: 'Oficina' },
  { id: 'hogar', name: 'Hogar' },
  { id: 'accesorios', name: 'Accesorios' },
]

const products = [
  ['seed-laptop-01', 'Laptop Nova 14', 'NovaTech', 'Computador portátil para estudio y trabajo diario.', 'Computadores', 2899000, 8, true],
  ['seed-laptop-02', 'Laptop Pro 16', 'Aurea', 'Equipo de alto rendimiento para tareas profesionales.', 'Computadores', 4599000, 5, true],
  ['seed-desktop-01', 'Desktop Creator X', 'PixelForge', 'Estación de trabajo para diseño, edición y programación.', 'Computadores', 5299000, 4, false],
  ['seed-phone-01', 'Smartphone Pulse 5G', 'Nexo', 'Teléfono 5G con pantalla AMOLED y cámara principal de alta resolución.', 'Celulares', 1899000, 14, true],
  ['seed-phone-02', 'Smartphone Mini', 'Aurea', 'Celular compacto con batería para todo el día.', 'Celulares', 999000, 18, false],
  ['seed-tablet-01', 'Tablet Canvas 11', 'NovaTech', 'Tablet ligera para lectura, notas y entretenimiento.', 'Celulares', 1249000, 10, false],
  ['seed-headphones-01', 'Auriculares AirBeat', 'SonicLab', 'Auriculares inalámbricos con cancelación de ruido.', 'Audio', 449000, 25, true],
  ['seed-headphones-02', 'Headphones Studio', 'SonicLab', 'Audífonos de diadema para escuchar música con detalle.', 'Audio', 699000, 12, false],
  ['seed-speaker-01', 'Parlante Boom Go', 'Vibe', 'Parlante portátil resistente para reuniones y exteriores.', 'Audio', 289000, 20, false],
  ['seed-keyboard-01', 'Teclado Mecánico RGB', 'PixelForge', 'Teclado mecánico compacto con iluminación RGB.', 'Gaming', 329000, 16, true],
  ['seed-mouse-01', 'Mouse Pro Gamer', 'PixelForge', 'Mouse ergonómico con sensor preciso y botones programables.', 'Gaming', 219000, 22, false],
  ['seed-chair-01', 'Silla Gamer Atlas', 'ErgoPlay', 'Silla reclinable con soporte lumbar ajustable.', 'Gaming', 899000, 7, true],
  ['seed-monitor-01', 'Monitor UltraView 27', 'Visionary', 'Monitor QHD de 27 pulgadas para trabajo y gaming.', 'Oficina', 1099000, 9, true],
  ['seed-desk-01', 'Escritorio Modular', 'WorkNest', 'Escritorio amplio con organización para cables.', 'Oficina', 679000, 6, false],
  ['seed-webcam-01', 'Webcam Focus HD', 'Visionary', 'Cámara web Full HD para reuniones y streaming.', 'Oficina', 179000, 15, false],
  ['seed-lamp-01', 'Lámpara Smart Glow', 'HomeSense', 'Lámpara regulable con escenas para concentración y descanso.', 'Hogar', 139000, 30, false],
  ['seed-vacuum-01', 'Aspiradora Compacta', 'HomeSense', 'Aspiradora inalámbrica para limpieza rápida del hogar.', 'Hogar', 529000, 11, false],
  ['seed-backpack-01', 'Mochila Tech Daily', 'UrbanCarry', 'Mochila acolchada para laptop y accesorios.', 'Accesorios', 159000, 24, false],
  ['seed-charger-01', 'Cargador GaN 65W', 'Voltix', 'Cargador compacto con carga rápida para varios dispositivos.', 'Accesorios', 129000, 35, true],
  ['seed-cable-01', 'Cable USB-C Trenzado', 'Voltix', 'Cable reforzado para carga y transferencia de datos.', 'Accesorios', 49000, 50, false],
]

async function seed() {
  const batch = database.batch()

  categories.forEach((category) => {
    batch.set(database.collection('categories').doc(category.id), {
      name: category.name,
      slug: category.id,
      active: true,
      createdAt: FieldValue.serverTimestamp(),
    }, { merge: true })
  })

  products.forEach(([id, name, brand, description, category, price, stock, featured]) => {
    batch.set(database.collection('products').doc(id), {
      name,
      brand,
      description,
      category,
      price,
      stock,
      images: [],
      featured,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true })
  })

  await batch.commit()
  console.log(`Seed completado: ${products.length} productos y ${categories.length} categorias.`)
  console.log('Las imagenes quedaron como [] para agregarlas luego desde Firestore o mediante S3.')
}

await seed()
