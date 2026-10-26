import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from '../animations/gsap'
import { useReducedMotion } from './useReducedMotion'

/**
 * Wires Lenis smooth scrolling into GSAP's ticker and keeps ScrollTrigger's
 * measurements in sync, per TECH_STACK.md §2/§7.
 *
 * Intentionally does not run when `prefers-reduced-motion: reduce` is set —
 * reduced-motion users get native, unmodified scroll behavior instead.
 */
export function useLenis(): void {
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion) {
      return
    }

    // A slightly firmer lerp reaches the requested scroll position sooner
    // without removing the smooth, native-scroll feel. Touch scrolling stays
    // native because syncTouch remains disabled.
    const lenis = new Lenis({ lerp: 0.15 })
    lenis.on('scroll', ScrollTrigger.update)

    // GSAP's ticker (not a raw rAF loop) keeps Lenis in step with every other
    // GSAP-driven animation and disables its own lag smoothing so scroll
    // stays 1:1 with input during long frames.
    const update = (time: number) => {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(update)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(update)
      lenis.destroy()
    }
  }, [reducedMotion])
}
