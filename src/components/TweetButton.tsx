'use client'
// use your button or a <button>
import Link from 'next/link'
interface TweetButtonProps {
  text: string
}

export default function TweetButton({ text }: TweetButtonProps) {
  const encodedText = encodeURIComponent(text)
  const tweetUrl = `https://x.com/intent/tweet?text=${encodedText}`

  return (
    <Link href={tweetUrl} target='_blank' rel='noopener noreferrer'>
      <button className='rounded-md border border-slate-800 px-4 py-2 text-white shadow-lg transition-all'>
        Share on X
      </button>
    </Link>
  )
}
