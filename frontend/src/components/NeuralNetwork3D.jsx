import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const ParticleNetwork = ({ count = 150, maxDistance = 4.5 }) => {
  const pointsRef = useRef();
  const linesRef = useRef();

  // Initialize particles positions, velocities, colors
  const particles = useMemo(() => {
    const temp = [];
    const colorPrimary = new THREE.Color('#00d4ff'); // Neon blue
    const colorSecondary = new THREE.Color('#a855f7'); // Purple

    for (let i = 0; i < count; i++) {
      // Favor edges by pushing points away from center radius
      let x = (Math.random() - 0.5) * 40;
      let y = (Math.random() - 0.5) * 20;
      let z = (Math.random() - 0.5) * 15;
      
      // If too close to center, push to edges
      const distFromCenter = Math.sqrt(x*x + y*y);
      if (distFromCenter < 5) {
         x += Math.sign(x || 1) * 6;
         y += Math.sign(y || 1) * 4;
      }
      
      const vx = (Math.random() - 0.5) * 0.02;
      const vy = (Math.random() - 0.5) * 0.02;
      const vz = (Math.random() - 0.5) * 0.02;

      const color = Math.random() > 0.5 ? colorPrimary : colorSecondary;

      temp.push({ 
        position: new THREE.Vector3(x, y, z), 
        velocity: new THREE.Vector3(vx, vy, vz),
        baseColor: color,
        pulseOffset: Math.random() * Math.PI * 2
      });
    }
    return temp;
  }, [count]);

  const [positions] = useState(() => new Float32Array(count * 3));
  const [colors] = useState(() => new Float32Array(count * 3));
  
  // Lines buffer geometry setup
  const maxLines = count * count;
  const [linePositions] = useState(() => new Float32Array(maxLines * 3));
  const [lineColors] = useState(() => new Float32Array(maxLines * 3));

  const { pointer } = useThree();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Mouse coords in 3D (approximate interaction)
    const mouseX = (pointer.x * 20);
    const mouseY = (pointer.y * 10);

    let lineIndex = 0;

    for (let i = 0; i < count; i++) {
      const p = particles[i];
      p.position.add(p.velocity);

      // Bounce off boundaries seamlessly
      if (p.position.x < -20 || p.position.x > 20) p.velocity.x *= -1;
      if (p.position.y < -12 || p.position.y > 12) p.velocity.y *= -1;
      if (p.position.z < -10 || p.position.z > 10) p.velocity.z *= -1;

      // Mouse interaction (Gentle Repulsion)
      const dx = mouseX - p.position.x;
      const dy = mouseY - p.position.y;
      const distToMouse = Math.sqrt(dx * dx + dy * dy);
      if (distToMouse < 6) {
        const force = (6 - distToMouse) * 0.01;
        p.velocity.x -= dx * force;
        p.velocity.y -= dy * force;
      }
      
      // Speed limit
      p.velocity.clampLength(0, 0.04);

      positions[i * 3] = p.position.x;
      positions[i * 3 + 1] = p.position.y;
      positions[i * 3 + 2] = p.position.z;

      // Pulse color intensity
      const pulse = (Math.sin(time * 1.5 + p.pulseOffset) * 0.5 + 0.5) * 0.6 + 0.4;
      colors[i * 3] = p.baseColor.r * pulse;
      colors[i * 3 + 1] = p.baseColor.g * pulse;
      colors[i * 3 + 2] = p.baseColor.b * pulse;

      // Calculate lines
      for (let j = i + 1; j < count; j++) {
        const p2 = particles[j];
        const dist = p.position.distanceTo(p2.position);

        if (dist < maxDistance) {
          const alpha = 1.0 - (dist / maxDistance);

          linePositions[lineIndex * 6] = p.position.x;
          linePositions[lineIndex * 6 + 1] = p.position.y;
          linePositions[lineIndex * 6 + 2] = p.position.z;
          linePositions[lineIndex * 6 + 3] = p2.position.x;
          linePositions[lineIndex * 6 + 4] = p2.position.y;
          linePositions[lineIndex * 6 + 5] = p2.position.z;

          // Fade lines based on distance
          const opacity = alpha * 0.5; // Max line opacity
          lineColors[lineIndex * 6] = p.baseColor.r * opacity;
          lineColors[lineIndex * 6 + 1] = p.baseColor.g * opacity;
          lineColors[lineIndex * 6 + 2] = p.baseColor.b * opacity;
          lineColors[lineIndex * 6 + 3] = p2.baseColor.r * opacity;
          lineColors[lineIndex * 6 + 4] = p2.baseColor.g * opacity;
          lineColors[lineIndex * 6 + 5] = p2.baseColor.b * opacity;

          lineIndex++;
        }
      }
    }

    if (pointsRef.current) {
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
      pointsRef.current.geometry.attributes.color.needsUpdate = true;
    }
    
    if (linesRef.current) {
      linesRef.current.geometry.setDrawRange(0, lineIndex * 2);
      linesRef.current.geometry.attributes.position.needsUpdate = true;
      linesRef.current.geometry.attributes.color.needsUpdate = true;
    }

    // Gentle camera drift
    state.camera.position.x += (Math.sin(time * 0.2) * 2 - state.camera.position.x) * 0.05;
    state.camera.position.y += (Math.cos(time * 0.2) * 2 - state.camera.position.y) * 0.05;
    state.camera.lookAt(0, 0, 0);
  });

  return (
    <group>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
        </bufferGeometry>
        {/* Soft glowing points */}
        <pointsMaterial size={0.15} vertexColors transparent opacity={0.9} depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>

      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={maxLines * 2} array={linePositions} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={maxLines * 2} array={lineColors} itemSize={3} />
        </bufferGeometry>
        <lineBasicMaterial vertexColors transparent opacity={1} blending={THREE.AdditiveBlending} depthWrite={false} />
      </lineSegments>
    </group>
  );
};

export default function NeuralNetwork3D() {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }} dpr={[1, 2]}>
        <ParticleNetwork count={160} maxDistance={4.2} />
      </Canvas>
    </div>
  );
}
