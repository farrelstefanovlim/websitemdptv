"use client";

export default function AboutCards() {
    return (
        <div
            className="absolute top-[120vh] w-full flex justify-center items-center pointer-events-none p-4"
        >
            <div className="max-w-4xl grid md:grid-cols-2 gap-8 w-full pointer-events-auto">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl transition-transform hover:scale-105">
                    <h3 className="text-3xl font-bold text-cyan-300 mb-4 tracking-wider">VISION</h3>
                    <p className="text-gray-300 leading-relaxed text-lg">
                        To become the leading university broadcasting organization by delivering
                        high-quality multimedia content and fostering creative talents.
                    </p>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl transition-transform hover:scale-105">
                    <h3 className="text-3xl font-bold text-cyan-300 mb-4 tracking-wider">MISSION</h3>
                    <ul className="text-gray-300 leading-relaxed space-y-2 text-lg">
                        <li>• Empower student creators globally.</li>
                        <li>• Produce premium cinematic content.</li>
                        <li>• Innovate beyond standard broadcasting.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
