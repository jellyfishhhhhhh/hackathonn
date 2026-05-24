import { useEffect, useRef, useState } from "react";
import studentsArt from "@/assets/students-silhouette.png";

const IMG_ASPECT = 1920 / 1080;
const FALLBACK_COPIES = 6;

export function StudentsMarquee() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [copies, setCopies] = useState(FALLBACK_COPIES);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const recalc = () => {
      const rect = el.getBoundingClientRect();
      const tileWidth = rect.height * IMG_ASPECT;
      if (!tileWidth || !rect.width) return;
      const next = Math.max(4, Math.ceil(rect.width / tileWidth) + 2);
      setCopies((prev) => (prev === next ? prev : next));
    };

    recalc();
    const ro = new ResizeObserver(recalc);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const tiles = Array.from({ length: copies });

  return (
    <section
      ref={sectionRef}
      className="students-marquee-section"
      aria-hidden="true"
    >
      <div className="students-marquee">
        <div className="students-marquee-track">
          <div className="students-marquee-group">
            {tiles.map((_, i) => (
              <img
                key={`a-${i}`}
                src={studentsArt}
                alt=""
                aria-hidden="true"
                loading="eager"
                decoding="async"
                width={1920}
                height={1080}
                draggable={false}
              />
            ))}
          </div>
          <div className="students-marquee-group">
            {tiles.map((_, i) => (
              <img
                key={`b-${i}`}
                src={studentsArt}
                alt=""
                aria-hidden="true"
                loading="eager"
                decoding="async"
                width={1920}
                height={1080}
                draggable={false}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
