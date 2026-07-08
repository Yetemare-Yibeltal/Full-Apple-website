import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'

function Loader () {
  return (
    <mesh>
      <sphereGeometry args={[0.4, 16, 16]} />
      <meshBasicMaterial color='#4FD3C4' wireframe />
    </mesh>
  )
}

export default function Scene ({
  children,
  cameraPosition = [0, 0, 5],
  className = ''
}) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        shadows
        camera={{ position: cameraPosition, fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={<Loader />}>{children}</Suspense>
      </Canvas>
    </div>
  )
}
