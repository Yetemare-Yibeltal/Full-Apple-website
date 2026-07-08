import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export default function LightRig () {
  const groupRef = useRef()

  useFrame(state => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.15
    }
  })

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 5, 4]} intensity={1} castShadow />

      <group ref={groupRef}>
        <pointLight
          position={[3, 1, 2]}
          intensity={2}
          color='#7C6CF6'
          distance={8}
        />
        <pointLight
          position={[-3, 1, 2]}
          intensity={2}
          color='#4FD3C4'
          distance={8}
        />
        <pointLight
          position={[0, -2, -3]}
          intensity={1.5}
          color='#FF7AC6'
          distance={8}
        />
      </group>
    </>
  )
}
