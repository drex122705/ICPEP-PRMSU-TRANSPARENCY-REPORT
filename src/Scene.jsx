import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import * as THREE from 'three';

export function MotherboardScene() {
  const scroll = useScroll();
  const groupRef = useRef();
  const { camera } = useThree();

  // Pulse animation data
  const pulseCount = 80;
  const { pulsePos, pulseVel } = useMemo(() => {
    const pos = new Float32Array(pulseCount * 3);
    const vel = [];
    for (let i = 0; i < pulseCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 18 + Math.random() * 32;
      pos[i * 3] = Math.cos(angle) * dist;
      pos[i * 3 + 1] = Math.sin(angle) * dist;
      pos[i * 3 + 2] = 0.8 + Math.random() * 0.5;

      vel.push({
        speed: 0.15 + Math.random() * 0.25,
        angle: angle,
        dist: dist
      });
    }
    return { pulsePos: pos, pulseVel: vel };
  }, [pulseCount]);

  const pulseGeoRef = useRef();

  useFrame((state, delta) => {
    // Camera fly-through based on scroll
    // The scroll offset goes from 0 to 1 over the scrollable area of the canvas.
    const scrollOffset = scroll ? scroll.offset : 0;

    // Animate camera Z position to dive into the motherboard
    const startZ = 75;
    const endZ = 5;
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, startZ - (startZ - endZ) * scrollOffset, 0.1);

    // Animate camera Y to get closer to the CPU
    const startY = -35;
    const endY = -5;
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, startY - (startY - endY) * scrollOffset, 0.1);

    // Subtly rotate the motherboard group based on scroll and time
    if (groupRef.current) {
        groupRef.current.rotation.x = -0.4 + scrollOffset * 0.4;
        groupRef.current.rotation.y = scrollOffset * 0.2;
        groupRef.current.rotation.z += 0.0015;
    }

    // Animate pulses
    if (pulseGeoRef.current) {
        const positions = pulseGeoRef.current.attributes.position.array;
        for (let i = 0; i < pulseCount; i++) {
          pulseVel[i].dist -= pulseVel[i].speed;
          if (pulseVel[i].dist < 10) {
            pulseVel[i].dist = 40 + Math.random() * 10;
          }
          positions[i * 3] = Math.cos(pulseVel[i].angle) * pulseVel[i].dist;
          positions[i * 3 + 1] = Math.sin(pulseVel[i].angle) * pulseVel[i].dist;
        }
        pulseGeoRef.current.attributes.position.needsUpdate = true;
    }
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[30, 30, 40]} color="#00C0F3" intensity={3} distance={200} />
      <pointLight position={[-30, -30, 40]} color="#F4B41A" intensity={2.5} distance={200} />

      <group ref={groupRef}>
        {/* PCB Substrate */}
        <mesh>
          <planeGeometry args={[110, 80, 20, 20]} />
          <meshStandardMaterial color="#021631" roughness={0.7} metalness={0.3} />
        </mesh>

        {/* PCB Grid Lines (Using a grid helper for simplicity or multiple line segments) */}
        <gridHelper args={[100, 30, 0x00C0F3, 0x062854]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.2]} />

        {/* Central CPU */}
        <group position={[0, 0, 1.5]}>
          {/* Substrate */}
          <mesh>
            <boxGeometry args={[22, 22, 1.2]} />
            <meshStandardMaterial color="#010814" roughness={0.4} metalness={0.8} />
          </mesh>

          {/* Heat Spreader */}
          <mesh position={[0, 0, 0.9]}>
            <boxGeometry args={[16, 16, 0.8]} />
            <meshStandardMaterial color="#F4B41A" roughness={0.2} metalness={0.9} emissive="#3d2800" />
          </mesh>

          {/* CPU Pins */}
          {Array.from({ length: 9 }).map((_, i) => {
            const pos = -10 + i * 2.5;
            return (
              <React.Fragment key={i}>
                <mesh position={[pos, 11.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.15, 0.15, 1.5, 8]} />
                  <meshStandardMaterial color="#F4B41A" metalness={1} />
                </mesh>
                <mesh position={[pos, -11.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.15, 0.15, 1.5, 8]} />
                  <meshStandardMaterial color="#F4B41A" metalness={1} />
                </mesh>
                <mesh position={[11.5, pos, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.15, 0.15, 1.5, 8]} />
                  <meshStandardMaterial color="#F4B41A" metalness={1} />
                </mesh>
                <mesh position={[-11.5, pos, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.15, 0.15, 1.5, 8]} />
                  <meshStandardMaterial color="#F4B41A" metalness={1} />
                </mesh>
              </React.Fragment>
            );
          })}
        </group>

        {/* Glowing Data Pulses */}
        <points>
          <bufferGeometry ref={pulseGeoRef}>
            <bufferAttribute
              attach="attributes-position"
              count={pulseCount}
              array={pulsePos}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial color="#00C0F3" size={1.8} transparent opacity={0.9} blending={THREE.AdditiveBlending} />
        </points>

        {/* Orbit Ring */}
        <mesh position={[0, 0, 2]} rotation={[0, 0, 0]}>
          <torusGeometry args={[36, 0.25, 16, 100]} />
          <meshStandardMaterial color="#00C0F3" emissive="#004393" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
    </>
  );
}
