"use client";

import { PerspectiveCamera, Environment } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import CameraRig from "./CameraRig";
import HeroObject from "./HeroObject";
import FloatingDivisions from "./FloatingDivisions";
import { useResponsiveCtx } from "@/hooks/useResponsiveCtx";

export default function Scene() {
    const { isMobile, isTablet } = useResponsiveCtx();
    const getVal = (m: number, t: number, d: number) => isMobile ? m : isTablet ? t : d;

    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 0, getVal(12, 11, 10)]} fov={getVal(60, 55, 50)} />
            <Environment preset="city" />

            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} />

            {/* GSAP scroll trigger mechanics bounds to the camera */}
            <CameraRig />

            {/* Floating Hero Object */}
            <HeroObject />

            {/* Floating Divisions & Spotlight */}
            <FloatingDivisions />

            {/* Post Processing - Disabled completely on mobile for performance */}
            {!isMobile && (
                <EffectComposer disableNormalPass>
                    <Bloom luminanceThreshold={0.5} mipmapBlur intensity={1.5} />
                </EffectComposer>
            )}
        </>
    );
}
