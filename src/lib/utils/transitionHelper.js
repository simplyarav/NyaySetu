import gsap from "gsap";

export function triggerPageTransition(router, href) {
  if (typeof window === 'undefined') return;
  
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  
  if (prefersReducedMotion) {
    if (href) router.push(href);
    return;
  }

  const overlay = document.getElementById("page-transition-overlay");
  if (!overlay) {
    if (href) router.push(href);
    return;
  }

  const tl = gsap.timeline({
    onComplete: () => {
      if (href) router.push(href);
    }
  });

  tl.fromTo(overlay, 
    { yPercent: -100 },
    {
      yPercent: 0,
      duration: 0.6,
      ease: "power3.inOut"
    }
  ).to("#page-transition-icon", {
    opacity: 0.15,
    duration: 0.2
  }, "-=0.2");
}
