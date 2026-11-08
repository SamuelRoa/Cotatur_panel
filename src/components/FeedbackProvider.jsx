import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FeedbackContext } from './feedbackContext.js'
import './feedback.css'

let nextId = 0

const TOAST_ICONS = {
  success: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
}

const DEFAULT_TITLES = {
  success: 'Operación exitosa',
  error: 'Ocurrió un error',
  warning: 'Atención',
  info: 'Información',
}

export function FeedbackProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const [dialog, setDialog] = useState(null)
  const resolverRef = useRef(null)

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const push = useCallback((type, message, options = {}) => {
    const id = ++nextId
    const duration = options.duration ?? (type === 'error' ? 7000 : 4500)
    setToasts((prev) => [
      ...prev,
      {
        id,
        type,
        title: options.title ?? DEFAULT_TITLES[type],
        message,
        duration,
      },
    ])
    if (duration > 0) {
      window.setTimeout(() => dismiss(id), duration)
    }
    return id
  }, [dismiss])

  const toast = useMemo(
    () => ({
      success: (message, options) => push('success', message, options),
      error: (message, options) => push('error', message, options),
      warning: (message, options) => push('warning', message, options),
      info: (message, options) => push('info', message, options),
    }),
    [push],
  )

  const confirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve
      setDialog({
        title: options.title || 'Confirmar acción',
        message: options.message || '¿Deseas continuar con esta acción?',
        confirmText: options.confirmText || 'Confirmar',
        cancelText: options.cancelText || 'Cancelar',
        tone: options.tone || 'default',
      })
    })
  }, [])

  const closeDialog = useCallback((value) => {
    if (resolverRef.current) {
      resolverRef.current(value)
      resolverRef.current = null
    }
    setDialog(null)
  }, [])

  useEffect(() => {
    if (!dialog) return undefined
    const onKeyDown = (e) => {
      if (e.key === 'Escape') closeDialog(false)
      if (e.key === 'Enter') closeDialog(true)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [dialog, closeDialog])

  const value = useMemo(() => ({ toast, confirm, dismiss }), [toast, confirm, dismiss])

  return (
    <FeedbackContext.Provider value={value}>
      {children}

      <div className="feedback-toast-stack" aria-live="polite" aria-atomic="false">
        <AnimatePresence initial={false}>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              className={`feedback-toast feedback-toast--${t.type}`}
              role={t.type === 'error' ? 'alert' : 'status'}
              initial={{ opacity: 0, x: 60, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.96 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              layout
            >
              <span className="feedback-toast__icon" aria-hidden="true">
                {TOAST_ICONS[t.type]}
              </span>
              <div className="feedback-toast__body">
                <span className="feedback-toast__title">{t.title}</span>
                <span className="feedback-toast__message">{t.message}</span>
              </div>
              <button
                type="button"
                className="feedback-toast__close"
                onClick={() => dismiss(t.id)}
                aria-label="Cerrar mensaje"
              >
                &times;
              </button>
              {t.duration > 0 && (
                <span
                  className="feedback-toast__progress"
                  style={{ animationDuration: `${t.duration}ms` }}
                  aria-hidden="true"
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {dialog && (
          <motion.div
            className="feedback-confirm-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => closeDialog(false)}
          >
            <motion.div
              className="feedback-confirm"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="feedback-confirm-title"
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="feedback-confirm__header">
                <span className={`feedback-confirm__icon feedback-confirm__icon--${dialog.tone}`} aria-hidden="true">
                  {dialog.tone === 'danger' ? TOAST_ICONS.warning : TOAST_ICONS.info}
                </span>
                <h3 id="feedback-confirm-title" className="feedback-confirm__title">{dialog.title}</h3>
              </div>
              <p className="feedback-confirm__message">{dialog.message}</p>
              <div className="feedback-confirm__footer">
                <button
                  type="button"
                  className="feedback-confirm__btn feedback-confirm__btn--cancel"
                  onClick={() => closeDialog(false)}
                >
                  {dialog.cancelText}
                </button>
                <button
                  type="button"
                  className={`feedback-confirm__btn feedback-confirm__btn--accept feedback-confirm__btn--${dialog.tone}`}
                  onClick={() => closeDialog(true)}
                >
                  {dialog.confirmText}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </FeedbackContext.Provider>
  )
}
