import * as React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'ghost'
}

export function Button({
  className,
  size = 'md',
  variant = 'default',
  ...props
}: ButtonProps) {
  const sizeClasses = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4',
    lg: 'h-12 px-6 text-lg',
  }

  const variantClasses = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
  }

  return (
    <button
      className={`focus-visible:ring-ring ring-offset-background inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 ${sizeClasses[size]} ${variantClasses[variant]} ${className || ''}`}
      {...props}
    />
  )
}
