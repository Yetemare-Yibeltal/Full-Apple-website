import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, RoundedBox, useGLTF } from '@react-three/drei'

function LoadedModel ({ url }) {
  const { scene } = useGLTF(url)
  return <primitive object={scene} scale={1.2} />
}

function PlaceholderDevice ({ color = '#1d1d1f' }) {
  const meshRef = useRef()

  useFrame(state => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3
    }
  })

  return (
    <RoundedBox
      ref={meshRef}
      args={[1.4, 2.6, 0.15]}
      radius={0.15}
      smoothness={8}
      castShadow
    >
      <meshPhysicalMaterial
        color={color}
        metalness={0.7}
        roughness={0.15}
        clearcoat={1}
        clearcoatRoughness={0.1}
      />
    </RoundedBox>
  )
}

export default function ProductModel ({
  modelUrl,
  color,
  floatIntensity = 0.6
}) {
  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={floatIntensity}>
      {modelUrl ? (
        <LoadedModel url={modelUrl} />
      ) : (
        <PlaceholderDevice color={color} />
      )}
    </Float>
  )
}
