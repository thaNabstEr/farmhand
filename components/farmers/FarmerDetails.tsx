"use client"

import * as React from "react"
import { FarmerWithFarms } from "@/lib/repositories/SupabaseFarmerRepository"
import { MetricCard } from "@/components/shared/MetricCard"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Calendar,
  User,
  MapPin,
  Building2,
  CreditCard,
  Map,
} from "lucide-react"

interface FarmerDetailsProps {
  farmer: FarmerWithFarms
  onBack: () => void
  onEdit: (farmer: FarmerWithFarms) => void
  onDelete: (farmer: FarmerWithFarms) => void
  onSelectFarm?: (farmId: string) => void
}

export function FarmerDetails({
  farmer,
  onBack,
  onEdit,
  onDelete,
  onSelectFarm,
}: FarmerDetailsProps) {
  const fullName = `${farmer.first_name} ${farmer.last_name}`
  const farms = farmer.farms || []

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
        >
          <ArrowLeft className="size-4" />
          <span>Back to All Farmers</span>
        </button>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => onEdit(farmer)}
            variant="outline"
            size="sm"
            className="h-8 text-xs font-semibold gap-1.5 border-neutral-200 dark:border-neutral-800"
          >
            <Edit2 className="size-3.5" />
            <span>Edit Profile</span>
          </Button>
          <Button
            onClick={() => onDelete(farmer)}
            variant="outline"
            size="sm"
            className="h-8 text-xs font-semibold gap-1.5 border-red-200 dark:border-red-900/50 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
          >
            <Trash2 className="size-3.5" />
            <span>Delete Farmer</span>
          </Button>
        </div>
      </div>

      {/* Main Header Profile Card */}
      <div className="p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="size-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg border border-emerald-500/20 shrink-0">
              <User className="size-6" />
            </div>
            <div className="space-y-1">
              <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
                {fullName}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                {farmer.national_id && (
                  <span className="inline-flex items-center gap-1 font-mono">
                    <CreditCard className="size-3 text-neutral-400" />
                    <span>ID: {farmer.national_id}</span>
                  </span>
                )}
                {(farmer.community || farmer.village) && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3 text-neutral-400" />
                    <span>{[farmer.village, farmer.community].filter(Boolean).join(", ")}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-medium shrink-0">
            <Calendar className="size-3.5" />
            <span>Registered {new Date(farmer.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Assigned Farms"
          value={farms.length.toString()}
          change="Registered"
          changeType="increase"
          iconName="Building2"
          status="info"
          description="Farms owned/operated by this farmer"
        />
        <MetricCard
          title="Contact Info"
          value={farmer.phone ? "Phone Provided" : farmer.email ? "Email Provided" : "None"}
          change={farmer.phone || farmer.email ? "Available" : "Optional"}
          changeType="neutral"
          iconName="Phone"
          status="success"
          description={farmer.phone || farmer.email || "No direct contact provided"}
        />
        <MetricCard
          title="Security State"
          value="Authenticated"
          change="RLS Protected"
          changeType="increase"
          iconName="ShieldCheck"
          status="success"
          description="Protected by Supabase RLS policies"
        />
      </div>

      {/* Detailed Profile & Assigned Farms Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Contact & Identification */}
        <div className="p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <User className="size-4 text-emerald-600" />
            <span>Contact & Details</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">Phone</span>
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                {farmer.phone || <span className="italic text-neutral-400">Not provided</span>}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">Email</span>
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                {farmer.email || <span className="italic text-neutral-400">Not provided</span>}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">National ID</span>
              <span className="font-semibold text-neutral-800 dark:text-neutral-200 font-mono">
                {farmer.national_id || <span className="italic text-neutral-400 font-sans">Not provided</span>}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">Community / District</span>
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                {farmer.community || <span className="italic text-neutral-400">Not provided</span>}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">Village</span>
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                {farmer.village || <span className="italic text-neutral-400">Not provided</span>}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Associated Farms */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Building2 className="size-4 text-emerald-600" />
              <span>Assigned Farms ({farms.length})</span>
            </h3>
          </div>

          {farms.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-400 font-medium rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800 space-y-1">
              <p className="font-semibold text-neutral-600 dark:text-neutral-400">No farms currently assigned to this farmer.</p>
              <p>You can assign this farmer when creating or editing a farm in the Farm Registry.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {farms.map((farm) => (
                <div
                  key={farm.id}
                  onClick={() => onSelectFarm?.(farm.id)}
                  className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 hover:border-emerald-500/50 bg-neutral-50/50 dark:bg-neutral-950 transition-all cursor-pointer space-y-1.5 group"
                >
                  <div className="flex items-center gap-2">
                    <div className="size-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <Map className="size-3.5" />
                    </div>
                    <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-emerald-600 transition-colors truncate">
                      {farm.name}
                    </h4>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
