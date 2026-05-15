"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useResponsiveCtx } from "@/hooks/useResponsiveCtx";

export default function CameraRig() {
    const { camera } = useThree();
    const { isMobile, isTablet } = useResponsiveCtx();

    const getPos = (m: number, t: number, d: number) => isMobile ? m : isTablet ? t : d;

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);

        // We have 5 logical frames in OverlayLayout.
        // Frame 1: Hero (z=10)
        // Frame 2: Photography (z=0)
        // Frame 3: Graphic Design (z=-10)
        // Frame 4: Comm & Info (z=-20)
        // Frame 5: Registration CTA (z=-30)

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: document.body,
                start: "top top",
                end: "bottom bottom",
                scrub: 1.5,
            },
        });

        camera.position.set(0, 0, 10);
        camera.rotation.set(0, 0, 0);

        // Hero -> Photography (Frame 1 to Frame 2) -> Text Left, Object Right
        tl.to(camera.position, {
            z: 0,
            x: getPos(0, -0.25, -0.5),
            ease: "power2.inOut"
        }, 0)
            .to(camera.rotation, {
                y: isMobile ? 0 : -0.1,
                ease: "power2.inOut"
            }, 0);

        // Photography -> Graphic Design (Frame 2 to Frame 3) -> Text Right, Object Left
        tl.to(camera.position, {
            z: -10,
            x: getPos(0, 0.25, 0.5),
            ease: "power2.inOut"
        })
            .to(camera.rotation, {
                y: isMobile ? 0 : 0.1,
                ease: "power2.inOut"
            }, "<"); // start at the same time as previous tween

        // Graphic Design -> Comm & Info (Frame 3 to Frame 4) -> Text Left, Object Right
        tl.to(camera.position, {
            z: -20,
            x: getPos(0, -0.25, -0.5),
            ease: "power2.inOut"
        })
            .to(camera.rotation, {
                y: isMobile ? 0 : -0.1,
                ease: "power2.inOut"
            }, "<");

        // Comm & Info -> Registration CTA (Frame 4 to Frame 5)
        tl.to(camera.position, {
            z: -30,
            x: 0,
            ease: "power4.inOut"
        })
            .to(camera.rotation, {
                y: 0,
                x: -0.2, // look down slightly
                ease: "power2.inOut"
            }, "<");

        return () => {
            tl.kill();
            ScrollTrigger.getAll().forEach(t => t.kill());
        };
    }, [camera, isMobile]);

    return null;
}
