export default function GradientText ({
  children,
  as: Component = 'span',
  className = '',
  ...props
}) {
  return (
    <Component
      className={`gradient-text font-display font-bold ${className}`}
      {...props}
    >
      {children}
    </Component>
  )
}
