import { Point, Points } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { InstancedMesh, Matrix4, PointsMaterial, Quaternion, Vector3, type Mesh } from "three";
import DesktopAsteroidInteractive from "./DesktopAsteroidInteractive";
import type { StudentData } from "src/lib/types";

const AsteroidField = ({students, isMobile}: {students: StudentData[], isMobile: boolean}) => {
    const asteroidCount = students.length;

    const [ activeIndex, setActiveIndex ] = useState(0);
    const [ point, setPoint ] = useState<[number, number, number]>([-1,-1,-1]);

    const hitboxRef = useRef<InstancedMesh>(null!);

    const positions = useMemo(() => {
        const positions = new Float32Array(asteroidCount * 3);

        for (let i = 0; i < asteroidCount * 3; i += 3) {
            const index = i / 3;
            const angle =
                (Math.PI * 2 * index) / asteroidCount + Math.random() * 0.8;
            const distance = 2 + Math.random() * 2.7;
            const height = (Math.random() - 0.5) * 1.5;

            positions[i] = Math.cos(angle) * distance;
            positions[i + 1] = height;
            positions[i + 2] = Math.sin(angle) * distance;

        }

        return positions;
    }, []);

    useEffect(() => {
        if(!hitboxRef.current) {
            return
        }

        const matrix = new Matrix4()
        const position = new Vector3()
        const rotation = new Quaternion()
        const scale = new Vector3(.2, .2, .2)
        
        for (let i = 0; i < asteroidCount; i++) {
            position.set(
                positions[i * 3],
                positions[i * 3 + 1],
                positions[i * 3 + 2]
            )
        
            matrix.compose(position, rotation, scale)
            hitboxRef.current.setMatrixAt(i, matrix)
        }
        
        hitboxRef.current.instanceMatrix.needsUpdate = true
        hitboxRef.current.computeBoundingSphere()
    }, [hitboxRef])

    return (
        <group>
            <Points positions={positions} raycast={false}>
                <pointsMaterial size={0.1} color={0xffffff} />

                {!isMobile && (
                    <DesktopAsteroidInteractive projects={students} activeIndex={activeIndex} point={point}/>
                )}
            </Points>

            {!isMobile && (
                <instancedMesh
                    ref={hitboxRef}
                    args={[undefined, undefined, asteroidCount]}
                    frustumCulled={false}
                    renderOrder={1}
                    onPointerEnter={(event) => {
                        event.stopPropagation();
                        if(!event.instanceId) { return }

                        document.body.style.cursor = "pointer"

                        setActiveIndex(event.instanceId)
                        setPoint(event.point.toArray())
                    }}

                    onPointerLeave={(event) => {
                        event.stopPropagation()
                        document.body.style.cursor = "default"
                    }}

                    onPointerUp={(event) => {
                        event.stopPropagation()
                        window.location.href = `/${students[activeIndex].id}`
                    }}
                >
                    <sphereGeometry args={[1, 8, 6]} />
                    <meshBasicMaterial depthTest={false} visible={false} />
                </instancedMesh>
            )}

        </group>
    );
};

export default AsteroidField;
