import { motion } from 'framer-motion'

const variants = {
  primary:
    'bg-prism-gradient bg-[length:200%_200%] text-obsidian font-semibold hover:animate-gradient-shift',
  glass: 'glass-panel text-text-primary hover:border-white/30',
  ghost: 'text-text-primary hover:text-glow underline-offset-4 hover:underline'
}

export default function Button ({
  children,
  variant = 'primary',
  className = '',
  onClick,
  type = 'button',
  disabled = false,
  ...props
}) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.03 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      className={`px-6 py-3 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  )
}
