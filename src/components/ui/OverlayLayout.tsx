import { useState, useEffect } from "react";
import { useLenis } from "@studio-freight/react-lenis";
import DetailModal from "./DetailModal";

export default function OverlayLayout() {
    const [activeDetail, setActiveDetail] = useState<string | null>(null);
    const [currentFrame, setCurrentFrame] = useState(0);
    const totalFrames = 5;
    const lenis = useLenis();

    const handleNext = () => {
        if (!lenis) return;
        const nextFrame = Math.min(currentFrame + 1, totalFrames - 1);
        lenis.scrollTo(nextFrame * window.innerHeight, { duration: 1.5 });
        setCurrentFrame(nextFrame);
    };

    const handlePrev = () => {
        if (!lenis) return;
        const prevFrame = Math.max(currentFrame - 1, 0);
        lenis.scrollTo(prevFrame * window.innerHeight, { duration: 1.5 });
        setCurrentFrame(prevFrame);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (activeDetail) return; // Disable if modal is open
            if (e.key === "ArrowDown" || e.key === "ArrowRight") {
                handleNext();
            } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
                handlePrev();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [currentFrame, lenis, activeDetail]);

    // Keep track of scroll to update `currentFrame` when scrolled via mouse wheel
    useLenis((scroll) => {
        const frame = Math.round(scroll.scroll / window.innerHeight);
        setCurrentFrame((prev) => (prev !== frame ? frame : prev));
    });

    return (
        <>
            {/* Global Corner Decorators for Frames 2, 3, 4 */}
            <div
                className="fixed inset-0 pointer-events-none transition-opacity duration-700 ease-in-out z-0"
                style={{ opacity: currentFrame >= 1 && currentFrame <= 3 ? 1 : 0 }}
            >
                {/* Specific Left Decorators (Photography) */}
                <img
                    src="/images/kiri-atas.png"
                    alt="Top Left Decoration"
                    className={`absolute top-0 left-0 w-64 md:w-96 object-contain pointer-events-none transition-opacity duration-700 ${currentFrame === 1 ? 'opacity-100' : 'opacity-0'}`}
                />
                <img
                    src="/images/kiri-bawah.png"
                    alt="Bottom Left Decoration"
                    className={`absolute bottom-6 left-6 md:bottom-8 md:left-8 w-32 md:w-48 object-contain pointer-events-none transition-opacity duration-700 ${currentFrame === 1 ? 'opacity-100' : 'opacity-0'}`}
                />

                {/* Specific Right Decorators (Graphic Design) */}
                <img
                    src="/images/kanan-atas-design.png"
                    alt="Top Right Decoration"
                    className={`absolute top-0 right-0 w-64 md:w-96 object-contain pointer-events-none transition-opacity duration-700 ${currentFrame === 2 ? 'opacity-100' : 'opacity-0'}`}
                />
                <img
                    src="/images/kanan-bawah-design.png"
                    alt="Bottom Right Decoration"
                    className={`absolute bottom-6 right-6 md:bottom-8 md:right-8 w-32 md:w-48 object-contain pointer-events-none transition-opacity duration-700 ${currentFrame === 2 ? 'opacity-100' : 'opacity-0'}`}
                />

                {/* Specific Left Decorators (Comm & Info) */}
                <img
                    src="/images/kiri-atas-coms.png"
                    alt="Top Left Decoration Comm"
                    className={`absolute top-0 left-0 w-64 md:w-96 object-contain pointer-events-none transition-opacity duration-700 ${currentFrame === 3 ? 'opacity-100' : 'opacity-0'}`}
                />
                <img
                    src="/images/kiri-bawah-coms.png"
                    alt="Bottom Left Decoration Comm"
                    className={`absolute bottom-6 left-6 md:bottom-8 md:left-8 w-32 md:w-48 object-contain pointer-events-none transition-opacity duration-700 ${currentFrame === 3 ? 'opacity-100' : 'opacity-0'}`}
                />
            </div>

            <div className="absolute top-0 left-0 w-full z-10 pointer-events-none">

                {/* Frame 1: Hero (100vh) */}
                <section className="h-screen w-full flex flex-col justify-center items-center text-center p-8">
                    <header className="absolute top-0 w-full flex justify-between items-center max-w-7xl mx-auto p-8 pointer-events-auto">
                        <div className="text-2xl font-bold tracking-widest text-[#00E5FF]">MDPTV</div>
                        <div className="text-sm tracking-[0.3em] uppercase opacity-50">Est. 2025</div>
                    </header>

                    <h1 className="text-6xl md:text-9xl font-black tracking-tighter opacity-90 drop-shadow-2xl text-transparent bg-clip-text bg-gradient-to-r from-gray-500 via-white to-gray-500 animate-text-glow">
                        Innovation<br />Without Limit
                    </h1>
                    <p className="mt-6 text-lg tracking-widest text-cyan-200 uppercase opacity-70">
                        Scroll to Dive
                    </p>
                </section>

                {/* Frame 2: Photography (100vh) */}
                <section className="h-screen w-full flex items-center justify-center md:justify-start p-6 md:p-24 max-w-7xl mx-auto pointer-events-auto">
                    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 max-w-[90%] md:max-w-md shadow-2xl text-center md:text-left flex flex-col items-center md:items-start">
                        <div className="text-xs tracking-widest text-cyan-400 mb-2">01 / DIVISIONS</div>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-white mb-4">PHOTOGRAPHY</h2>
                        <p className="text-gray-300 leading-relaxed text-sm mb-6">
                            Capture the moment. We are looking for visual storytellers who understand lighting, composition, and the power of a single frame to convey deep emotions.
                        </p>
                        <button
                            onClick={() => setActiveDetail("PHOTOGRAPHY")}
                            className="px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-black text-sm font-bold tracking-widest uppercase rounded shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-all"
                        >
                            See More
                        </button>
                    </div>
                </section>

                {/* Frame 3: Graphic Design (100vh) */}
                <section className="h-screen w-full flex items-center justify-center md:justify-end p-6 md:p-24 max-w-7xl mx-auto pointer-events-auto">
                    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 max-w-[90%] md:max-w-md shadow-2xl text-center md:text-right flex flex-col items-center md:items-end">
                        <div className="text-xs tracking-widest text-pink-400 mb-2">02 / DIVISIONS</div>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-white mb-4">GRAPHIC DESIGN</h2>
                        <p className="text-gray-300 leading-relaxed text-sm mb-6">
                            Design the future. Translate complex ideas into stunning visual art. Mastery in visual hierarchy, typography, and modern digital aesthetics is key.
                        </p>
                        <button
                            onClick={() => setActiveDetail("GRAPHIC DESIGN")}
                            className="px-6 py-2 bg-pink-500 hover:bg-pink-400 text-white text-sm font-bold tracking-widest uppercase rounded shadow-[0_0_15px_rgba(255,0,85,0.4)] transition-all"
                        >
                            See More
                        </button>
                    </div>
                </section>

                {/* Frame 4: Communication & Information (100vh) */}
                <section className="h-screen w-full flex items-center justify-center md:justify-start p-6 md:p-24 max-w-7xl mx-auto pointer-events-auto">
                    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 max-w-[90%] md:max-w-md shadow-2xl text-center md:text-left flex flex-col items-center md:items-start">
                        <div className="text-xs tracking-widest text-purple-400 mb-2">03 / DIVISIONS</div>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-white mb-4">COMM & INFO</h2>
                        <p className="text-gray-300 leading-relaxed text-sm mb-6">
                            The voice of MDPTV. Be the bridge between the creatives and the audience as a reporter, scriptwriter, or public relations specialist.
                        </p>
                        <button
                            onClick={() => setActiveDetail("COMM & INFO")}
                            className="px-6 py-2 bg-purple-500 hover:bg-purple-400 text-white text-sm font-bold tracking-widest uppercase rounded shadow-[0_0_15px_rgba(176,38,255,0.4)] transition-all"
                        >
                            See More
                        </button>
                    </div>
                </section>

                {/* Frame 5: Registration CTA (100vh) */}
                <section className="h-screen w-full flex justify-center items-center pointer-events-auto p-6">
                    <div className="text-center">
                        <h2 className="text-4xl md:text-7xl font-black tracking-tighter mb-8 drop-shadow-[0_0_15px_rgba(0,229,255,0.5)] leading-tight text-white">
                            THE FINAL CUT
                        </h2>
                        <button className="px-8 md:px-12 py-3 md:py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-bold tracking-widest uppercase rounded-full shadow-[0_0_30px_rgba(0,229,255,0.6)] transition-all hover:scale-105">
                            Register Now
                        </button>
                    </div>
                </section>
            </div>

            {/* Navigation Arrows */}
            <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-40 flex gap-2 md:gap-4 pointer-events-auto scale-75 md:scale-100 origin-bottom-right">
                <button
                    onClick={handlePrev}
                    disabled={currentFrame === 0}
                    className={`w-12 h-12 rounded-full border border-white/20 bg-black/50 backdrop-blur-md flex items-center justify-center transition-all ${currentFrame === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/10 hover:border-cyan-400 text-white hover:text-cyan-400 focus:outline-none'}`}
                    aria-label="Previous Frame"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <button
                    onClick={handleNext}
                    disabled={currentFrame === totalFrames - 1}
                    className={`w-12 h-12 rounded-full border border-white/20 bg-black/50 backdrop-blur-md flex items-center justify-center transition-all ${currentFrame === totalFrames - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/10 hover:border-cyan-400 text-white hover:text-cyan-400 focus:outline-none shadow-[0_0_15px_rgba(0,229,255,0.2)] hover:shadow-[0_0_20px_rgba(0,229,255,0.6)]'}`}
                    aria-label="Next Frame"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            {activeDetail && (
                <DetailModal
                    title={activeDetail}
                    onClose={() => setActiveDetail(null)}
                />
            )}
        </>
    );
}
