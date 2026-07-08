export default function Skeleton ({
  width = '100%',
  height = '1rem',
  rounded = 'rounded-lg',
  className = ''
}) {
  return (
    <div
      className={`animate-pulse bg-white/10 ${rounded} ${className}`}
      style={{ width, height }}
    />
  )
}
