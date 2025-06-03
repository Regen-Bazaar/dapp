interface ShareConfig {
  title: string
  description: string
  organizationName: string
  profileUrl: string
}

export function getSocialShareUrls(config: ShareConfig) {
  const encodedUrl = encodeURIComponent(config.profileUrl)
  const encodedTitle = encodeURIComponent(config.title)
  const encodedDescription = encodeURIComponent(config.description)

  return {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
  }
}
