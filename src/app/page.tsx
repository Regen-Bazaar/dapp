import React from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  FileText,
  Twitter,
  Github,
  MessageCircle,
  Send,
  Mail,
  Leaf,
} from 'lucide-react'

export default function Home() {
  return (
    <div className='min-h-screen bg-gradient-to-b from-gray-900 to-black'>
      {/* Hero Section */}
      <div className='mx-auto max-w-7xl px-4 pt-24 pb-16 sm:px-6 lg:px-8'>
        <div className='mb-16 text-center'>
          <div className='mb-6 flex items-center justify-center'>
            <div className='relative'>
              <Leaf className='h-16 w-16 text-[#B4F481]' />
              <div className='absolute -bottom-8 left-1/2 -translate-x-1/2 transform whitespace-nowrap'>
                <span className='bg-gradient-to-r from-[#B4F481] to-green-300 bg-clip-text text-2xl font-bold text-transparent'>
                  Regen Bazaar
                </span>
              </div>
            </div>
          </div>
          <div className='mt-12'>
            <h1 className='mb-8 bg-gradient-to-r from-[#B4F481] to-green-300 bg-clip-text text-7xl font-bold text-transparent'>
              TOKENIZE REAL-WORLD IMPACT
            </h1>
            <h2 className='mb-12 text-3xl font-light text-gray-400 italic'>
              EMPOWERING NGOS AND COMMUNITIES
            </h2>
            <p className='mx-auto mb-12 max-w-3xl text-xl text-gray-300'>
              Convert environmental and social impact into tradeable digital
              assets. Stake for rewards and participate in ecosystem governance.
            </p>
            <div className='flex justify-center gap-6'>
              <Link
                href='/create-nonprofit-profile'
                className='rounded-full bg-[#B4F481] px-8 py-4 text-lg font-semibold text-black transition-colors hover:bg-[#9FE070]'
              >
                APPLY TO TOKENIZE
              </Link>
              <a
                href='https://github.com/Regen-Bazaar/Litepaper'
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center rounded-full bg-gray-800 px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-gray-700'
              >
                <FileText className='mr-2' />
                LITEPAPER
              </a>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className='mb-16 grid gap-8 md:grid-cols-3'>
          <div className='rounded-2xl border border-gray-700 bg-gray-800/50 p-8 backdrop-blur-sm'>
            <h3 className='mb-4 text-2xl font-bold text-[#B4F481]'>
              Tokenize Impact
            </h3>
            <p className='text-gray-300'>
              Transform your environmental and social initiatives into
              verifiable digital assets backed by real-world impact data.
            </p>
          </div>
          <div className='rounded-2xl border border-gray-700 bg-gray-800/50 p-8 backdrop-blur-sm'>
            <h3 className='mb-4 text-2xl font-bold text-[#B4F481]'>
              Earn Rewards
            </h3>
            <p className='text-gray-300'>
              Stake your impact tokens to earn $REBAZ rewards and gain voting
              power in ecosystem governance.
            </p>
          </div>
          <div className='rounded-2xl border border-gray-700 bg-gray-800/50 p-8 backdrop-blur-sm'>
            <h3 className='mb-4 text-2xl font-bold text-[#B4F481]'>
              Drive Change
            </h3>
            <p className='text-gray-300'>
              Join a community of impact creators and supporters building the
              future of regenerative finance.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className='mb-24 text-center'>
          <Link
            href='/projects'
            className='inline-flex items-center text-xl text-[#B4F481] hover:text-[#9FE070]'
          >
            Explore Impact Projects <ArrowRight className='ml-2' />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className='border-t border-gray-800 bg-black/50 backdrop-blur-sm'>
        <div className='mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8'>
          <div className='flex flex-col items-center justify-between md:flex-row'>
            <div className='mb-8 text-2xl font-bold text-[#B4F481] md:mb-0'>
              Regen Bazaar
            </div>
            <div className='flex space-x-6'>
              <a
                href='https://x.com/RegenBazaar'
                target='_blank'
                rel='noopener noreferrer'
                className='text-gray-400 hover:text-[#B4F481]'
                title='Twitter/X'
              >
                <Twitter className='h-6 w-6' />
              </a>
              <a
                href='https://github.com/orgs/EcoSynthesisX'
                target='_blank'
                rel='noopener noreferrer'
                className='text-gray-400 hover:text-[#B4F481]'
                title='GitHub'
              >
                <Github className='h-6 w-6' />
              </a>
              <a
                href='https://discord.gg/9WD9e7q2eD'
                target='_blank'
                rel='noopener noreferrer'
                className='text-gray-400 hover:text-[#B4F481]'
                title='Discord'
              >
                <MessageCircle className='h-6 w-6' />
              </a>
              <a
                href='https://t.me/EcoSynthesisX'
                target='_blank'
                rel='noopener noreferrer'
                className='text-gray-400 hover:text-[#B4F481]'
                title='Telegram'
              >
                <Send className='h-6 w-6' />
              </a>
              <a
                href='mailto:Ecosynthesisx@skiff.com'
                className='text-gray-400 hover:text-[#B4F481]'
                title='Email'
              >
                <Mail className='h-6 w-6' />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
