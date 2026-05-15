"use client";

import { useProgress, Html } from "@react-three/drei";

export default function Preloader() {
    const { progress } = useProgress();

    return (
        <Html center>
            <div className="flex flex-col items-center justify-center font-mono pointer-events-none w-screen h-screen bg-black">
                <h2 className="text-cyan-400 text-2xl tracking-widest uppercase mb-4 animate-pulse duration-700">
                    System Booting
                </h2>
                <div className="font-bold text-5xl tracking-tighter text-white">
                    {Math.floor(progress)}<span className="text-cyan-400 opacity-80">%</span>
                </div>
                <div className="w-48 h-1 bg-white/20 mt-6 rounded overflow-hidden">
                    <div
                        className="h-full bg-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.8)] transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </Html>
    );
}
