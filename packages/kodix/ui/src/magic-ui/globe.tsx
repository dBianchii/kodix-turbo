/** biome-ignore-all lint/suspicious/noExplicitAny: <file was copied from magic-ui> */

"use client";

import type { COBEOptions } from "cobe";
import { useCallback, useEffect, useRef } from "react";
import createGlobe from "cobe";
import { useSpring } from "react-spring";
import { cn } from "..";

const GLOBE_CONFIG: COBEOptions = {
  baseColor: [1, 1, 1],
  dark: 0,
  devicePixelRatio: 2,
  diffuse: 0.4,
  glowColor: [0.7, 0.5, 1],
  height: 800,
  mapBrightness: 1.2,
  mapSamples: 16_000,
  markerColor: [251 / 255, 100 / 255, 21 / 255],
  markers: [
    { location: [14.5995, 120.9842], size: 0.03 },
    { location: [19.076, 72.8777], size: 0.1 },
    { location: [23.8103, 90.4125], size: 0.05 },
    { location: [30.0444, 31.2357], size: 0.07 },
    { location: [39.9042, 116.4074], size: 0.08 },
    { location: [-23.5505, -46.6333], size: 0.1 },
    { location: [19.4326, -99.1332], size: 0.1 },
    { location: [40.7128, -74.006], size: 0.1 },
    { location: [34.6937, 135.5022], size: 0.05 },
    { location: [41.0082, 28.9784], size: 0.06 },
  ],
  // biome-ignore lint/suspicious/noEmptyBlockStatements: <biome migration>
  onRender: () => {},
  phi: 0,
  theta: 0.3,
  width: 800,
};

export default function Globe({
  className,
  config = GLOBE_CONFIG,
}: {
  className?: string;
  config?: COBEOptions;
}) {
  let phi = 0;
  let width = 0;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef(null);
  const pointerInteractionMovement = useRef(0);
  const [{ r }, api] = useSpring(() => ({
    config: {
      friction: 40,
      mass: 1,
      precision: 0.001,
      tension: 280,
    },
    r: 0,
  }));

  const updatePointerInteraction = (value: any) => {
    pointerInteracting.current = value;
    // biome-ignore lint/style/noNonNullAssertion: <biome migration>
    canvasRef.current!.style.cursor = value ? "grabbing" : "grab";
  };

  const updateMovement = (clientX: any) => {
    if (pointerInteracting.current !== null) {
      const delta = clientX - pointerInteracting.current;
      pointerInteractionMovement.current = delta;
      api.start({ r: delta / 200 });
    }
  };

  const onRender = useCallback(
    (state: Record<string, any>) => {
      if (!pointerInteracting.current) phi += 0.005;
      state.phi = phi + r.get();
      state.width = width * 2;
      state.height = width * 2;
    },
    [phi, r, width]
  );

  const onResize = () => {
    if (canvasRef.current) {
      width = canvasRef.current.offsetWidth;
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <biome migration>
  useEffect(() => {
    window.addEventListener("resize", onResize);
    onResize();

    // biome-ignore lint/style/noNonNullAssertion: <biome migration>
    const globe = createGlobe(canvasRef.current!, {
      ...config,
      height: width * 2,
      onRender,
      width: width * 2,
    });

    setTimeout(() => {
      // biome-ignore lint/style/noNonNullAssertion: <biome migration>
      canvasRef.current!.style.opacity = "1";
    });
    return () => globe.destroy();
  }, []);

  return (
    <div
      className={cn(
        "absolute inset-0 mx-auto aspect-1/1 w-full max-w-[600px]",
        className
      )}
    >
      <canvas
        className={cn(
          "h-full w-full opacity-0 transition-opacity duration-500 [contain:layout_paint_size]"
        )}
        onMouseMove={(e) => updateMovement(e.clientX)}
        onPointerDown={(e) =>
          updatePointerInteraction(
            e.clientX - pointerInteractionMovement.current
          )
        }
        onPointerOut={() => updatePointerInteraction(null)}
        onPointerUp={() => updatePointerInteraction(null)}
        onTouchMove={(e) =>
          e.touches[0] && updateMovement(e.touches[0].clientX)
        }
        ref={canvasRef}
      />
    </div>
  );
}
