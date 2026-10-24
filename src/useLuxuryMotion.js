import { useEffect } from "react";

export function useLuxuryMotion(dependency) {
  useEffect(() => {
    const items = document.querySelectorAll("[data-reveal]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
    );

    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [dependency]);

  useEffect(() => {
    const site = document.querySelector(".luxury-site");
    const parallaxItems = document.querySelectorAll("[data-depth]");
    if (!site) return undefined;

    let frame = 0;
    const handleMove = (event) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const x = event.clientX / window.innerWidth - 0.5;
        const y = event.clientY / window.innerHeight - 0.5;
        site.style.setProperty("--spot-x", `${event.clientX}px`);
        site.style.setProperty("--spot-y", `${event.clientY}px`);

        parallaxItems.forEach((item) => {
          const depth = Number(item.dataset.depth || 18);
          item.style.transform = `translate3d(${x * depth}px, ${y * depth}px, 0)`;
        });
      });
    };

    window.addEventListener("pointermove", handleMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", handleMove);
      parallaxItems.forEach((item) => {
        item.style.transform = "";
      });
    };
  }, [dependency]);
}
