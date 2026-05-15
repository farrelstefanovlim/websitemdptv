"use client";

import { useState } from "react";

export default function Registration() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="absolute top-[400vh] w-full flex flex-col justify-center items-center pointer-events-none">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 drop-shadow-[0_0_15px_rgba(0,229,255,0.5)]">
                JOIN THE CREW
            </h2>

            <button
                onClick={() => setIsOpen(true)}
                className="pointer-events-auto px-12 py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-bold tracking-widest uppercase rounded-full shadow-[0_0_30px_rgba(0,229,255,0.6)] transition-all hover:scale-105"
            >
                Register Now
            </button>

            {/* Modal Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm pointer-events-auto">
                    <div className="bg-zinc-900 border border-zinc-700 p-8 rounded-xl max-w-md w-full relative">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 text-zinc-400 hover:text-white"
                        >
                            ✕
                        </button>
                        <h3 className="text-2xl font-bold text-cyan-400 mb-6">Recruitment Form</h3>
                        <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Full Name</label>
                                <input type="text" className="w-full bg-black border border-zinc-700 rounded p-3 text-white focus:border-cyan-400 focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">Division</label>
                                <select className="w-full bg-black border border-zinc-700 rounded p-3 text-white focus:border-cyan-400 focus:outline-none">
                                    <option>Graphic Design</option>
                                    <option>Videography</option>
                                    <option>Reporter</option>
                                </select>
                            </div>
                            <button className="mt-4 px-6 py-3 bg-cyan-500 text-black font-bold tracking-widest rounded hover:bg-cyan-400 transition-colors">
                                SUBMIT APPLICATION
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
