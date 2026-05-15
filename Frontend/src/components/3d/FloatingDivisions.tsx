"use client";

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Center, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useResponsiveCtx } from "@/hooks/useResponsiveCtx";

export default function FloatingDivisions() {
    const photoRef = useRef<THREE.Group>(null);
    const designRef = useRef<THREE.Group>(null);
    const commRef = useRef<THREE.Group>(null);
    const { scene: photoScene } = useGLTF("/models/photography.glb");
    const { scene: designScene } = useGLTF("/models/design graphic.glb");
    const { scene: commScene } = useGLTF("/models/comm and info.glb");

    // Clean up baked-in floors/shadows from the provided models
    useEffect(() => {
        const cleanScene = (scene: THREE.Group) => {
            scene.traverse((child) => {
                if ((child as THREE.Mesh).isMesh) {
                    const name = child.name.toLowerCase();
                    if (name.includes("plane") || name.includes("floor") || name.includes("shadow") || name.includes("ground") || name.includes("grid")) {
                        child.visible = false;
                    }
                }
            });
        };
        cleanScene(photoScene);
        cleanScene(designScene);
        cleanScene(commScene);
    }, [photoScene, designScene, commScene]);

    const { isMobile, isTablet } = useResponsiveCtx();
    const scale = isMobile ? 0.6 : isTablet ? 0.8 : 1;

    const getScale = (m: number, t: number, d: number) => isMobile ? m : isTablet ? t : d;
    const getPos = (m: [number, number, number], t: [number, number, number], d: [number, number, number]): [number, number, number] =>
        isMobile ? m : isTablet ? t : d;

    useFrame((state) => {
        const time = state.clock.elapsedTime;
        // Slowing down the rotation speed so downloaded models don't whip around crazily
        if (photoRef.current) photoRef.current.rotation.y = time * 0.15;
        if (designRef.current) designRef.current.rotation.y = time * 0.15 + 1;
        if (commRef.current) commRef.current.rotation.y = time * 0.15 + 2;
    });

    return (
        <>
            {/* Frame 2: Photography (Text Left, Model Right) */}
            <group position={getPos([0, -0.7, -1.8], [0.2, -0.2, -2], [0.4, -0.2, -2])} ref={photoRef}>
                <Float speed={2} rotationIntensity={isMobile ? 0.4 : 0.8} floatIntensity={1}>
                    <primitive object={photoScene} scale={getScale(3, 4.5, 6)} />
                </Float>
            </group>

            {/* Frame 3: Graphic Design (Text Right, Model Left) */}
            <group position={getPos([0, -1.2, -14], [-1.5, -0.5, -15], [-3, -0.5, -15])} ref={designRef}>
                <Float speed={2} rotationIntensity={isMobile ? 0.4 : 0.8} floatIntensity={1}>
                    <primitive object={designScene} scale={getScale(0.3, 0.45, 0.6)} />
                </Float>
            </group>

            {/* Frame 4: Comm & Info (Text Left, Model Right) */}
            <group position={getPos([0, -1.4, -22.5], [0.25, -0.6, -22.5], [0.5, -0.6, -22.5])} ref={commRef}>
                <Float speed={2} rotationIntensity={isMobile ? 0.4 : 0.8} floatIntensity={1}>
                    <primitive object={commScene} scale={getScale(12, 18, 24)} />
                </Float>
            </group>

            {/* Frame 5: End Spotlight for Registration (Camera at Z=-30) */}
            <group position={[0, -2, -32]} scale={scale}>
                <spotLight
                    position={[0, 10, 0]}
                    angle={0.4}
                    penumbra={1}
                    intensity={800}
                    color="#00E5FF"
                />
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                    <circleGeometry args={[6, 64]} />
                    <meshStandardMaterial color="#111" roughness={0.8} />
                </mesh>
            </group>
        </>
    );
}

useGLTF.preload("/models/photography.glb");
useGLTF.preload("/models/design graphic.glb");
useGLTF.preload("/models/comm and info.glb");
