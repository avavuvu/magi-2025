import { useRef, useState, useEffect, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Line } from "@react-three/drei"

export function Frame() {
    return (
        <Canvas gl={{alpha: true}}  camera={{ position: [8, 6, 8], fov: 35 }}>
            <ambientLight intensity={3} color="#e6f3ff" />
            <directionalLight position={[10, 10, 5]} intensity={1.2} color="#ffffff" />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ffd700" />
            <pointLight position={[5, -5, 10]} intensity={0.3} color="#ff6b6b" />
        
            <OrbitalSystem />
        
        </Canvas>
    );
}

export function OrbitalSystem() {
    const { camera, size } = useThree(); // Get camera and size from useThree
    const [showProfile, setShowProfile] = useState(false);
    const [profilePosition, setProfilePosition] = useState({ x: 0, y: 0 });
    const [targetPosition, setTargetPosition] = useState({ x: 0, y: 0 });
    const [planetPosition, setPlanetPosition] = useState(null);
    const [isFollowingMouse, setIsFollowingMouse] = useState(false);
    const [profileOpacity, setProfileOpacity] = useState(1);
    const [isFading, setIsFading] = useState(false);

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (isFollowingMouse && showProfile) {
                setTargetPosition({
                    x: e.clientX,
                    y: e.clientY,
                });
            }
        },
        [isFollowingMouse, showProfile],
    );

    // Add/remove mouse listener
    useEffect(() => {
        if (isFollowingMouse) {
            document.addEventListener("mousemove", handleMouseMove);
        } else {
            document.removeEventListener("mousemove", handleMouseMove);
        }

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
        };
    }, [isFollowingMouse, handleMouseMove]);

    return (
        <>
            {/* Main central sphere */}
            {/* <CentralSphere /> */}

            {/* Asteroid field - student profiles */}
            {/* <AsteroidField count={100} searchTerm={searchTerm} /> */}

            {/* First orbit - closest (Research - now clickable) */}
            <OrbitingSystem
                radius={2}
                speed={0.05}
                sphereColor="#ffffffff"
                initialAngle={0}
                onPositionUpdate={setPlanetPosition}
            />

            {/* Second orbit - middle */}
            <OrbitingSystem
                radius={3.3}
                speed={0.04}
                sphereColor="#ffffffff"
                initialAngle={Math.PI * 0.7}
            />

            {/* Third orbit - farthest with moon */}
            <OrbitingSystem
                radius={4.7}
                speed={0.03}
                sphereColor="#ffffffff"
                initialAngle={Math.PI * 1.3}
            />
        </>
    );
}

export function OrbitingSystem({
    radius,
    speed,
    sphereColor,
    initialAngle = 0,
    onClick,
    onPositionUpdate,
}: {
    radius: number,
    speed: number,
    sphereColor: string,
    initialAngle: number,
    onClick?: Function,
    onPositionUpdate?: Function
}) {
    const sphereRef = useRef<THREE.Mesh>(null!);
    const [planetPosition, setPlanetPosition] = useState({ x: 0, y: 0, z: 0 });

    const createDashedCircle = (radius: number, segments = 150) => {
        const points = [];
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            if (Math.floor(i / 3.1) % 2 === 0) {
                points.push(
                    new THREE.Vector3(
                        Math.cos(angle) * radius,
                        0,
                        Math.sin(angle) * radius,
                    ),
                );
            } else if (i > 0 && Math.floor((i - 1) / 3) % 2 === 0) {
                points.push(
                    new THREE.Vector3(
                        Math.cos(angle) * radius,
                        0,
                        Math.sin(angle) * radius,
                    ),
                );
                points.push(null);
            }
        }
        return points.filter((p) => p !== null);
    };

    const orbitPoints = createDashedCircle(radius);

    useFrame((state, delta) => {
        if (sphereRef.current) {
            const time = state.clock.elapsedTime;
            const angle = time * speed + initialAngle;

            const newX = Math.cos(angle) * radius;
            const newZ = Math.sin(angle) * radius;
            const newY = 0;

            sphereRef.current.position.x = newX;
            sphereRef.current.position.z = newZ;
            sphereRef.current.position.y = newY;

            const newPosition = { x: newX, y: newY, z: newZ };
            setPlanetPosition(newPosition);

            if (onPositionUpdate) {
                onPositionUpdate(newPosition);
            }

            // Smoother rotation using delta time
            sphereRef.current.rotation.x += delta * 0.5;
            sphereRef.current.rotation.y += delta * 0.5;
        }
    });

    return (
        <group>
            <Line
                points={orbitPoints}
                color={"white"}
                lineWidth={1}
                dashed={true}
                dashScale={1}
                dashSize={0.15}
                gapSize={0.1}
            />

            <mesh
                ref={sphereRef}
                onClick={onClick}
            >
                <sphereGeometry args={[0.3, 16, 16]} />
                <meshStandardMaterial
                    color={sphereColor}
                    metalness={0.2}
                    roughness={0.3}
                    emissive={sphereColor}
                    emissiveIntensity={0.1}
                />
            </mesh>
        </group>
    );
}
