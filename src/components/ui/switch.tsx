"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SwitchProps {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
  id?: string
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, checked, onCheckedChange, disabled, id, ...props }, ref) => {
    const [internalChecked, setInternalChecked] = React.useState(false)
    const isChecked = checked !== undefined ? checked : internalChecked

    const handleClick = () => {
      if (disabled) return
      const newValue = !isChecked
      if (checked === undefined) {
        setInternalChecked(newValue)
      }
      onCheckedChange?.(newValue)
    }

    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        id={id}
        aria-checked={isChecked}
        disabled={disabled}
        onClick={handleClick}
        className={cn(
          "inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
          isChecked ? "bg-accent" : "bg-input",
          className
        )}
        {...props}
      >
        <span
          className={cn(
            "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform",
            isChecked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
    )
  }
)
Switch.displayName = "Switch"

export { Switch }
