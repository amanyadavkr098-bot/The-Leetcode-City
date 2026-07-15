"use client";
/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps, @typescript-eslint/no-unused-vars */

import * as THREE from "three";
import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";

// Helper: low-poly voxel cylinder/column
function Column({ position, height, radius = 1 }: { position: [number, number, number]; height: number; radius?: number }) {
  return (
    <mesh position={[position[0], position[1] + height / 2, position[2]]}>
      <cylinderGeometry args={[radius, radius * 1.1, height, 6]} />
      <meshStandardMaterial color="#b2b5ba" roughness={0.7} />
    </mesh>
  );
}

// ─── Vidhana Soudha Helper components ───────────────────────────
function VidhanaSoudhaColumns() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const cols = [-16.5, -13.5, -10.5, -7.5, -4.5, -1.5, 1.5, 4.5, 7.5, 10.5, 13.5, 16.5];
  
  useEffect(() => {
    if (!meshRef.current) return;
    const dummy = new THREE.Object3D();
    cols.forEach((x, idx) => {
      dummy.position.set(x, 17, 22.5);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(idx, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, []);

  return (
    <instancedMesh ref={meshRef} args={[null as any, null as any, 12]}>
      <cylinderGeometry args={[0.8, 0.8 * 1.1, 14, 6]} />
      <meshStandardMaterial color="#b2b5ba" roughness={0.7} />
    </instancedMesh>
  );
}

function VidhanaSoudhaWindows() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const rows = [-8, -2, 4, 10];
  const cols = [-20, -14, -8, 8, 14, 20];
  
  useEffect(() => {
    if (!meshRef.current) return;
    const dummy = new THREE.Object3D();
    let idx = 0;
    for (const y of rows) {
      for (const x of cols) {
        dummy.position.set(x, y + 14, 19.05);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(idx++, dummy.matrix);
        
        dummy.position.set(x, y + 14, -19.05);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(idx++, dummy.matrix);
      }
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, []);

  return (
    <instancedMesh ref={meshRef} args={[null as any, null as any, 48]}>
      <boxGeometry args={[2.5, 3.2, 0.1]} />
      <meshStandardMaterial color="#ffa040" emissive="#ffa040" emissiveIntensity={1.8} toneMapped={false} />
    </instancedMesh>
  );
}

// ─── Vidhana Soudha (City Hall Centerpiece) ─────────────────────
export function VidhanaSoudha({ position }: { position: [number, number, number] }) {
  // Scale 3.2× so the kalasham apex reaches ~145 units — visible alongside the Central Tower
  return (
    <group position={position} scale={[3.2, 3.2, 3.2]}>
      {/* 3-Tier Stepped Base */}
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[60, 2, 50]} />
        <meshStandardMaterial color="#5e6268" roughness={0.8} />
      </mesh>
      <mesh position={[0, 2.5, 0]}>
        <boxGeometry args={[56, 1, 46]} />
        <meshStandardMaterial color="#4a4d52" roughness={0.85} />
      </mesh>
      <mesh position={[0, 3.5, 0]}>
        <boxGeometry args={[52, 1, 42]} />
        <meshStandardMaterial color="#3a3c40" roughness={0.9} />
      </mesh>

      {/* Main Building Block */}
      <mesh position={[0, 14, 0]}>
        <boxGeometry args={[48, 20, 38]} />
        <meshStandardMaterial color="#e8dcc8" roughness={0.65} />
      </mesh>

      {/* Front Grand Porch Base */}
      <mesh position={[0, 7, 21.5]}>
        <boxGeometry args={[36, 6, 6]} />
        <meshStandardMaterial color="#dcd2c0" roughness={0.7} />
      </mesh>

      {/* Porch Pillars (12 columns) */}
      <VidhanaSoudhaColumns />

      {/* Porch Roof Pediment */}
      <mesh position={[0, 25.5, 21]}>
        <boxGeometry args={[38, 3, 7]} />
        <meshStandardMaterial color="#bdae96" roughness={0.5} />
      </mesh>
      <mesh position={[0, 28, 21]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[20, 2.5, 4]} />
        <meshStandardMaterial color="#a89a84" roughness={0.6} />
      </mesh>

      {/* Central Dome Drum */}
      <mesh position={[0, 26, 0]}>
        <cylinderGeometry args={[14, 15, 4, 8]} />
        <meshStandardMaterial color="#ded0b8" roughness={0.7} />
      </mesh>
      {/* Central Main Dome */}
      <mesh position={[0, 32, 0]}>
        <sphereGeometry args={[12, 10, 8]} />
        <meshStandardMaterial color="#cfa850" emissive="#cfa850" emissiveIntensity={0.25} roughness={0.4} />
      </mesh>
      {/* Golden Kalasham (apex finial) */}
      <mesh position={[0, 44.5, 0]}>
        <sphereGeometry args={[2.0, 8, 6]} />
        <meshStandardMaterial color="#ffa116" emissive="#ffa116" emissiveIntensity={3.5} toneMapped={false} />
      </mesh>

      {/* Glowing Facade Name Marquee */}
      <mesh position={[0, 21, 19.1]}>
        <boxGeometry args={[30, 2.5, 0.2]} />
        <meshStandardMaterial color="#0d0d0f" />
      </mesh>
      <mesh position={[0, 21, 19.22]}>
        <boxGeometry args={[26, 1.2, 0.05]} />
        <meshStandardMaterial color="#ffa116" emissive="#ffa116" emissiveIntensity={2.5} toneMapped={false} />
      </mesh>

      {/* Rows of Windows (Front/Back) */}
      <VidhanaSoudhaWindows />
    </group>
  );
}

// ─── Bangalore Palace Tower ─────────────────────────────────────
export function BangalorePalace({ position }: { position: [number, number, number] }) {
  // Scale 2.5× so the spire top reaches ~135 units — visible from across the city
  return (
    <group position={position} scale={[2.5, 2.5, 2.5]}>
      {/* Stone Foundation Base */}
      <mesh position={[0, 2, 0]}>
        <boxGeometry args={[18, 4, 18]} />
        <meshStandardMaterial color="#7c7365" roughness={0.9} />
      </mesh>

      {/* Main Gothic Tower Block */}
      <mesh position={[0, 24, 0]}>
        <boxGeometry args={[14, 40, 14]} />
        <meshStandardMaterial color="#c8a880" roughness={0.7} />
      </mesh>

      {/* Crenellated Battlements (Castle-like top slots) */}
      <mesh position={[0, 44.5, 0]}>
        <boxGeometry args={[14.4, 1, 14.4]} />
        <meshStandardMaterial color="#886b45" roughness={0.8} />
      </mesh>
      {/* Battlements teeth */}
      {[[-7, -7], [-7, -3], [-7, 3], [-7, 7], [7, -7], [7, -3], [7, 3], [7, 7]].map(([x, z], idx) => (
        <mesh key={`teeth-x-${idx}`} position={[x, 45.5, z]}>
          <boxGeometry args={[1.5, 1.2, 1.5]} />
          <meshStandardMaterial color="#c8a880" roughness={0.7} />
        </mesh>
      ))}

      {/* Spires (Corner Turrets) */}
      {[[-6.2, -6.2], [-6.2, 6.2], [6.2, -6.2], [6.2, 6.2]].map(([tx, tz], idx) => (
        <group key={`spire-${idx}`} position={[tx, 44, tz]}>
          <mesh position={[0, 3, 0]}>
            <cylinderGeometry args={[1.5, 1.8, 6, 5]} />
            <meshStandardMaterial color="#886b45" roughness={0.8} />
          </mesh>
          <mesh position={[0, 8, 0]}>
            <coneGeometry args={[1.6, 5, 5]} />
            <meshStandardMaterial color="#302d28" roughness={0.6} />
          </mesh>
        </group>
      ))}

      {/* 4 Clock Faces (Glowing at night) */}
      {/* Front */}
      <mesh position={[0, 34, 7.05]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[2.5, 2.5, 0.2, 8]} />
        <meshStandardMaterial color="#ffffdd" emissive="#ffffcc" emissiveIntensity={2.5} toneMapped={false} />
      </mesh>
      {/* Back */}
      <mesh position={[0, 34, -7.05]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[2.5, 2.5, 0.2, 8]} />
        <meshStandardMaterial color="#ffffdd" emissive="#ffffcc" emissiveIntensity={2.5} toneMapped={false} />
      </mesh>
      {/* Right */}
      <mesh position={[7.05, 34, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[2.5, 2.5, 0.2, 8]} />
        <meshStandardMaterial color="#ffffdd" emissive="#ffffcc" emissiveIntensity={2.5} toneMapped={false} />
      </mesh>
      {/* Left */}
      <mesh position={[-7.05, 34, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[2.5, 2.5, 0.2, 8]} />
        <meshStandardMaterial color="#ffffdd" emissive="#ffffcc" emissiveIntensity={2.5} toneMapped={false} />
      </mesh>

      {/* Rose window (central circular window) */}
      <mesh position={[0, 18, 7.05]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.8, 1.8, 0.2, 6]} />
        <meshStandardMaterial color="#ff2288" emissive="#ff2288" emissiveIntensity={2.0} toneMapped={false} />
      </mesh>
    </group>
  );
}

// ─── Tipu Sultan's Fort Walls ───────────────────────────────────
export function TipuSultanFortWall({
  position,
  rotation = 0,
}: {
  position: [number, number, number];
  rotation?: number;
}) {
  // Scale 3.5× so fort walls reach ~32 units — actually visible as gate structures
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={[3.5, 3.5, 3.5]}>
      {/* Stone Wall Segment */}
      <mesh position={[0, 4, 0]}>
        <boxGeometry args={[40, 8, 3]} />
        <meshStandardMaterial color="#6e685f" roughness={0.9} />
      </mesh>

      {/* Wall Battlement Teeth */}
      {[-18, -12, -6, 0, 6, 12, 18].map((x) => (
        <mesh key={x} position={[x, 8.6, 0]}>
          <boxGeometry args={[3, 1.2, 3]} />
          <meshStandardMaterial color="#5c564e" roughness={0.9} />
        </mesh>
      ))}

      {/* Torch brackets with glowing flame */}
      {[-12, 12].map((x) => (
        <group key={`torch-${x}`} position={[x, 5, 1.6]}>
          <mesh>
            <boxGeometry args={[0.3, 1.0, 0.3]} />
            <meshStandardMaterial color="#2d2b27" />
          </mesh>
          <mesh position={[0, 0.8, 0]}>
            <sphereGeometry args={[0.6, 6, 4]} />
            <meshStandardMaterial color="#ff7700" emissive="#ff7700" emissiveIntensity={2.5} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ─── Gateway of India (Mumbai Landmark) ──────────────────────────
export function GatewayOfIndia({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} scale={[3.5, 3.5, 3.5]}>
      {/* Foundation Platform */}
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[45, 3, 30]} />
        <meshStandardMaterial color="#404348" roughness={0.95} />
      </mesh>

      {/* Main Arch Block */}
      <mesh position={[0, 17, 0]}>
        <boxGeometry args={[38, 28, 24]} />
        <meshStandardMaterial color="#d1c5b0" roughness={0.7} />
      </mesh>

      {/* Central Grand Arch cutout (glowing yellow) */}
      <mesh position={[0, 12, 0.1]}>
        <boxGeometry args={[14, 18, 24.2]} />
        <meshStandardMaterial color="#ffa500" emissive="#ffa500" emissiveIntensity={1.2} roughness={0.5} />
      </mesh>

      {/* Side Arches */}
      {[-13, 13].map((x) => (
        <mesh key={x} position={[x, 8, 0.1]}>
          <boxGeometry args={[5, 10, 24.2]} />
          <meshStandardMaterial color="#cc8500" emissive="#cc8500" emissiveIntensity={1.0} roughness={0.5} />
        </mesh>
      ))}

      {/* Four Corner Turrets / Minarets */}
      {[[-17, -10], [-17, 10], [17, -10], [17, 10]].map(([x, z], idx) => (
        <group key={idx} position={[x, 31, z]}>
          <mesh>
            <cylinderGeometry args={[1.8, 2.0, 8, 6]} />
            <meshStandardMaterial color="#bdae96" roughness={0.6} />
          </mesh>
          <mesh position={[0, 5, 0]}>
            <sphereGeometry args={[1.5, 8, 6]} />
            <meshStandardMaterial color="#ffa116" emissive="#ffa116" emissiveIntensity={2.5} toneMapped={false} />
          </mesh>
        </group>
      ))}

      {/* Top Roof Parapet decoration */}
      <mesh position={[0, 32, 0]}>
        <boxGeometry args={[34, 2, 20]} />
        <meshStandardMaterial color="#bdae96" roughness={0.8} />
      </mesh>
      <mesh position={[0, 33.5, 0]}>
        <cylinderGeometry args={[8, 9, 2, 8]} />
        <meshStandardMaterial color="#d1c5b0" roughness={0.7} />
      </mesh>
    </group>
  );
}

// ─── Charminar (Hyderabad Landmark) ─────────────────────────────
export function Charminar({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} scale={[3.5, 3.5, 3.5]}>
      {/* Base Square Block */}
      <mesh position={[0, 15, 0]}>
        <boxGeometry args={[32, 30, 32]} />
        <meshStandardMaterial color="#e3d8c3" roughness={0.8} />
      </mesh>

      {/* 4 Grand Archway Cutouts (glowing warm orange) */}
      {/* North / South */}
      <mesh position={[0, 10, 0]}>
        <boxGeometry args={[16, 20, 32.4]} />
        <meshStandardMaterial color="#ff9000" emissive="#ff9000" emissiveIntensity={1.0} roughness={0.6} />
      </mesh>
      {/* East / West */}
      <mesh position={[0, 10, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[16, 20, 32.4]} />
        <meshStandardMaterial color="#ff9000" emissive="#ff9000" emissiveIntensity={1.0} roughness={0.6} />
      </mesh>

      {/* Balcony Railings */}
      <mesh position={[0, 30.5, 0]}>
        <boxGeometry args={[34, 1.5, 34]} />
        <meshStandardMaterial color="#8a7c65" roughness={0.9} />
      </mesh>

      {/* Four Corner Minarets */}
      {[[-15, -15], [-15, 15], [15, -15], [15, 15]].map(([x, z], idx) => (
        <group key={idx} position={[x, 32, z]}>
          {/* Lower Shaft */}
          <mesh position={[0, 10, 0]}>
            <cylinderGeometry args={[2.0, 2.2, 20, 8]} />
            <meshStandardMaterial color="#d0c2aa" roughness={0.7} />
          </mesh>
          {/* Middle Balcony */}
          <mesh position={[0, 20, 0]}>
            <cylinderGeometry args={[2.8, 2.2, 1.5, 8]} />
            <meshStandardMaterial color="#8a7c65" roughness={0.9} />
          </mesh>
          {/* Upper Shaft */}
          <mesh position={[0, 28, 0]}>
            <cylinderGeometry args={[1.5, 1.8, 16, 6]} />
            <meshStandardMaterial color="#d0c2aa" roughness={0.7} />
          </mesh>
          {/* Minaret Dome Cap */}
          <mesh position={[0, 37, 0]}>
            <sphereGeometry args={[1.8, 8, 6]} />
            <meshStandardMaterial color="#ffa116" emissive="#ffa116" emissiveIntensity={2.5} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ─── India Gate (Delhi Landmark) ────────────────────────────────
export function IndiaGate({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} scale={[3.5, 3.5, 3.5]}>
      {/* 3-Tier Base Platform */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[48, 1, 28]} />
        <meshStandardMaterial color="#474747" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[44, 1, 24]} />
        <meshStandardMaterial color="#363636" roughness={0.95} />
      </mesh>

      {/* Main Arch Pillars (Pylon blocks) */}
      {/* Left side */}
      <mesh position={[-14, 21, 0]}>
        <boxGeometry args={[12, 38, 18]} />
        <meshStandardMaterial color="#e0a979" roughness={0.75} />
      </mesh>
      {/* Right side */}
      <mesh position={[14, 21, 0]}>
        <boxGeometry args={[12, 38, 18]} />
        <meshStandardMaterial color="#e0a979" roughness={0.75} />
      </mesh>

      {/* Top Arch lintel beam */}
      <mesh position={[0, 43, 0]}>
        <boxGeometry args={[42, 6, 20]} />
        <meshStandardMaterial color="#cca27c" roughness={0.7} />
      </mesh>
      <mesh position={[0, 48, 0]}>
        <boxGeometry args={[36, 4, 16]} />
        <meshStandardMaterial color="#b38a64" roughness={0.8} />
      </mesh>

      {/* Central Arch cutout glow */}
      <mesh position={[0, 17, 0]}>
        <boxGeometry args={[16, 26, 18.2]} />
        <meshStandardMaterial color="#ff7f24" emissive="#ff7f24" emissiveIntensity={1.0} roughness={0.5} />
      </mesh>

      {/* Amar Jawan Jyoti Pedestal */}
      <group position={[0, 2.5, 0]}>
        {/* Black Pedestal */}
        <mesh>
          <boxGeometry args={[4, 2, 4]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.2} metalness={0.8} />
        </mesh>
        {/* Glowing Flame */}
        <mesh position={[0, 1.6, 0]}>
          <coneGeometry args={[0.5, 1.5, 5]} />
          <meshStandardMaterial color="#ffa116" emissive="#ff6600" emissiveIntensity={4.0} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

// ─── Marina Lighthouse (Chennai Landmark) ────────────────────────
export function MarinaLighthouse({ position }: { position: [number, number, number] }) {
  const beamRef = useRef<THREE.Mesh>(null);

  // Animate spotlight rotation
  useFrame(({ clock }) => {
    if (beamRef.current) {
      beamRef.current.rotation.y = clock.elapsedTime * 0.8;
    }
  });

  return (
    <group position={position} scale={[3.8, 3.8, 3.8]}>
      {/* Square base building */}
      <mesh position={[0, 4, 0]}>
        <boxGeometry args={[18, 8, 18]} />
        <meshStandardMaterial color="#b2b5ba" roughness={0.8} />
      </mesh>

      {/* Red & White Banded Tower Shaft */}
      {/* White segment 1 */}
      <mesh position={[0, 16, 0]}>
        <cylinderGeometry args={[4, 4.5, 16, 8]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.7} />
      </mesh>
      {/* Red segment */}
      <mesh position={[0, 32, 0]}>
        <cylinderGeometry args={[3.5, 4, 16, 8]} />
        <meshStandardMaterial color="#cc2222" roughness={0.6} />
      </mesh>
      {/* White segment 2 */}
      <mesh position={[0, 44, 0]}>
        <cylinderGeometry args={[3.2, 3.5, 8, 8]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.7} />
      </mesh>

      {/* Control Room / Cabin (Glowing cyan windows) */}
      <mesh position={[0, 50, 0]}>
        <cylinderGeometry args={[4, 4, 4, 8]} />
        <meshStandardMaterial color="#00ffff" emissive="#008888" emissiveIntensity={1.5} roughness={0.3} />
      </mesh>

      {/* Black Roof cap */}
      <mesh position={[0, 53, 0]}>
        <coneGeometry args={[4.5, 2.5, 8]} />
        <meshStandardMaterial color="#2d2d30" roughness={0.5} />
      </mesh>

      {/* Rotating Light Beam Group */}
      <group position={[0, 50, 0]} ref={beamRef}>
        <mesh position={[0, 0, 30]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[8, 60, 12, 1, true]} />
          <meshBasicMaterial
            color="#00ffff"
            transparent
            opacity={0.3}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>
    </group>
  );
}

// ─── Shaniwar Wada (Pune Landmark) ──────────────────────────────
export function ShaniwarWada({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} scale={[3.5, 3.5, 3.5]}>
      {/* Main Massive Wall Base */}
      <mesh position={[0, 6, 0]}>
        <boxGeometry args={[48, 12, 6]} />
        <meshStandardMaterial color="#544c41" roughness={0.95} />
      </mesh>

      {/* Two Corner Bastions (Semi-cylindrical stone projections) */}
      {[-24, 24].map((x) => (
        <mesh key={x} position={[x, 6, 0]}>
          <cylinderGeometry args={[4, 4.5, 12, 8]} />
          <meshStandardMaterial color="#474138" roughness={0.9} />
        </mesh>
      ))}

      {/* Central Heavy Gate Arch */}
      <mesh position={[0, 5, 3.1]}>
        <boxGeometry args={[10, 10, 0.4]} />
        <meshStandardMaterial color="#1f1a14" roughness={0.9} />
      </mesh>
      {/* Glowing gate lanterns */}
      {[-6, 6].map((x) => (
        <mesh key={x} position={[x, 7, 3.4]}>
          <boxGeometry args={[0.6, 1.2, 0.6]} />
          <meshStandardMaterial color="#ffa116" emissive="#ffa116" emissiveIntensity={3.0} toneMapped={false} />
        </mesh>
      ))}

      {/* Spiked Gate Doors inside the arch */}
      <mesh position={[0, 4, 3.0]}>
        <boxGeometry args={[8, 8, 0.2]} />
        <meshStandardMaterial color="#383025" roughness={0.8} />
      </mesh>

      {/* Wall Crenellations */}
      {[-20, -15, -10, -5, 0, 5, 10, 15, 20].map((x) => (
        <mesh key={x} position={[x, 12.6, 0]}>
          <boxGeometry args={[2.5, 1.2, 5.8]} />
          <meshStandardMaterial color="#423b31" roughness={0.95} />
        </mesh>
      ))}
    </group>
  );
}

// ─── ISRO Rocket (Bengaluru Secondary Landmark) ───────────────────
export function IsroRocket({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} scale={[4.5, 4.5, 4.5]}>
      {/* Launch Pad Base */}
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[20, 3, 20]} />
        <meshStandardMaterial color="#505359" roughness={0.9} />
      </mesh>
      <mesh position={[0, 9, -6]}>
        <boxGeometry args={[4, 18, 4]} />
        <meshStandardMaterial color="#c22222" roughness={0.8} />
      </mesh>

      {/* Rocket Main Booster Stage (Cylinder) */}
      <mesh position={[0, 22, 0]}>
        <cylinderGeometry args={[2.4, 2.4, 32, 10]} />
        <meshStandardMaterial color="#fcfcfc" roughness={0.5} metalness={0.1} />
      </mesh>

      {/* Saffron & Green Accent Bands */}
      <mesh position={[0, 36, 0]}>
        <cylinderGeometry args={[2.42, 2.42, 1.5, 10]} />
        <meshStandardMaterial color="#ffa030" roughness={0.5} />
      </mesh>
      <mesh position={[0, 8, 0]}>
        <cylinderGeometry args={[2.42, 2.42, 1.5, 10]} />
        <meshStandardMaterial color="#008000" roughness={0.5} />
      </mesh>

      {/* Side Strap-on Boosters (2 cylinders) */}
      {[-3.2, 3.2].map((x) => (
        <group key={x} position={[x, 13, 0]}>
          <mesh>
            <cylinderGeometry args={[1.0, 1.0, 18, 8]} />
            <meshStandardMaterial color="#f0f0f0" roughness={0.6} />
          </mesh>
          <mesh position={[0, 10, 0]}>
            <coneGeometry args={[1.0, 2.5, 8]} />
            <meshStandardMaterial color="#cc2222" roughness={0.5} />
          </mesh>
        </group>
      ))}

      {/* Payload Fairing Nosecone */}
      <mesh position={[0, 42, 0]}>
        <coneGeometry args={[2.4, 8, 10]} />
        <meshStandardMaterial color="#e6e6e6" roughness={0.4} />
      </mesh>

      {/* ISRO Logo panel glow */}
      <mesh position={[0, 30, 2.35]}>
        <boxGeometry args={[1.8, 1.8, 0.1]} />
        <meshStandardMaterial color="#0055a5" emissive="#0055a5" emissiveIntensity={2.0} toneMapped={false} />
      </mesh>
    </group>
  );
}
