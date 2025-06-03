// import { openai } from './openai'
import { FEATURES } from './config'

export async function generateProfileImage(
  description: string
): Promise<string> {
  if (!FEATURES.IMAGE_GENERATION) {
    // Return a placeholder image URL when image generation is disabled
    return 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1024&q=80'
  }

  try {
    //   const response = await openai.images.generate({
    //    model: 'dall-e-3',
    //   prompt: `Create a professional, artistic profile image for a non-profit organization focused on: ${description}. Style: Modern, minimalist, corporate-friendly.`,
    //  n: 1,
    // size: '1024x1024',
    //quality: 'standard',
    //})

    //return response.data[0].url || ''
    // @todo move to backend
    throw new Error(
      'please use backend to secure env var and optimise generation'
    )
  } catch (error) {
    console.error('Error generating image:', error)
    throw new Error('Failed to generate image')
  }
}
