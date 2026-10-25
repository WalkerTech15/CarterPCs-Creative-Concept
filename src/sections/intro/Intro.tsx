import { useLayoutEffect, useRef } from 'react'
import { gsap } from '../../animations/gsap'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import styles from './Intro.module.css'

interface IntroProps {
  /** Called once, exactly when the intro is done occupying the screen. */
  onComplete: () => void
}

/**
 * Brief cinematic threshold moment, per ARCHITECTURE.md's Intro/Loader spec:
 * "full-viewport, type-driven... minimal duration, no interactive controls."
 *
 * There's no real asset loading to gate on at this phase, so this doesn't
 * pretend to be a progress/loading bar — it's a short, fixed branding beat
 * (~1.0s) that never risks trapping the visitor. It renders on top of Hero
 * (already mounted underneath) rather than blocking Hero from mounting, so
 * screen-reader and reduced-motion users reach real content immediately.
 */
function Intro({ onComplete }: IntroProps) {
  const reducedMotion = useReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)
  const wordRef = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    if (reducedMotion) {
      onComplete()
      return
    }

    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: 'power3.out' }, onComplete })
        .fromTo(
          wordRef.current,
          { clipPath: 'inset(0 100% 0 0)', y: 12 },
          { clipPath: 'inset(0 0% 0 0)', y: 0, duration: 0.55 },
        )
        .to({}, { duration: 0.12 }) // brief hold so the mark registers
        .to(rootRef.current, {
          autoAlpha: 0,
          duration: 0.3,
          ease: 'power2.inOut',
        })
    }, rootRef)

    return () => ctx.revert()
    // onComplete is a stable callback from App; only reducedMotion should re-run this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion])

  if (reducedMotion) {
    return null
  }

  return (
    <div className={styles.intro} ref={rootRef} aria-hidden="true">
      <span className={styles.word} ref={wordRef}>
        CarterPCs
      </span>
    </div>
  )
}

export default Intro
