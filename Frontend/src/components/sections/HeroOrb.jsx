import { Canvas, useFrame } from "@react-three/fiber"
import { MeshDistortMaterial, Sphere, Float } from "@react-three/drei"
import { useRef } from "react"

function Orb() {
  const mesh = useRef()
  useFrame((state) => {
    mesh.current.rotation.x = state.clock.getElapsedTime() * 0.15
    mesh.current.rotation.y = state.clock.getElapsedTime() * 0.2
  })

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <Sphere ref={mesh} args={[1.4, 64, 64]}>
        <MeshDistortMaterial
          color="#dc2626"
          distort={0.35}
          speed={2}
          roughness={0.1}
          metalness={0.8}
          wireframe={false}
        />
      </Sphere>
      {/* Inner glow sphere */}
      <Sphere args={[1.6, 32, 32]}>
        <meshBasicMaterial color="#dc2626" transparent opacity={0.05} wireframe />
      </Sphere>
    </Float>
  )
}

export default function HeroOrb() {
  return (
    <Canvas
      camera={{ position: [0, 0, 4], fov: 45 }}
      style={{ height: "500px", width: "100%" }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={2} color="#ff4444" />
      <pointLight position={[-5, -5, -5]} intensity={0.5} color="#ffffff" />
      <Orb />
    </Canvas>
  )
}