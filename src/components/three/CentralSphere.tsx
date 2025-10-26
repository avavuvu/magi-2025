import { Html } from "@react-three/drei";
import { useThree, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Mesh } from "three";

const CentralSphere = () => {
    const meshRef = useRef<Mesh>(null!);
    const invalidate = useThree((state) => state.invalidate);

    useFrame((state) => {
        if (!meshRef.current) return;

        meshRef.current.rotation.y += 0.005;
        meshRef.current.rotation.x =
            Math.sin(state.clock.elapsedTime * 0.5) * 0.1;

        invalidate();
    });

    return (
        <mesh ref={meshRef}>
            <sphereGeometry args={[1, 32, 32]} />

            <Html distanceFactor={8} position={[0, 0, 0]} center>
                <div
                    style={{
                        textAlign: "center",
                        pointerEvents: "none",
                        userSelect: "none",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "0px",
                    }}
                >
                    <img
                        src="/MAGI_Banner.webp"
                        alt="ORBITS MAGI EXPO 2025"
                        style={{
                            width: "350px",
                            height: "auto",
                            filter: "drop-shadow(0 0 20px rgba(255, 255, 255, 0.5))",
                            marginBottom: "10px",
                            border: "1px solid black",
                        }}
                    />
                    <div
                        style={{
                            fontSize: "14px",
                            fontFamily: "monospace",
                            color: "#000000",
                            letterSpacing: "3px",
                            textTransform: "uppercase",
                            padding: "6px 16px",
                            backdropFilter: "blur(5px)",
                        }}
                    >
                        RMIT EXPO 2025
                    </div>
                </div>
            </Html>
        </mesh>
    );
};


export default CentralSphere