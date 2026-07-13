"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { triggerPageTransition } from "@/lib/utils/transitionHelper";

export default function AnimatedLink({ href, children, className, ...props }) {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();

  const handleClick = (e) => {
    e.preventDefault();

    if (prefersReducedMotion) {
      router.push(href);
      return;
    }

    triggerPageTransition(router, href);
  };

  return (
    <a href={href} onClick={handleClick} className={className} {...props}>
      {children}
    </a>
  );
}
