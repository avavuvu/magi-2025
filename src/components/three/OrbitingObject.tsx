import { Html, Line, useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Group, Color, Mesh, Material, MeshPhongMaterial } from "three";

interface OrbitingObjectProps {
    modelPath: string;
    radius: number;
    speed: number;
    initialAngle: number;
    label: string;
    scale: number;
}

const OrbitingObject = ({
    modelPath,
    radius,
    speed,
    initialAngle,
    label,
    scale = 1,
}: OrbitingObjectProps) => {
    const { scene } = useGLTF(modelPath);
    const groupRef = useRef<Group>(null!);
    const invalidate = useThree((state) => state.invalidate);

    const clonedScene = useMemo(() => {
        const cloned = scene.clone();

        cloned.traverse((child) => {
            if ((child as Mesh).isMesh) {
                const mesh = child as Mesh;
                if (mesh.geometry) {
                    mesh.geometry.computeBoundingSphere();
                }
                if (mesh.material) {
                    const material = Array.isArray(mesh.material)
                        ? mesh.material[0]
                        : mesh.material;
                    (material as MeshPhongMaterial).emissive = new Color(
                        0x00ff88,
                    );
                    (material as MeshPhongMaterial).emissiveIntensity = 0.5;
                }
            }
        });
        return cloned;
    }, [scene]);

    useEffect(() => {
        // Initial position setup
        if (groupRef.current) {
            const angle = initialAngle;
            const newX = Math.cos(angle) * radius;
            const newZ = Math.sin(angle) * radius;
            groupRef.current.position.set(newX, 0, newZ);
            invalidate();
        }

        return () => {
            if (clonedScene) {
                clonedScene.traverse((child) => {
                    const mesh = child as Mesh;
                    if (mesh.geometry) mesh.geometry.dispose();
                    if (mesh.material) {
                        const materials = Array.isArray(mesh.material)
                            ? mesh.material
                            : [mesh.material];
                        materials.forEach((material) => {
                            Object.keys(material).forEach((key) => {
                                //@ts-expect-error
                                if (material[key]?.isTexture) {
                                //@ts-expect-error
                                    material[key].dispose();
                                }
                            });
                            material.dispose();
                        });
                    }
                });
            }
        };
    }, [clonedScene, initialAngle, radius, invalidate]);

    // Animation loop
    useFrame((state) => {
        if (!groupRef.current) return;

        const time = state.clock.elapsedTime;
        const angle = time * speed + initialAngle;

        const newX = Math.cos(angle) * radius;
        const newZ = Math.sin(angle) * radius;

        groupRef.current.position.set(newX, 0, newZ);
        groupRef.current.rotation.y = time * 0.1;

        invalidate();
    });

    return (
        <group ref={groupRef}>
            <primitive object={scene} scale={scale} />

            <Line
                points={[
                    [0, 0, 0],
                    [1.2, 0, 0],
                ]}
                color="#ffffff"
                lineWidth={1}
            />

            <Html position={[1.2, 0, 0]} distanceFactor={8} center>
                <a
                    href={`/${label}`}
                    style={{
                        background: "rgba(233, 53, 158, 0.9)",
                        border: "2px solid rgba(233, 53, 158, 1)",
                        padding: "6px 12px",
                        color: "white",
                        fontSize: "12px",
                        fontFamily: "monospace",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                        whiteSpace: "nowrap",
                        backdropFilter: "blur(5px)",
                        boxShadow: "0 0 15px rgba(233, 53, 158, 0.5)",
                        display: "block",

                    }}
                >
                    {label}
                </a>
            </Html>
        </group>
    );
};

export default OrbitingObject;
