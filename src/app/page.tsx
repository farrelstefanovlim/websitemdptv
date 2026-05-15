"use client";

import { Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import Scene from "@/components/3d/Scene";
import OverlayLayout from "@/components/ui/OverlayLayout";
import SplashScreen from "@/components/ui/SplashScreen";

export default function Home() {
    useEffect(() => {
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
        window.scrollTo(0, 0);
    }, []);

    return (
        <main className="relative w-full h-[500vh]">
            {/* 3D Canvas fixed in background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <Canvas dpr={[1, 2]} shadows>
                    <Suspense fallback={null}>
                        <Scene />
                    </Suspense>
                </Canvas>
            </div>

            {/* HTML UI Overlay */}
            <OverlayLayout />

            {/* Global Splash Screen */}
            <SplashScreen />
        </main>
    );
}
