import Image from 'next/image'

interface UserAvatarProps {
  avatarUrl?: string | null
  alt?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-[40px] w-[40px]',
  lg: 'h-[120px] w-[120px]',
}

export function UserAvatar({
  avatarUrl,
  alt = 'User Avatar',
  size = 'md',
  className = '',
}: UserAvatarProps) {
  const baseClasses = `${sizeClasses[size]} overflow-hidden rounded-xl ${className}`

  if (avatarUrl) {
    return (
      <div className={baseClasses}>
        <Image
          src={avatarUrl}
          alt={alt}
          width={size === 'lg' ? 120 : size === 'md' ? 40 : 32}
          height={size === 'lg' ? 120 : size === 'md' ? 40 : 32}
          className='h-full w-full rounded-[10px] border border-[#101828] object-cover'
        />
      </div>
    )
  }

  return (
    <div className={`${baseClasses} flex items-center justify-center`}>
      <Image
        src='/avatar.png'
        alt={alt}
        width={size === 'lg' ? 120 : size === 'md' ? 40 : 32}
        height={size === 'lg' ? 120 : size === 'md' ? 40 : 32}
        className='h-full w-full object-cover'
      />
    </div>
  )
}
