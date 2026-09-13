import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginWithEmail, loginWithGoogle } from '../services/authService'
import { useToast } from '../features/toast/useToast'

interface LoginModalProps { onClose: () => void; onOpenRegister: () => void }

export function LoginModal({ onClose, onOpenRegister }: LoginModalProps) {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setIsSubmitting(true)
    try { await loginWithEmail(email, password); onClose(); showToast('Sesión iniciada correctamente.', 'success'); navigate('/') } catch { setError('No pudimos iniciar sesion. Revisa tus datos.'); showToast('No pudimos iniciar sesión. Revisa tus datos.', 'error') } finally { setIsSubmitting(false) }
  }

  async function googleLogin() {
    setError(''); setIsSubmitting(true)
    try { await loginWithGoogle(); onClose(); showToast('Sesión iniciada correctamente.', 'success'); navigate('/') } catch { setError('No pudimos iniciar sesion con Google.'); showToast('No pudimos iniciar sesión con Google.', 'error') } finally { setIsSubmitting(false) }
  }

  return <div aria-label="Ventana de inicio de sesion" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" role="dialog"><div className="relative w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl"><button aria-label="Cerrar inicio de sesion" className="absolute right-4 top-4 text-xl text-[var(--text-muted)]" onClick={onClose} type="button">×</button><p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--indigo-bloom)]">NexoMarket</p><h2 className="mt-3 font-[Space_Grotesk] text-2xl font-bold text-[var(--text)]">Inicia sesion para continuar</h2><form className="mt-6 space-y-4" onSubmit={submit}><label className="block text-sm font-semibold text-[var(--text)]">Correo<input className="mt-2 w-full rounded-xl border border-[var(--border)] bg-transparent px-4 py-3" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} /></label><label className="block text-sm font-semibold text-[var(--text)]">Contraseña<input className="mt-2 w-full rounded-xl border border-[var(--border)] bg-transparent px-4 py-3" onChange={(event) => setPassword(event.target.value)} minLength={6} required type="password" value={password} /></label>{error && <p className="rounded-lg bg-red-50 p-3 text-sm text-[var(--danger)]" role="alert">{error}</p>}<button className="w-full rounded-xl bg-[var(--royal-violet)] px-4 py-3 font-semibold text-white disabled:opacity-60" disabled={isSubmitting} type="submit">{isSubmitting ? 'Ingresando...' : 'Iniciar sesion'}</button></form><button className="mt-3 w-full rounded-xl border border-[var(--border)] px-4 py-3 font-semibold text-[var(--text)]" disabled={isSubmitting} onClick={() => void googleLogin()} type="button">Continuar con Google</button><p className="mt-5 text-center text-sm text-[var(--text-muted)]">¿No tienes cuenta? <button className="font-semibold text-[var(--royal-violet)]" onClick={onOpenRegister} type="button">Registrate</button></p></div></div>
}