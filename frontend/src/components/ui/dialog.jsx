import * as React from "react"
import { cn } from "../../lib/utils"

const Dialog = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div
      className={cn("relative", className)}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  )
})
Dialog.displayName = "Dialog"

const DialogTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div
      className={cn("inline-block", className)}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  )
})
DialogTrigger.displayName = "DialogTrigger"

const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50",
        className
      )}
      ref={ref}
      {...props}
    >
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {children}
      </div>
    </div>
  )
})
DialogContent.displayName = "DialogContent"

const DialogHeader = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div
      className={cn("px-6 py-4 border-b border-gray-200", className)}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  )
})
DialogHeader.displayName = "DialogHeader"

const DialogTitle = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <h2
      className={cn("text-lg font-semibold text-[#4a4a6a]", className)}
      ref={ref}
      {...props}
    >
      {children}
    </h2>
  )
})
DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <p
      className={cn("text-sm text-[#4a4a6a] mt-1", className)}
      ref={ref}
      {...props}
    >
      {children}
    </p>
  )
})
DialogDescription.displayName = "DialogDescription"

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription }
