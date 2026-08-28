import * as React from "react"

export function Card({ className="", children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`card ${className}`} {...props}>{children}</div>
}
export function CardHeader({ className="", children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`mb-2 ${className}`} {...props}>{children}</div>
}
export default Card
