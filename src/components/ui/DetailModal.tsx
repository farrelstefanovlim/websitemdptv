"use client";

interface Props {
    title: string;
    onClose: () => void;
}

export default function DetailModal({ title, onClose }: Props) {
    const dummyImages = [
        { src: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=2000&auto=format&fit=crop", style: "w-[80%] md:w-[40%] max-w-2xl aspect-[16/10] z-20" },  // Center Hero
        { src: "https://images.unsplash.com/photo-1542204165-65bf26472b9b?q=80&w=800&auto=format&fit=crop", style: "w-[35%] md:w-[25%] aspect-video absolute top-[10%] md:top-[15%] left-[2%] md:left-[5%] z-10 opacity-80 hover:opacity-100 hover:z-30" }, // Top Left
        { src: "https://images.unsplash.com/photo-1452626022479-8dba2b63229a?q=80&w=800&auto=format&fit=crop", style: "w-[35%] md:w-[22%] aspect-square absolute top-[5%] md:top-[10%] right-[2%] md:right-[10%] z-10 opacity-80 hover:opacity-100 hover:z-30" }, // Top Right
        { src: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800&auto=format&fit=crop", style: "w-[40%] md:w-[30%] aspect-[4/3] absolute bottom-[5%] md:bottom-[10%] left-[2%] md:left-[10%] z-10 opacity-80 hover:opacity-100 hover:z-30" }, // Bottom Left
        { src: "https://images.unsplash.com/photo-1517404215738-15263e9f9178?q=80&w=800&auto=format&fit=crop", style: "w-[35%] md:w-[25%] aspect-video absolute bottom-[10%] md:bottom-[15%] right-[2%] md:right-[5%] z-10 opacity-80 hover:opacity-100 hover:z-30" }, // Bottom Right
    ];

    return (
        <div className="fixed inset-0 z-50 bg-black backdrop-blur-3xl flex flex-col p-8 overflow-hidden">
            {/* Giant Background Typography */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
                <h1 className="text-[25vw] md:text-[15vw] font-black text-white/5 whitespace-nowrap select-none tracking-tighter">
                    {title}
                </h1>
            </div>

            <div className="relative w-full h-full flex flex-col z-10">
                <header className="flex justify-between items-center z-50">
                    <h2 className="text-xl md:text-3xl font-bold tracking-tighter text-white uppercase drop-shadow-md text-center max-w-[60%] md:max-w-full">
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-white hover:text-cyan-400 text-lg tracking-widest uppercase transition-colors z-50 backdrop-blur-md px-4 py-2 rounded border border-white/10 bg-black/50"
                    >
                        [ CLOSE ]
                    </button>
                </header>

                {/* Free-floating Layout Container */}
                <div className="relative flex-1 w-full h-full flex items-center justify-center mt-8">
                    {dummyImages.map((img, i) => (
                        <div key={i} className={`group ${img.style} overflow-hidden rounded-md border border-white/20 shadow-[-10px_20px_30px_rgba(0,0,0,0.8)] transition-all duration-500 hover:scale-105`}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={img.src}
                                alt={`Portfolio Item ${i + 1}`}
                                className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                            />

                            {/* Hover info for all scattered pieces */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <h3 className="text-md font-bold text-white mb-1">Project 0{i + 1}</h3>
                                <p className="text-xs text-cyan-300">View Detail →</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
