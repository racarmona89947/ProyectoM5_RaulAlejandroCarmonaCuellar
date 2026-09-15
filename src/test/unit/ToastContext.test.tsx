import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ToastProvider } from '../../contexts/toast/ToastContext'
import { useToast } from '../../contexts/toast/useToast'

function ToastProbe() {
  const { showToast } = useToast()
  return <button onClick={() => showToast('Producto guardado', 'success')} type="button">Mostrar toast</button>
}

describe('ToastContext', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    vi.useRealTimers()
  })

  it('shows and closes a notification', async () => {
    const user = userEvent.setup()
    render(<ToastProvider><ToastProbe /></ToastProvider>)

    await user.click(screen.getByRole('button', { name: 'Mostrar toast' }))
    expect(screen.getByRole('status')).toHaveTextContent('Producto guardado')
    await user.click(screen.getByRole('button', { name: 'Cerrar notificación' }))
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('auto dismisses notifications', async () => {
    vi.useFakeTimers()
    render(<ToastProvider><ToastProbe /></ToastProvider>)
    fireEvent.click(screen.getByRole('button', { name: 'Mostrar toast' }))
    await vi.advanceTimersByTimeAsync(4000)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})
