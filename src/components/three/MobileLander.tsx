import { OrbitControls, type OrbitControlsProps } from "@react-three/drei";
import { Canvas, type CameraProps, type GLProps } from "@react-three/fiber";
import { Group, Mesh, NoToneMapping } from "three";
import LanderScene from "@/three/LanderScene";
import type { StudentData } from "src/lib/types";
import MobileProfiles from "@/MobileProfiles";
import { useScrollAnimation } from "src/lib/useScrollAnimation";
import { useEffect, useRef, useState } from "react";
import { cameraSettings, glSettings } from "src/lib/canvasSettings";


const Lander = ({ students }: { students: StudentData[] }) => {

    const orbitRotator = useRef<Group>(null!);
    const target = useRef<HTMLDivElement>(null!);

    const [ currentProject, setCurrentProject ] = useState<StudentData | null>(null)
    const scroll = useScrollAnimation(target);

    useEffect(() => {
        if(!orbitRotator.current) {
            return
        }

        orbitRotator.current.rotation.y = scroll * 10
    }, [scroll])

    useEffect(() => {
        setCurrentProject(students[Math.floor(scroll * students.length)])
    }, [currentProject, scroll])

    return (
        <main className="">
            <div className="sticky top-0 w-screen h-screen">
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

                    <group ref={orbitRotator}>
                        <LanderScene isMobile={true} students={students} />
                    </group>

                </Canvas>
            </div>
            <MobileProfiles ref={target} students={students} scroll={scroll} />
        </main>
    );
};


export default Lander;
