import { AnimatePresence, motion } from 'framer-motion'
import { useToast } from '../../context/ToastContext'

const typeStyles = {
  success: 'border-l-4 border-prism-aqua',
  error: 'border-l-4 border-prism-rose',
  info: 'border-l-4 border-prism-violet'
}

export default function Toast () {
  const { toasts, dismissToast } = useToast()

  return (
    <div className='fixed bottom-6 right-6 z-50 flex flex-col gap-3 w-80'>
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            className={`glass-panel px-4 py-3 flex items-center justify-between gap-3 ${
              typeStyles[toast.type] || typeStyles.info
            }`}
          >
            <p className='text-sm text-text-primary'>{toast.message}</p>
            <button
              onClick={() => dismissToast(toast.id)}
              className='text-text-muted hover:text-text-primary'
              aria-label='Dismiss'
            >
              ×
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
