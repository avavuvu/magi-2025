import type { CameraProps, GLProps } from "@react-three/fiber";
import { NoToneMapping } from "three";

export const glSettings: GLProps = {
        antialias: false,
        powerPreference: "high-performance",
        alpha: true,
        stencil: false,
        depth: true,
        toneMapping: NoToneMapping,
        preserveDrawingBuffer: false,
    };

    export const cameraSettings: CameraProps = {
        position: [8, 8, 8],
        fov: 35,
        near: 0.1,
        far: 1000,
    };