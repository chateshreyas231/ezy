"use client";

import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import {
  AnimatePresence,
  motion,
  useAnimation,
  useMotionValue,
  useTransform,
} from "framer-motion";

export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

type UseMediaQueryOptions = {
  defaultValue?: boolean;
  initializeWithValue?: boolean;
};

const IS_SERVER = typeof window === "undefined";

export function useMediaQuery(
  query: string,
  {
    defaultValue = false,
    initializeWithValue = true,
  }: UseMediaQueryOptions = {}
): boolean {
  const getMatches = (value: string): boolean => {
    if (IS_SERVER) return defaultValue;
    return window.matchMedia(value).matches;
  };

  const [matches, setMatches] = useState<boolean>(() => {
    if (initializeWithValue) return getMatches(query);
    return defaultValue;
  });

  const handleChange = () => setMatches(getMatches(query));

  useIsomorphicLayoutEffect(() => {
    const matchMedia = window.matchMedia(query);
    handleChange();
    matchMedia.addEventListener("change", handleChange);
    return () => matchMedia.removeEventListener("change", handleChange);
  }, [query]);

  return matches;
}

const propertyPhotos = [
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600566752355-35792bedcfea?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600047509358-9dc75507daeb?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600607687644-c7171b42498f?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600607687126-8a3414349a51?q=80&w=600&auto=format&fit=crop",
];

const easeCurve: [number, number, number, number] = [0.32, 0.72, 0, 1];
const transitionOverlay = { duration: 0.5, ease: easeCurve };

const Carousel = memo(function Carousel({
  handleClick,
  controls,
  cards,
  isCarouselActive,
}: {
  handleClick: (imgUrl: string, index: number) => void;
  controls: ReturnType<typeof useAnimation>;
  cards: string[];
  isCarouselActive: boolean;
}) {
  const isScreenSizeSm = useMediaQuery("(max-width: 640px)");
  const cylinderWidth = isScreenSizeSm ? 1100 : 1800;
  const faceCount = cards.length;
  const faceWidth = cylinderWidth / faceCount;
  const radius = cylinderWidth / (2 * Math.PI);
  const rotation = useMotionValue(0);
  const transform = useTransform(rotation, (value) => `rotate3d(0, 1, 0, ${value}deg)`);

  const startAutoRotate = useCallback(() => {
    controls.start({
      rotateY: [rotation.get(), rotation.get() + 360],
      transition: {
        duration: 38,
        ease: "linear",
        repeat: Infinity,
      },
    });
  }, [controls, rotation]);

  useEffect(() => {
    if (!isCarouselActive) {
      controls.stop();
      return;
    }
    startAutoRotate();
  }, [controls, isCarouselActive, startAutoRotate]);

  return (
    <div
      className="flex h-full items-center justify-center bg-background"
      style={{ perspective: "1000px", transformStyle: "preserve-3d", willChange: "transform" }}
    >
      <motion.div
        drag={isCarouselActive ? "x" : false}
        className="relative flex h-full origin-center cursor-grab justify-center active:cursor-grabbing"
        style={{ transform, rotateY: rotation, width: cylinderWidth, transformStyle: "preserve-3d" }}
        onDragStart={() => controls.stop()}
        onDrag={(_, info) => isCarouselActive && rotation.set(rotation.get() + info.offset.x * 0.05)}
        onDragEnd={(_, info) =>
          isCarouselActive &&
          controls.start({
            rotateY: rotation.get() + info.velocity.x * 0.05,
            transition: { type: "spring", stiffness: 100, damping: 30, mass: 0.1 },
          }).then(() => startAutoRotate())
        }
        animate={controls}
      >
        {cards.map((imgUrl, i) => (
          <motion.div
            key={`${imgUrl}-${i}`}
            className="absolute flex h-full origin-center items-center justify-center rounded-xl bg-background p-2"
            style={{
              width: `${faceWidth}px`,
              transform: `rotateY(${i * (360 / faceCount)}deg) translateZ(${radius}px)`,
            }}
            onClick={() => handleClick(imgUrl, i)}
          >
            <motion.img
              src={imgUrl}
              alt={`Property preview ${i + 1}`}
              layoutId={`img-${imgUrl}`}
              className="pointer-events-none aspect-square w-full rounded-xl object-cover"
              initial={{ filter: "blur(4px)" }}
              layout="position"
              animate={{ filter: "blur(0px)" }}
              transition={{ duration: 0.5, ease: easeCurve }}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
});

function ThreeDPhotoCarousel() {
  const [activeImg, setActiveImg] = useState<string | null>(null);
  const [isCarouselActive, setIsCarouselActive] = useState(true);
  const controls = useAnimation();
  const cards = useMemo(() => propertyPhotos, []);

  const handleClick = (imgUrl: string) => {
    setActiveImg(imgUrl);
    setIsCarouselActive(false);
    controls.stop();
  };

  const handleClose = () => {
    setActiveImg(null);
    setIsCarouselActive(true);
  };

  return (
    <motion.div layout className="relative">
      <AnimatePresence mode="sync">
        {activeImg && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            layoutId={`img-container-${activeImg}`}
            layout="position"
            onClick={handleClose}
            className="fixed inset-0 z-50 m-5 flex items-center justify-center rounded-3xl bg-black/30 md:m-24 lg:mx-[19rem]"
            transition={transitionOverlay}
          >
            <motion.img
              layoutId={`img-${activeImg}`}
              src={activeImg}
              alt="Expanded property"
              className="max-h-full max-w-full rounded-lg shadow-lg"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.15, duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
              style={{ willChange: "transform" }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="relative h-[500px] w-full overflow-hidden rounded-2xl border border-white/10 bg-black/10">
        <Carousel
          handleClick={handleClick}
          controls={controls}
          cards={cards}
          isCarouselActive={isCarouselActive}
        />
      </div>
    </motion.div>
  );
}

export { ThreeDPhotoCarousel };
