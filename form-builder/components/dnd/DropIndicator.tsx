"use client"

import * as React from "react"

export function DropIndicator() {
  return (
    <div 
      className="h-0.5 w-full bg-primary rounded-full relative my-1 transition-all duration-150 animate-fade-in z-20"
      data-slot="drop-indicator"
    >
      <div className="absolute -left-1 -top-1 size-2 rounded-full bg-primary" />
      <div className="absolute -right-1 -top-1 size-2 rounded-full bg-primary" />
    </div>
  )
}

export default DropIndicator;
