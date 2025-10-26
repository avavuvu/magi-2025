import { OrbitControls, type OrbitControlsProps } from "@react-three/drei";
import { Canvas, type CameraProps, type GLProps } from "@react-three/fiber";
import { Group, Mesh, NoToneMapping } from "three";
import LanderScene from "@/three/LanderScene";
import type { ProjectData } from "src/lib/types";

const Lander = ({ projects }: { projects: ProjectData[] }) => {
    const glSettings: GLProps = {
        antialias: false,
        powerPreference: "high-performance",
        alpha: true,
        stencil: false,
        depth: true,
        toneMapping: NoToneMapping,
        preserveDrawingBuffer: false,
    };

    const cameraSettings: CameraProps = {
        position: [8, 8, 8],
        fov: 35,
        near: 0.1,
        far: 1000,
    };

    const orbitSettings: OrbitControlsProps = {
        enablePan: false,
        enableRotate: true,
    };

    return (
        <main className="">
            <div className="w-screen h-screen">
                <Canvas camera={cameraSettings} gl={glSettings}>
                    <color attach="background" args={["#000000"]} />
                    <fog attach="fog" args={["#000000", 8, 40]} />

                    <ambientLight intensity={2.5} color="#e6f3ff" />
                    <directionalLight
                        position={[10, 10, 5]}
                        intensity={1}
                        color="#ffffff"
                    />
                    <pointLight
                        position={[-10, -10, -10]}
                        intensity={0.4}
                        color="#ffd700"
                    />
                    <pointLight
                        position={[5, -5, 10]}
                        intensity={0.25}
                        color="#ff6b6b"
                    />

                    <OrbitControls {...orbitSettings}/>

                    <LanderScene isMobile={false} projects={projects} />

                </Canvas>
            </div>
        </main>
    );
};


export default Lander;
