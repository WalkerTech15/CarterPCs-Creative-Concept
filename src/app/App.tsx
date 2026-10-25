import { useEffect, useState } from 'react'
import Nav from '../components/navigation/Nav'
import Intro from '../sections/intro/Intro'
import Hero from '../sections/hero/Hero'
import Creator from '../sections/creator/Creator'
import Featured from '../sections/featured/Featured'
import Hardware from '../sections/hardware/Hardware'
import ContentUniverse from '../sections/content-universe/ContentUniverse'
import Closing from '../sections/closing/Closing'
import Footer from '../components/footer/Footer'
import { ScrollTrigger } from '../animations/gsap'
import { useLenis } from '../hooks/useLenis'
import { PreferencesProvider, usePreferences } from './Preferences'

/**
 * Everything below the provider, so it can read the active dictionary.
 * `App` itself renders the provider and therefore cannot call
 * `usePreferences()` at its own level.
 */
function Site() {
  const { t, language } = usePreferences()
  const [introComplete, setIntroComplete] = useState(false)

  // Translated copy changes how tall the sections are (French and Spanish
  // paragraphs set to more lines than the English ones), which moves every
  // pinned ScrollTrigger's start/end. Refreshing re-measures in place instead
  // of tearing the timelines down and rebuilding them, so a language switch
  // never restarts the choreography or jumps the scroll position.
  useEffect(() => {
    ScrollTrigger.refresh()
  }, [language])

  return (
    <>
      <a className="skip-link" href="#main-content">
        {t.a11y.skipToContent}
      </a>

      <Nav />

      <main id="main-content">
        <Hero ready={introComplete} />
        <Creator />
        <Featured />
        <Hardware />
        <ContentUniverse />
        <Closing />
      </main>

      {/* Outside <main>: contentinfo is its own landmark, not part of the
          document's main content. */}
      <Footer />

      {!introComplete && <Intro onComplete={() => setIntroComplete(true)} />}
    </>
  )
}

function App() {
  useLenis()

  return (
    <PreferencesProvider>
      <Site />
    </PreferencesProvider>
  )
}

export default App
