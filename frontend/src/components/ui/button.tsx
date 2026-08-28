import * as React from "react"

type Variant = "primary" | "secondary" | "ghost"

export function Button({ variant="primary", className="", children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const base = variant === "primary" ? "btn-primary" : variant === "secondary" ? "btn-secondary" : "btn-ghost"
  return <button className={`${base} ${className}`} {...props}>{children}</button>
}
export default Button
