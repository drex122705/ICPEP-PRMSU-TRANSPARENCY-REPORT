import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { EffectComposer, Bloom, DepthOfField } from '@react-three/postprocessing';
import * as THREE from 'three';

export function MotherboardScene() {
  const groupRef = useRef();
  const { camera } = useThree();
  const scrollProgressRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      // Calculate scroll progress based on total page height
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalHeight > 0 ? window.scrollY / totalHeight : 0;
      scrollProgressRef.current = progress;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial call
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Pulse animation data for active glowing traces
  const pulseCount = 60;
  const { pulsePos, pulseVel } = useMemo(() => {
    const pos = new Float32Array(pulseCount * 3);
    const vel = [];
    for (let i = 0; i < pulseCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 18 + Math.random() * 40;
      pos[i * 3] = Math.cos(angle) * dist;
      pos[i * 3 + 1] = Math.sin(angle) * dist;
      pos[i * 3 + 2] = 1.0 + Math.random() * 0.5;

      vel.push({
        speed: 0.15 + Math.random() * 0.3,
        angle: angle,
        dist: dist
      });
    }
    return { pulsePos: pos, pulseVel: vel };
  }, [pulseCount]);

  const pulseGeoRef = useRef();

  // Custom geometries to represent chips and capacitors
  const chips = useMemo(() => {
    const items = [];
    for(let i=0; i<15; i++) {
      const x = (Math.random() - 0.5) * 80;
      const y = (Math.random() - 0.5) * 60;

      // Avoid the center where the main CPU is
      if (Math.abs(x) < 25 && Math.abs(y) < 25) continue;

      const isLarge = Math.random() > 0.7;
      items.push({
        position: [x, y, 1],
        rotation: [0, 0, Math.random() > 0.5 ? 0 : Math.PI/2],
        scale: isLarge ? [6 + Math.random()*4, 4 + Math.random()*2, 1.5] : [3, 2, 1],
        type: isLarge ? 'chip' : 'logic'
      });
    }
    return items;
  }, []);

  const capacitors = useMemo(() => {
      const items = [];
      for(let i=0; i<25; i++) {
        const x = (Math.random() - 0.5) * 80;
        const y = (Math.random() - 0.5) * 60;
        if (Math.abs(x) < 20 && Math.abs(y) < 20) continue;

        items.push({
          position: [x, y, 1],
          rotation: [Math.PI/2, 0, 0],
          scale: [0.8 + Math.random()*0.5, 2 + Math.random()*1.5, 0.8 + Math.random()*0.5],
        });
      }
      return items;
  }, []);

  useFrame((state, delta) => {
    // Animate camera Z position to dive into the motherboard
    const startZ = 70;
    const endZ = 12; // closer
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, startZ - (startZ - endZ) * scrollProgressRef.current, 0.1);

    // Animate camera Y to get closer to the CPU
    const startY = -35;
    const endY = -15;
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, startY - (startY - endY) * scrollProgressRef.current, 0.1);

    // Subtly rotate the motherboard group based on scroll and time
    if (groupRef.current) {
        groupRef.current.rotation.x = -0.4 + scrollProgressRef.current * 0.45;
        groupRef.current.rotation.y = scrollProgressRef.current * 0.25;
        groupRef.current.rotation.z += 0.001;
    }

    // Animate pulses
    if (pulseGeoRef.current) {
        const positions = pulseGeoRef.current.attributes.position.array;
        for (let i = 0; i < pulseCount; i++) {
          pulseVel[i].dist -= pulseVel[i].speed;
          if (pulseVel[i].dist < 12) {
            pulseVel[i].dist = 40 + Math.random() * 20;
          }
          positions[i * 3] = Math.cos(pulseVel[i].angle) * pulseVel[i].dist;
          positions[i * 3 + 1] = Math.sin(pulseVel[i].angle) * pulseVel[i].dist;
        }
        pulseGeoRef.current.attributes.position.needsUpdate = true;
    }
  });

  return (
    <>
      <Environment preset="city" />

      {/* Harsh, realistic spotlight casting shadows */}
      <spotLight
        position={[40, 50, 60]}
        angle={0.3}
        penumbra={0.8}
        intensity={3000}
        color="#ffffff"
        castShadow
        shadow-bias={-0.0001}
        shadow-mapSize={[2048, 2048]}
      />

      {/* Secondary colored rim lights */}
      <spotLight position={[-40, -40, 20]} angle={0.5} penumbra={1} intensity={1000} color="#00C0F3" />
      <spotLight position={[40, -40, 20]} angle={0.5} penumbra={1} intensity={800} color="#F4B41A" />

      <group ref={groupRef}>
        {/* PCB Substrate */}
        <mesh receiveShadow position={[0, 0, -0.5]}>
          <boxGeometry args={[110, 80, 1]} />
          <meshPhysicalMaterial
            color="#020f20"
            roughness={0.9}
            metalness={0.2}
            clearcoat={0.1}
            clearcoatRoughness={0.9}
            bumpScale={0.02}
          />
        </mesh>

        {/* Traces / Grid */}
        <gridHelper args={[100, 40, '#2d2d2d', '#111111']} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.05]} />
        <gridHelper args={[60, 10, '#4a3d13', '#4a3d13']} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.06]} />

        {/* Central CPU */}
        <group position={[0, 0, 0.5]}>
          {/* CPU Base */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[22, 22, 1]} />
            <meshPhysicalMaterial color="#0a0a0a" roughness={0.3} metalness={0.9} clearcoat={0.5} />
          </mesh>

          {/* Inner Heat Spreader */}
          <mesh castShadow receiveShadow position={[0, 0, 0.75]}>
            <boxGeometry args={[16, 16, 0.5]} />
            <meshPhysicalMaterial
                color="#b38415"
                roughness={0.15}
                metalness={1.0}
                clearcoat={1.0}
            />
          </mesh>

          {/* Glowing Center Logo / Die */}
          <mesh position={[0, 0, 1.05]}>
            <planeGeometry args={[8, 8]} />
            <meshBasicMaterial color="#00C0F3" toneMapped={false} />
          </mesh>

          {/* CPU Pins / Connectors */}
          {Array.from({ length: 11 }).map((_, i) => {
            const pos = -10 + i * 2;
            return (
              <React.Fragment key={i}>
                {/* Top */}
                <mesh castShadow position={[pos, 11.5, -0.2]} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.2, 0.2, 1, 8]} />
                  <meshPhysicalMaterial color="#F4B41A" metalness={1} roughness={0.2} />
                </mesh>
                {/* Bottom */}
                <mesh castShadow position={[pos, -11.5, -0.2]} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.2, 0.2, 1, 8]} />
                  <meshPhysicalMaterial color="#F4B41A" metalness={1} roughness={0.2} />
                </mesh>
                {/* Right */}
                <mesh castShadow position={[11.5, pos, -0.2]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.2, 0.2, 1, 8]} />
                  <meshPhysicalMaterial color="#F4B41A" metalness={1} roughness={0.2} />
                </mesh>
                {/* Left */}
                <mesh castShadow position={[-11.5, pos, -0.2]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.2, 0.2, 1, 8]} />
                  <meshPhysicalMaterial color="#F4B41A" metalness={1} roughness={0.2} />
                </mesh>
              </React.Fragment>
            );
          })}
        </group>

        {/* Outer Chips */}
        {chips.map((chip, idx) => (
            <mesh key={`chip-${idx}`} castShadow receiveShadow position={chip.position} rotation={chip.rotation} scale={chip.scale}>
                <boxGeometry args={[1, 1, 1]} />
                <meshPhysicalMaterial color="#111" roughness={0.7} metalness={0.5} clearcoat={0.1} />
                {/* Small pin connectors on sides */}
                <mesh position={[0.55, 0, -0.2]} scale={[0.1, 0.8, 0.5]}>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshPhysicalMaterial color="#888" roughness={0.3} metalness={0.9} />
                </mesh>
                <mesh position={[-0.55, 0, -0.2]} scale={[0.1, 0.8, 0.5]}>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshPhysicalMaterial color="#888" roughness={0.3} metalness={0.9} />
                </mesh>
            </mesh>
        ))}

        {/* Capacitors */}
        {capacitors.map((cap, idx) => (
            <mesh key={`cap-${idx}`} castShadow receiveShadow position={cap.position} rotation={cap.rotation} scale={cap.scale}>
                <cylinderGeometry args={[1, 1, 1, 16]} />
                {/* Aluminum/metallic top, black body */}
                <meshPhysicalMaterial color={Math.random() > 0.5 ? "#222" : "#192841"} roughness={0.5} metalness={0.4} />
                <mesh position={[0, 0.51, 0]}>
                    <cylinderGeometry args={[0.9, 0.9, 0.05, 16]} />
                    <meshPhysicalMaterial color="#d4d4d4" roughness={0.2} metalness={0.9} />
                </mesh>
            </mesh>
        ))}

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
          {/* using basic material with toneMapped=false is key for postprocessing bloom */}
          <pointsMaterial color="#00C0F3" size={0.6} toneMapped={false} />
        </points>

        {/* Secondary pulses in Gold */}
        <points rotation={[0, 0, Math.PI/4]}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={pulseCount/2}
              array={pulsePos.slice(0, (pulseCount/2)*3)}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial color="#F4B41A" size={0.4} toneMapped={false} />
        </points>

      </group>

      {/* Post Processing */}
      <EffectComposer disableNormalPass>
        <Bloom
          luminanceThreshold={2}
          mipmapBlur
          intensity={1.5}
        />
        <DepthOfField
          focusDistance={0.01}
          focalLength={0.1}
          bokehScale={4}
          height={480}
        />
      </EffectComposer>
    </>
  );
}
