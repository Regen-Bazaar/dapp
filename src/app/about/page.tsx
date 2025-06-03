import React from 'react'
import { Leaf, Heart, Globe2, Users } from 'lucide-react'

const About = () => {
  const teamMembers = [
    {
      name: 'Sarah Chen',
      role: 'Founder & CEO',
      description:
        'Environmental scientist with 10+ years experience in conservation',
      icon: <Leaf className='mb-4 h-8 w-8 text-[#B4F481]' />,
    },
    {
      name: 'David Kumar',
      role: 'Head of Technology',
      description:
        'Blockchain expert specializing in environmental impact tracking',
      icon: <Globe2 className='mb-4 h-8 w-8 text-[#B4F481]' />,
    },
    {
      name: 'Maria Rodriguez',
      role: 'Community Lead',
      description: 'NGO partnerships and community engagement specialist',
      icon: <Users className='mb-4 h-8 w-8 text-[#B4F481]' />,
    },
    {
      name: 'Alex Thompson',
      role: 'Impact Analyst',
      description: 'Environmental impact assessment and verification expert',
      icon: <Heart className='mb-4 h-8 w-8 text-[#B4F481]' />,
    },
  ]

  return (
    <div className='min-h-screen bg-black'>
      <div className='mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8'>
        <div className='mb-16 text-center'>
          <h1 className='mb-8 text-6xl font-bold text-[#B4F481]'>ABOUT US</h1>
          <p className='mx-auto max-w-3xl text-xl text-gray-300'>
            Regen Bazaar is revolutionizing environmental and social impact
            through blockchain technology. We empower organizations to tokenize
            their real-world impact, creating a transparent and efficient
            marketplace for environmental change.
          </p>
        </div>

        <div className='mb-16 grid grid-cols-1 gap-12 md:grid-cols-2'>
          <div className='rounded-lg border border-gray-800 bg-gray-900/50 p-8'>
            <h2 className='mb-4 text-2xl font-bold text-[#B4F481]'>
              Our Mission
            </h2>
            <p className='text-gray-300'>
              To accelerate environmental and social impact by connecting impact
              creators with supporters through innovative blockchain solutions.
              We believe in transparency, efficiency, and measurable impact in
              the fight against climate change.
            </p>
          </div>
          <div className='rounded-lg border border-gray-800 bg-gray-900/50 p-8'>
            <h2 className='mb-4 text-2xl font-bold text-[#B4F481]'>
              Our Vision
            </h2>
            <p className='text-gray-300'>
              A world where every environmental and social impact initiative can
              be easily funded, tracked, and verified. We're building the
              infrastructure for the next generation of environmental
              conservation and social impact projects.
            </p>
          </div>
        </div>

        <div className='mb-16'>
          <h2 className='mb-8 text-center text-3xl font-bold text-white'>
            Our Team
          </h2>
          <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4'>
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className='rounded-lg border border-gray-800 bg-gray-900/50 p-6 text-center'
              >
                {member.icon}
                <h3 className='mb-2 text-xl font-semibold text-white'>
                  {member.name}
                </h3>
                <p className='mb-3 text-[#B4F481]'>{member.role}</p>
                <p className='text-sm text-gray-400'>{member.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className='text-center'>
          <h2 className='mb-8 text-3xl font-bold text-white'>
            Join Our Mission
          </h2>
          <p className='mx-auto mb-8 max-w-3xl text-xl text-gray-300'>
            Whether you're an organization making an impact or an individual
            looking to support environmental initiatives, there's a place for
            you in our ecosystem.
          </p>
          <button className='rounded-full bg-[#B4F481] px-8 py-4 text-lg font-semibold text-black transition-colors hover:bg-[#9FE070]'>
            Get Started Today
          </button>
        </div>
      </div>
    </div>
  )
}

export default About
