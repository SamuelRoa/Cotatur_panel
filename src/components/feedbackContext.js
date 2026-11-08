import { createContext, useContext } from 'react'

export const FeedbackContext = createContext(null)

export function useFeedback() {
  const ctx = useContext(FeedbackContext)
  if (!ctx) throw new Error('useFeedback debe usarse dentro de FeedbackProvider')
  return ctx
}
