import * as React from 'react'

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`bg-card text-card-foreground rounded-lg border shadow-sm ${className || ''}`}
      {...props}
    />
  )
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`p-6 ${className || ''}`} {...props} />
}
