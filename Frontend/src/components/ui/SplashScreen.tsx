"use client";

import { useProgress } from "@react-three/drei";
import { useEffect, useState } from "react";
import gsap from "gsap";
import { useLenis } from "@studio-freight/react-lenis";

export default function SplashScreen() {
    const { progress } = useProgress();
    const [visible, setVisible] = useState(true);
    const lenis = useLenis();

    useEffect(() => {
        if (lenis && visible) {
            lenis.stop();
        }
    }, [lenis, visible]);

    useEffect(() => {
        if (progress === 100) {
            // Small delay prevents instant unmounting if it was cached
            gsap.to(".splash-screen-container", {
                opacity: 0,
                y: -50,
                duration: 1.5,
                delay: 0.8,
                ease: "power4.inOut",
                onComplete: () => {
                    setVisible(false);
                    if (lenis) lenis.start();
                }
            });
        }
    }, [progress, lenis]);

    if (!visible) return null;

    return (
        <div className="splash-screen-container fixed inset-0 z-[100] bg-black text-white flex flex-col items-center justify-center pointer-events-auto">
            <div className="flex flex-col items-center">
                <h2 className="text-cyan-400 text-2xl tracking-widest uppercase mb-6 animate-pulse duration-700 font-bold">
                    System Booting
                </h2>
                <div className="font-black text-8xl md:text-9xl tracking-tighter drop-shadow-[0_0_15px_rgba(0,229,255,0.3)]">
                    {Math.floor(progress)}<span className="text-cyan-400 opacity-80 text-6xl">%</span>
                </div>
                <div className="w-64 h-1 bg-white/10 mt-8 rounded overflow-hidden">
                    <div
                        className="h-full bg-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.8)] transition-[width] duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
