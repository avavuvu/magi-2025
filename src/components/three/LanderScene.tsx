import { useGLTF } from "@react-three/drei";
import OrbitingObject from "./OrbitingObject";
import OrbitRing from "./OrbitRing";
import CentralSphere from "@/three/CentralSphere"

import animationModel from "@assets/models/animation.glb?url"
import researchModel from "@assets/models/research.glb?url"
import gamesModel from "@assets/models/games.glb?url"
import interactiveModel from "@assets/models/interactive.glb?url"
import AsteroidField from "./AsteroidField";

import type { ProjectData } from "src/lib/types";

useGLTF.preload(animationModel)
useGLTF.preload(researchModel)
useGLTF.preload(interactiveModel)
useGLTF.preload(gamesModel)

const LanderScene = ({projects, isMobile}: {projects: ProjectData[], isMobile: boolean}) => {
    return (
        <>
            <AsteroidField projects={projects} isMobile={isMobile} />

            <CentralSphere  />

            <OrbitRing radius={2} orbitColor="#ffffff" opacity={1.0} />
            <OrbitingObject
                modelPath={researchModel}
                radius={2}
                speed={0.04}
                initialAngle={0}
                label="Research"
                scale={0.3}
            />

            <OrbitRing radius={3.05} orbitColor="#ffffff" opacity={0.75} />
            <OrbitingObject
                modelPath={animationModel}
                radius={3.05}
                speed={0.03}
                initialAngle={Math.PI * 0.7}
                label="Animation"
                scale={0.3}
            />

            <OrbitRing radius={4.1} orbitColor="#ffffff" opacity={0.5} />
            <OrbitingObject
                modelPath={gamesModel}
                radius={4.1}
                speed={0.02}
                initialAngle={Math.PI * 1.3}
                label="Games"
                scale={0.3}
            />

            <OrbitRing radius={5.15} orbitColor="#ffffff" opacity={0.25} />
            <OrbitingObject
                modelPath={interactiveModel}
                radius={5.15}
                speed={0.015}
                initialAngle={Math.PI * 1.8}
                label="Interaction"
                scale={0.3}
            />


        </>
    );
};


export default LanderScene