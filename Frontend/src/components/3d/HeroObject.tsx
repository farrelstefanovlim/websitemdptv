"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Image } from "@react-three/drei";
import * as THREE from "three";

export default function HeroObject() {
    const groupRef = useRef<THREE.Group>(null);

    // Track mouse and apply slight rotation/floating effect
    useFrame((state) => {
        if (!groupRef.current) return;

        // Normalize mouse coordinates (-1 to 1) provided by R3F state.pointer
        const targetX = (state.pointer.x * Math.PI) / 8;
        const targetY = (state.pointer.y * Math.PI) / 8;

        // Smooth lerping to pointer position
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetX, 0.1);
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -targetY, 0.1);

        // Slight floating animation
        groupRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.2;
    });

    return (
        <group ref={groupRef}>
            <Image
                url="/images/mdptv-white.png"
                transparent
                scale={3}
                position={[0, 0, 0]}
            />
        </group>
    );
}
