'use client'

import { useEffect, useState } from 'react'

type Props = {
  phrases: string[]
  typingSpeed?: number
  deletingSpeed?: number
  pauseMs?: number
}

export default function TypingText({
  phrases,
  typingSpeed = 80,
  deletingSpeed = 40,
  pauseMs = 1800,
}: Props) {
  const [displayed, setDisplayed] = useState('')
  const [phraseIdx, setPhraseIdx] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const target = phrases[phraseIdx]
    let timeout: ReturnType<typeof setTimeout>

    if (!isDeleting && displayed === target) {
      timeout = setTimeout(() => setIsDeleting(true), pauseMs)
    } else if (isDeleting && displayed === '') {
      setIsDeleting(false)
      setPhraseIdx((i) => (i + 1) % phrases.length)
    } else {
      timeout = setTimeout(() => {
        setDisplayed(isDeleting ? target.slice(0, displayed.length - 1) : target.slice(0, displayed.length + 1))
      }, isDeleting ? deletingSpeed : typingSpeed)
    }
    return () => clearTimeout(timeout)
  }, [displayed, isDeleting, phraseIdx, phrases, typingSpeed, deletingSpeed, pauseMs])

  return (
    <span>
      {displayed}
      <span className="ml-0.5 inline-block w-0.5 h-[1em] bg-current align-middle animate-[blink_1s_step-end_infinite]" aria-hidden />
    </span>
  )
}
