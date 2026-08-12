"use client"

import * as React from "react"
import { MapPin, RefreshCw, CheckCircle2, AlertCircle, Camera, Trash2, Plus, Loader2 } from "lucide-react"
import { RunnerFieldProps, LocationResponse, PhotoItem } from "@/form-builder/types"
import { Button } from "@/components/ui/button"
import { mediaStorageRepository } from "@/lib/repositories/MediaStorageRepository"

// ==========================================
// 1. LOCATION RUNNER (GPS GEOLOCATION)
// ==========================================
export function LocationRunner({ field, value, onChange, disabled }: RunnerFieldProps) {
  const [isLoading, setIsLoading] = React.useState(false)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)

  const buttonLabel = field.settings?.buttonLabel || "Capture Location"
  const locationData = (value && typeof value === "object" && "latitude" in value) ? (value as LocationResponse) : null

  const handleCaptureLocation = () => {
    if (disabled || isLoading) return
    setErrorMsg(null)

    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setErrorMsg("Location is not supported by this browser.")
      return
    }

    setIsLoading(true)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLoading(false)
        const newLocation: LocationResponse = {
          latitude: Math.round(position.coords.latitude * 100000) / 100000,
          longitude: Math.round(position.coords.longitude * 100000) / 100000,
          accuracy: Math.round((position.coords.accuracy || 0) * 10) / 10,
          capturedAt: new Date().toISOString(),
        }
        onChange?.(newLocation)
      },
      (error) => {
        setIsLoading(false)
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setErrorMsg("Location permission was denied.")
            break
          case error.POSITION_UNAVAILABLE:
            setErrorMsg("Unable to determine your location.")
            break
          case error.TIMEOUT:
            setErrorMsg("Location request timed out. Please try again.")
            break
          default:
            setErrorMsg("Failed to capture location.")
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    )
  }

  // Format captured timestamp
  const formattedTime = React.useMemo(() => {
    if (!locationData?.capturedAt) return ""
    try {
      const d = new Date(locationData.capturedAt)
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } catch {
      return locationData.capturedAt
    }
  }, [locationData?.capturedAt])

  return (
    <div className="space-y-3">
      {/* Error Message Banner */}
      {errorMsg && (
        <div className="p-3 rounded-card border border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-150">
          <AlertCircle className="size-4 shrink-0 text-red-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Captured Location Display */}
      {locationData ? (
        <div className="p-4 rounded-card border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
              <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Location captured</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCaptureLocation}
              disabled={disabled || isLoading}
              className="h-7 text-xs font-semibold gap-1.5 px-2.5 border-emerald-500/30 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-500/10"
            >
              {isLoading ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <RefreshCw className="size-3" />
              )}
              <span>Recapture</span>
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <div className="p-2 rounded bg-card/80 border border-neutral-200/50 dark:border-neutral-800">
              <span className="text-[9px] font-bold text-neutral-400 uppercase block">Latitude</span>
              <span className="text-xs font-mono font-bold text-neutral-900 dark:text-neutral-100">{locationData.latitude}</span>
            </div>
            <div className="p-2 rounded bg-card/80 border border-neutral-200/50 dark:border-neutral-800">
              <span className="text-[9px] font-bold text-neutral-400 uppercase block">Longitude</span>
              <span className="text-xs font-mono font-bold text-neutral-900 dark:text-neutral-100">{locationData.longitude}</span>
            </div>
            <div className="p-2 rounded bg-card/80 border border-neutral-200/50 dark:border-neutral-800">
              <span className="text-[9px] font-bold text-neutral-400 uppercase block">Accuracy</span>
              <span className="text-xs font-mono font-bold text-neutral-900 dark:text-neutral-100">{locationData.accuracy} m</span>
            </div>
            <div className="p-2 rounded bg-card/80 border border-neutral-200/50 dark:border-neutral-800">
              <span className="text-[9px] font-bold text-neutral-400 uppercase block">Captured</span>
              <span className="text-xs font-mono font-bold text-neutral-900 dark:text-neutral-100">{formattedTime}</span>
            </div>
          </div>
        </div>
      ) : (
        /* Capture Button */
        <Button
          type="button"
          onClick={handleCaptureLocation}
          disabled={disabled || isLoading}
          className="h-10 px-4 gap-2 font-bold text-xs shadow-xs"
        >
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Getting location...</span>
            </>
          ) : (
            <>
              <MapPin className="size-4" />
              <span>{buttonLabel}</span>
            </>
          )}
        </Button>
      )}
    </div>
  )
}

// ==========================================
// 2. PHOTO RUNNER (CAMERA / FILE UPLOAD)
// ==========================================
export function PhotoRunner({ field, value, onChange, disabled }: RunnerFieldProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const buttonLabel = field.settings?.buttonLabel || "Add Photo"
  const maxPhotos = field.settings?.maxPhotos || field.validation?.maxPhotos || 1

  // Parse photos response list
  const photosList: PhotoItem[] = React.useMemo(() => {
    if (!value) return []
    if (Array.isArray(value)) return value as PhotoItem[]
    if (typeof value === "object" && "dataUrl" in value) return [value as PhotoItem]
    return []
  }, [value])

  const isLimitReached = photosList.length >= maxPhotos

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0 || isLimitReached || disabled) return

    const file = files[0]
    if (!file.type.startsWith("image/")) return

    // Read image as Data URL
    const reader = new FileReader()
    reader.onload = async () => {
      const dataUrl = reader.result as string
      const photoId = `photo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`

      // Save to IndexedDB media store
      await mediaStorageRepository.savePhoto(photoId, dataUrl)

      const newPhoto: PhotoItem = {
        id: photoId,
        name: file.name,
        dataUrl,
        size: file.size,
        type: file.type,
        capturedAt: new Date().toISOString(),
      }

      const nextPhotos = maxPhotos === 1 ? [newPhoto] : [...photosList, newPhoto]
      onChange?.(maxPhotos === 1 ? nextPhotos[0] : nextPhotos)
    }
    reader.readAsDataURL(file)

    // Reset input value so same photo can be re-selected if removed
    e.target.value = ""
  }

  const handleRemovePhoto = async (photoId: string) => {
    if (disabled) return
    await mediaStorageRepository.deletePhoto(photoId)
    const nextPhotos = photosList.filter((p) => p.id !== photoId)
    if (maxPhotos === 1) {
      onChange?.(null)
    } else {
      onChange?.(nextPhotos)
    }
  }

  return (
    <div className="space-y-3">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        disabled={disabled || isLimitReached}
        className="hidden"
      />

      {/* Thumbnails Grid */}
      {photosList.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photosList.map((photo) => (
            <div
              key={photo.id}
              className="relative group rounded-card overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 aspect-square shadow-xs"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.dataUrl}
                alt={photo.name || "Field Photo"}
                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(photo.id)}
                  disabled={disabled}
                  className="p-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors shadow-md"
                  title="Remove Photo"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Photo Button */}
      {!isLimitReached && (
        <Button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isLimitReached}
          variant="outline"
          className="h-10 px-4 gap-2 font-bold text-xs border-dashed border-neutral-300 dark:border-neutral-700 hover:border-primary hover:bg-primary/5 shadow-xs"
        >
          <Camera className="size-4 text-primary shrink-0" />
          <span>{photosList.length > 0 ? "Add Another Photo" : buttonLabel}</span>
          <span className="text-[10px] text-neutral-400 font-mono font-normal">({photosList.length}/{maxPhotos})</span>
        </Button>
      )}
    </div>
  )
}

export default LocationRunner;
