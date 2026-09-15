import { createContext } from 'react'
import type { ToastVariant } from './ToastContext'

export interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant) => void
}

export const ToastContext = createContext<ToastContextValue | undefined>(undefined)
