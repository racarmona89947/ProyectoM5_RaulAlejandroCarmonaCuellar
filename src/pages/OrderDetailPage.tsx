import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MarketplaceHeader } from '../components/MarketplaceHeader'
import { useAuth } from '../features/auth/useAuth'
import { getOrder } from '../services/orderService'
import { orderStatusLabels, type Order } from '../types/domain'

export function OrderDetailPage() {
  const { orderId } = useParams(); const { firebaseUser } = useAuth(); const [order, setOrder] = useState<Order | null>(null); const [isLoading, setIsLoading] = useState(true); const [error, setError] = useState('')
  useEffect(() => { if (!orderId) return; getOrder(orderId).then((nextOrder) => { if (nextOrder?.userId === firebaseUser?.uid) setOrder(nextOrder) }).catch(() => setError('No pudimos cargar esta orden.')).finally(() => setIsLoading(false)) }, [firebaseUser?.uid, orderId])
  if (isLoading) return <main className="min-h-screen bg-[var(--page)]"><MarketplaceHeader /><p className="p-12 text-center text-[var(--text-muted)]">Cargando orden...</p></main>
  if (error) return <main className="min-h-screen bg-[var(--page)]"><MarketplaceHeader /><p className="p-12 text-center text-[var(--danger)]" role="alert">{error}</p></main>
  if (!order) return <main className="min-h-screen bg-[var(--page)]"><MarketplaceHeader /><p className="p-12 text-center text-[var(--text-muted)]">Orden no encontrada.</p></main>
  return <main className="min-h-screen bg-[var(--page)]"><MarketplaceHeader /><div className="mx-auto max-w-3xl px-4 py-10 sm:px-6"><Link className="font-semibold text-[var(--royal-violet)]" to="/orders">← Historial</Link><section className="mt-8 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6"><p className="text-sm text-[var(--text-muted)]">Orden {order.id}</p><h1 className="mt-2 font-[Space_Grotesk] text-3xl font-bold text-[var(--text)]">Compra confirmada</h1><p className="mt-3 text-[var(--text-muted)]">Estado: <span className="font-semibold text-[var(--royal-violet)]">{orderStatusLabels[order.status]}</span></p><div className="mt-8 space-y-3">{order.items.map((item) => <div className="flex justify-between border-b border-[var(--border)] pb-3" key={item.productId}><span>{item.name} x {item.quantity}</span><span>${(item.price * item.quantity).toLocaleString('es-AR')}</span></div>)}</div><p className="mt-6 text-right text-2xl font-bold text-[var(--royal-violet)]">${order.total.toLocaleString('es-AR')}</p></section></div></main>
}