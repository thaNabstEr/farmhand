"use client"

import * as React from "react"
import { Camera, PenTool, Barcode, QrCode, MapPin, Map, Check, Trash2 } from "lucide-react"
import { RunnerFieldProps } from "../../../types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function PhotoRunner({ value, onChange, disabled, error }: RunnerFieldProps) {
  const strVal = typeof value === "string" ? value : ""

  const handleCapture = () => {
    if (strVal) {
      onChange("")
    } else {
      onChange("mock_photo_captured_" + Date.now() + ".jpg")
    }
  }

  return (
    <div
      className={cn(
        "p-4 rounded-card border bg-card text-center space-y-3 transition-colors",
        error ? "border-red-500/80" : "border-neutral-200 dark:border-neutral-800"
      )}
    >
      {strVal ? (
        <div className="flex flex-col items-center gap-2 py-2 animate-fade-in">
          <div className="size-16 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
            <Check className="size-8" />
          </div>
          <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
            Photo Attached ({strVal})
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCapture}
            disabled={disabled}
            className="text-xs gap-1.5 h-8 text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/20"
          >
            <Trash2 className="size-3.5" />
            Remove Photo
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-2">
          <Camera className="size-8 text-neutral-400" />
          <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
            No photo attached yet
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCapture}
            disabled={disabled}
            className="text-xs gap-1.5 h-9"
          >
            <Camera className="size-4" />
            Capture Photo
          </Button>
        </div>
      )}
    </div>
  )
}

export function SignatureRunner({ value, onChange, disabled, error }: RunnerFieldProps) {
  const strVal = typeof value === "string" ? value : ""
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)
  const [isDrawing, setIsDrawing] = React.useState(false)
  const [hasDrawn, setHasDrawn] = React.useState(false)
  const [isPadOpen, setIsPadOpen] = React.useState(false)

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (disabled) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY

    ctx.beginPath()
    ctx.moveTo(clientX - rect.left, clientY - rect.top)
    setIsDrawing(true)
    setHasDrawn(true)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || disabled) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY

    ctx.lineTo(clientX - rect.left, clientY - rect.top)
    ctx.strokeStyle = "#059669"
    ctx.lineWidth = 2.5
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.stroke()
  }

  const stopDrawing = () => {
    if (!isDrawing) return
    setIsDrawing(false)
    const canvas = canvasRef.current
    if (canvas) {
      const dataUrl = canvas.toDataURL("image/png")
      onChange(dataUrl)
    }
  }

  const handleClear = () => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }
    setHasDrawn(false)
    onChange("")
  }

  return (
    <div
      className={cn(
        "p-4 rounded-card border bg-card text-center space-y-3 transition-colors relative min-h-[140px] flex flex-col items-center justify-center",
        error ? "border-red-500/80" : "border-neutral-200 dark:border-neutral-800"
      )}
    >
      {strVal ? (
        <div className="flex flex-col items-center gap-2 animate-fade-in w-full">
          <div className="p-2 rounded-lg border border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20 max-w-xs w-full flex justify-center items-center">
            {strVal.startsWith("data:image") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={strVal} alt="Authorized Signature" className="h-16 max-w-full object-contain" />
            ) : (
              <div className="font-serif italic text-lg text-primary tracking-widest px-4 py-1 select-none">
                Authorized Signature
              </div>
            )}
          </div>
          <span className="text-[10px] text-neutral-400 font-mono">Signature recorded</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            disabled={disabled}
            className="text-xs text-neutral-500 hover:text-red-500 h-7"
          >
            Clear / Re-sign
          </Button>
        </div>
      ) : isPadOpen ? (
        <div className="flex flex-col items-center gap-2 w-full">
          <div className="w-full flex items-center justify-between px-1 text-xs text-neutral-500 font-medium">
            <span>Sign with finger or stylus</span>
            {hasDrawn && (
              <button
                type="button"
                onClick={handleClear}
                className="text-[11px] text-red-500 hover:underline font-semibold"
              >
                Clear
              </button>
            )}
          </div>
          <div className="w-full border-2 border-dashed border-emerald-500/30 rounded-lg overflow-hidden bg-neutral-50 dark:bg-neutral-900 touch-none">
            <canvas
              ref={canvasRef}
              width={360}
              height={140}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-[120px] cursor-crosshair block"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsPadOpen(false)}
              className="text-xs h-8"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <PenTool className="size-6 text-neutral-400" />
          <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
            Tap to add operator signature
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsPadOpen(true)}
            disabled={disabled}
            className="text-xs gap-1.5 h-8"
          >
            <PenTool className="size-3.5 text-primary" />
            <span>Sign Here</span>
          </Button>
        </div>
      )}
    </div>
  )
}

export function BarcodeRunner({ value, onChange, disabled, error }: RunnerFieldProps) {
  const strVal = typeof value === "string" ? value : ""

  const handleScan = () => {
    onChange(strVal ? "" : "BAR-9842-AGRI")
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={strVal}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Scan or enter barcode..."
        disabled={disabled}
        className={cn(
          "flex-1 h-10 px-3.5 rounded-input border bg-card text-sm font-mono text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 outline-none focus:ring-2 focus:ring-primary/25 transition-all duration-150",
          error ? "border-red-500/80" : "border-neutral-250 dark:border-neutral-800"
        )}
      />
      <Button
        type="button"
        variant="outline"
        onClick={handleScan}
        disabled={disabled}
        className="h-10 gap-1.5 px-3 shrink-0"
      >
        <Barcode className="size-4" />
        <span className="hidden sm:inline">Scan</span>
      </Button>
    </div>
  )
}

export function QRCodeRunner({ value, onChange, disabled, error }: RunnerFieldProps) {
  const strVal = typeof value === "string" ? value : ""

  const handleScan = () => {
    onChange(strVal ? "" : "QR-FARM-PLOT-402")
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={strVal}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Scan or enter QR data..."
        disabled={disabled}
        className={cn(
          "flex-1 h-10 px-3.5 rounded-input border bg-card text-sm font-mono text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 outline-none focus:ring-2 focus:ring-primary/25 transition-all duration-150",
          error ? "border-red-500/80" : "border-neutral-250 dark:border-neutral-800"
        )}
      />
      <Button
        type="button"
        variant="outline"
        onClick={handleScan}
        disabled={disabled}
        className="h-10 gap-1.5 px-3 shrink-0"
      >
        <QrCode className="size-4" />
        <span className="hidden sm:inline">Scan</span>
      </Button>
    </div>
  )
}

export function GPSRunner({ value, onChange, disabled, error }: RunnerFieldProps) {
  const strVal = typeof value === "string" ? value : ""

  const handleAcquire = () => {
    if (strVal) {
      onChange("")
    } else {
      onChange("-1.286389, 36.817223 (± 3m)")
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={strVal}
        readOnly
        placeholder="GPS coordinates not acquired..."
        className={cn(
          "flex-1 h-10 px-3.5 rounded-input border bg-neutral-50 dark:bg-neutral-900 text-xs font-mono text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 outline-none select-all",
          error ? "border-red-500/80" : "border-neutral-250 dark:border-neutral-800"
        )}
      />
      <Button
        type="button"
        variant="outline"
        onClick={handleAcquire}
        disabled={disabled}
        className="h-10 gap-1.5 px-3 shrink-0"
      >
        <MapPin className="size-4 text-primary" />
        <span>{strVal ? "Reset" : "Acquire GPS"}</span>
      </Button>
    </div>
  )
}

export function MapRunner({ value, onChange, disabled, error }: RunnerFieldProps) {
  const strVal = typeof value === "string" ? value : ""

  const handlePlot = () => {
    if (strVal) {
      onChange("")
    } else {
      onChange("Polygon (4 vertices - 12.4 ha)")
    }
  }

  return (
    <div
      className={cn(
        "p-4 rounded-card border bg-card text-center space-y-3 transition-colors",
        error ? "border-red-500/80" : "border-neutral-200 dark:border-neutral-800"
      )}
    >
      <div className="flex flex-col items-center gap-2 py-1">
        <Map className="size-7 text-primary" />
        <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
          {strVal ? strVal : "No plot boundary mapped"}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handlePlot}
          disabled={disabled}
          className="text-xs gap-1.5 h-8"
        >
          <MapPin className="size-3.5" />
          <span>{strVal ? "Clear Plot" : "Set Boundary"}</span>
        </Button>
      </div>
    </div>
  )
}
