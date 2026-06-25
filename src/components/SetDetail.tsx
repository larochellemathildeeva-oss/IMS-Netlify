import React, { useState } from "react";
import { TraumaSet, Screw, VerificationStatus } from "../types";
import { Highlight } from "./Highlight";
import { ChevronLeft, Bookmark, MapPin, Edit2, Plus, Info, AlertTriangle, Layers, Check, Shield } from "lucide-react";
import { motion } from "motion/react";
import { VerificationBadge } from "./VerificationBadge";
import { computeSetVerificationStatus } from "../data/decoratedSets";

function getPlateCategory(plateName: string): string {
  const lower = plateName.toLowerCase();
  if (lower.includes("dhs") || lower.includes("dynamic hip")) {
    return "DHS & Hip System Plates";
  }
  if (lower.includes("osteotomy") || lower.includes("child") || lower.includes("infant") || lower.includes("pediplate") || lower.includes("pediatric") || lower.includes("i plate") || lower.includes("o plate")) {
    return "Pediatric & Specialty Osteotomy Plates";
  }
  if (lower.includes("straight") || lower.includes("adaption") || lower.includes("compact")) {
    return "Straight & Adaption Utility Plates";
  }
  if (lower.includes("tubular") || lower.includes("quarter tubular") || lower.includes("one third") || lower.includes("1/3 tubular")) {
    return "Tubular & Semitubular Plates";
  }
  if (lower.includes("reconstruction") || lower.includes("recon")) {
    return "Reconstruction Plates";
  }
  if (lower.includes("condylar") || lower.includes("buttress") || lower.includes("cloverleaf") || lower.includes("calcaneal")) {
    return "Condylar, Buttress & Calcaneal Plates";
  }
  if (lower.includes("t-pl") || lower.includes("l-pl") || lower.includes("oblique") || lower.includes("“t”") || lower.includes("\"t\"") || lower.includes("“l”") || lower.includes("\"l\"") || (lower.includes("t ") && !lower.includes("tibia")) || lower.includes("l ") || lower.includes("y plate") || lower.includes("y 10holes")) {
    return "T-Plates, L-Plates & Y-Plates";
  }
  if (lower.includes("clavicle") || lower.includes("olecranon") || lower.includes("humerus") || lower.includes("tibia") || lower.includes("fibula") || lower.includes("radius") || lower.includes("dist rad")) {
    return "Anatomical & Fracture-Specific Plates";
  }
  if (lower.includes("lcp") || lower.includes("va lcp") || lower.includes("locking")) {
    return "Locking Compression Plates (LCP)";
  }
  return "General & Utility Plates";
}

function extractPlateCatalogRef(plateName: string): string {
  const match = plateName.match(/#([A-Za-z0-9._\-/]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return "N/A";
}

interface SetDetailProps {
  traumaSet: TraumaSet;
  customLocation: string;
  onBack: () => void;
  searchQuery: string;
  onSaveLocation: (setId: string, loc: string) => void;
  onAddReorder: (screw: Screw, set: TraumaSet) => void;
  onOutOfStock?: (screw: Screw, set: TraumaSet) => void;
  isOnSite?: boolean;
  onToggleOnSite?: (setId: string) => void;
  onAddPlateReorder?: (plateName: string, set: TraumaSet, qty: number, catalogRef: string) => void;
  setVerifications?: Record<string, { verificationStatus: "tray-verified" | "source-verified" | "unverified"; verifiedBy?: string; verifiedDate?: string }>;
  onVerifyClick?: (itemId: string | undefined, itemType: "screw" | "plate" | "set", itemName: string) => void;
  onAddManualItemClick?: () => void;
}

export function SetDetail({
  traumaSet,
  customLocation,
  onBack,
  searchQuery,
  onSaveLocation,
  onAddReorder,
  onOutOfStock,
  isOnSite,
  onToggleOnSite,
  onAddPlateReorder,
  setVerifications = {},
  onVerifyClick,
  onAddManualItemClick,
}: SetDetailProps) {
  // Location editing state
  const [isEditingLoc, setIsEditingLoc] = useState(false);
  const [editedLoc, setEditedLoc] = useState(customLocation || "");

  const computedSetVerif = computeSetVerificationStatus(traumaSet, setVerifications);

  // Plate Selection States grouped by Category
  const [selectedPlates, setSelectedPlates] = useState<Record<string, string>>({});
  const [plateQuantities, setPlateQuantities] = useState<Record<string, number>>({});
  const [successMessages, setSuccessMessages] = useState<Record<string, string>>({});

  const currentMaterial = traumaSet.defaultMaterial || "Both";

  const handlePlateSelect = (catName: string, plateName: string) => {
    setSelectedPlates((prev) => ({ ...prev, [catName]: plateName }));
    setSuccessMessages((prev) => ({ ...prev, [catName]: "" }));
  };

  const handlePlateQtyChange = (catName: string, delta: number) => {
    const current = plateQuantities[catName] || 1;
    const next = Math.max(1, current + delta);
    setPlateQuantities((prev) => ({ ...prev, [catName]: next }));
  };

  const handleCommitPlateReorder = (catName: string) => {
    const plateVal = selectedPlates[catName];
    if (!plateVal) return;

    const qty = plateQuantities[catName] || 1;
    const catRef = extractPlateCatalogRef(plateVal);

    if (onAddPlateReorder) {
      onAddPlateReorder(plateVal, traumaSet, qty, catRef);
    } else {
      onAddReorder(
        {
          type: plateVal,
          lengthRange: "N/A",
          interval: "single",
          notes: "Plate implant",
        },
        traumaSet
      );
    }

    setSuccessMessages((prev) => ({
      ...prev,
      [catName]: `Success! Added ${qty}x Plate`,
    }));

    // Reset selection after a short delay
    setTimeout(() => {
      setSuccessMessages((prev) => ({ ...prev, [catName]: "" }));
    }, 3500);
  };

  const handleSaveLoc = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveLocation(traumaSet.id, editedLoc);
    setIsEditingLoc(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
      id={`set-detail-${traumaSet.id}`}
    >
      {/* Clinician's Back button */}
      <div>
        <button
          onClick={onBack}
          className="group flex items-center gap-2 text-sm font-semibold text-teal-850 hover:text-teal-900 transition bg-teal-50 hover:bg-teal-100/70 px-3.5 py-1.5 rounded-lg border border-teal-200/40 cursor-pointer"
          id="btn-back-to-list"
        >
          <ChevronLeft
            size={16}
            className="group-hover:-translate-x-0.5 transition"
          />
          Back to Implant Finder
        </button>
      </div>

      {/* Primary Info Sheet Header Panel */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs relative overflow-hidden space-y-4">
        {/* Subtle decorative color bar indicating alloy material */}
        <div
          className={`absolute top-0 left-0 right-0 h-1.5 ${
            currentMaterial === "Ti"
              ? "bg-cyan-500"
              : currentMaterial === "SS"
                ? "bg-slate-400"
                : "bg-gradient-to-r from-slate-400 to-cyan-500"
          }`}
        />

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2.5 w-full">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md border ${
                  currentMaterial === "Ti"
                    ? "bg-cyan-50 text-cyan-800 border-cyan-250"
                    : currentMaterial === "SS"
                      ? "bg-slate-50 text-slate-750 border-slate-250"
                      : "bg-teal-50 text-teal-850 border-teal-250"
                }`}
                id="detail-material-badge"
              >
                {currentMaterial === "Ti"
                  ? "Titanium (Ti)"
                  : currentMaterial === "SS"
                    ? "Stainless Steel (SS)"
                    : "Stainless Steel & Titanium (Both)"}
              </span>
              <span className="text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded-md">
                {traumaSet.screws.length + (traumaSet.plates?.length || 0)} clinical items
              </span>
              {traumaSet.pNumber && (
                <span className="text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 bg-blue-50 text-blue-805 border border-blue-200 rounded-md uppercase select-all" title="Hospital P-Number Reference">
                  Ref: {traumaSet.pNumber}
                </span>
              )}
              <VerificationBadge
                status={computedSetVerif.status}
                verifiedBy={computedSetVerif.verifiedBy}
                verifiedDate={computedSetVerif.verifiedDate}
                onClick={(e) => {
                  e.stopPropagation();
                  onVerifyClick && onVerifyClick(undefined, "set", traumaSet.name);
                }}
                size="sm"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <h2
                className="text-xl sm:text-2xl font-bold font-display text-slate-900 tracking-tight leading-snug"
                id={`detail-title-${traumaSet.id}`}
              >
                {traumaSet.name}
              </h2>
              <button
                type="button"
                onClick={() => onVerifyClick && onVerifyClick(undefined, "set", traumaSet.name)}
                className="self-start sm:self-center text-[11px] font-bold text-teal-850 bg-teal-50 border border-teal-200 hover:bg-teal-100 transition px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer select-none"
              >
                <Shield size={12} className="text-teal-650" />
                <span>Verify Entire Set</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1">
              {computedSetVerif.status !== "unverified" ? (
                <p className="text-[11px] text-teal-800 bg-teal-50/50 border border-teal-150 px-2 py-0.5 rounded-md font-medium flex items-center gap-1 select-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Verified by <strong>{computedSetVerif.verifiedBy || "Clinician"}</strong> on {computedSetVerif.verifiedDate}</span>
                </p>
              ) : (
                <p className="text-[11px] text-slate-500 bg-slate-55 border border-slate-205 px-2 py-0.5 rounded-md font-medium flex items-center gap-1 select-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  <span>Never independently verified — confirm against physical tray</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Location management drawer subsegment */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-600">
          <div className="flex items-center gap-2 text-sm">
            <MapPin size={17} className="text-teal-650 flex-shrink-0" />
            <span className="font-bold text-slate-500 text-xs uppercase tracking-wider">
              Storage Location:
            </span>
            {isEditingLoc ? (
              <form
                onSubmit={handleSaveLoc}
                className="flex items-center gap-2 flex-wrap"
              >
                <input
                  type="text"
                  value={editedLoc}
                  onChange={(e) => setEditedLoc(e.target.value)}
                  className="bg-slate-100 border border-slate-300 rounded px-2 py-0.5 text-sm focus:outline-teal-700 min-w-[200px]"
                  placeholder="e.g. Cart 1A, Drawer 2"
                  autoFocus
                />
                <button
                  type="submit"
                  className="bg-teal-700 hover:bg-teal-800 text-white rounded px-2.5 py-0.5 text-xs font-semibold cursor-pointer"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditedLoc(customLocation || "");
                    setIsEditingLoc(false);
                  }}
                  className="text-slate-550 hover:text-slate-800 text-xs px-2 cursor-pointer"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-800 bg-teal-50/70 border border-teal-150 px-2.5 py-0.5 rounded text-xs animate-pulse">
                  {customLocation || "Not Assigned"}
                </span>
                <button
                  onClick={() => {
                    setEditedLoc(customLocation || "");
                    setIsEditingLoc(true);
                  }}
                  className="p-1 text-slate-400 hover:text-teal-700 rounded transition cursor-pointer"
                  title="Modify storage code"
                >
                  <Edit2 size={13} />
                </button>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {isOnSite !== undefined && onToggleOnSite && (
              <button
                type="button"
                onClick={() => onToggleOnSite(traumaSet.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border transition duration-150 select-none cursor-pointer ${
                  isOnSite
                    ? "bg-emerald-50 text-emerald-800 border-emerald-250 hover:bg-emerald-100/70"
                    : "bg-amber-50 text-amber-805 border-amber-250 hover:bg-amber-100/70"
                }`}
              >
                <span>{isOnSite ? "🟢 On-Site Inventory" : "🚚 Off-Site Rep Loaner"}</span>
                <span className="text-[10px] text-slate-450 font-medium font-sans">(Toggle)</span>
              </button>
            )}
            <div className="text-xs text-slate-400 italic font-medium">
              Check local surgical pack before sterilizing.
            </div>
          </div>
        </div>
      </div>

      {/* Plates Contained In This Set */}
      {traumaSet.plates && traumaSet.plates.length > 0 && (
        <div
          className="bg-white border border-slate-250 rounded-3xl overflow-hidden shadow-xs"
          id="plates-reorder-container"
        >
          <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center justify-between text-xs font-bold text-slate-650 uppercase tracking-wider select-none">
            <span className="flex items-center gap-1.5 font-display text-slate-705">
              <Layers size={13} className="text-[#00A3E0]" />
              <span>Plates Reordering & Clinical Specifications ({traumaSet.plates.length})</span>
            </span>
            <span className="text-[10px] text-slate-400 capitalize">Organized by System Category</span>
          </div>

          <div className="p-4 sm:p-5 space-y-4">
            <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
              Select implantable plates below categorized by style group. Use the interactive drop-down menus to log surgical plate uses and add items to your replenishment requisition sheet.
            </p>

            {/* Run grouping algorithm */}
            {(() => {
              const grouped: Record<string, string[]> = {};
              traumaSet.plates!.forEach((plate) => {
                const cat = getPlateCategory(plate);
                if (!grouped[cat]) grouped[cat] = [];
                grouped[cat].push(plate);
              });

              return (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {Object.entries(grouped).map(([category, items]) => {
                    const selectedPlateValue = selectedPlates[category] || "";
                    const currentQty = plateQuantities[category] || 1;
                    const successMsg = successMessages[category] || "";
                    const parsedRef = selectedPlateValue ? extractPlateCatalogRef(selectedPlateValue) : "N/A";

                    return (
                      <div
                        key={category}
                        className="bg-slate-50/40 hover:bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between transition duration-150 shadow-3xs"
                      >
                        <div className="space-y-2.5">
                          {/* Heading & badge */}
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="text-xs font-bold text-slate-755 font-display leading-tight flex-1">
                              {category}
                            </h4>
                            <span className="bg-[#00A3E0]/15 text-[#00A3E0] font-mono text-[9px] px-1.5 py-0.5 rounded-md font-bold select-none">
                              {items.length} item{items.length !== 1 ? "s" : ""}
                            </span>
                          </div>

                          {/* Dropdown Select Menu */}
                          <div className="space-y-1">
                            <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                              Choose Plate Model
                            </label>
                            <select
                              value={selectedPlateValue}
                              onChange={(e) => handlePlateSelect(category, e.target.value)}
                              className="w-full bg-white border border-slate-205 rounded-xl px-2.5 py-2 text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#00A3E0] cursor-pointer"
                            >
                              <option value="">-- Click to select clinical model --</option>
                              {items.map((plate, index) => {
                                const isMatched = searchQuery && plate.toLowerCase().includes(searchQuery.toLowerCase());
                                return (
                                  <option
                                    key={index}
                                    value={plate}
                                    className={isMatched ? "bg-amber-50 font-semibold text-slate-900" : "text-slate-800"}
                                  >
                                    {isMatched ? "★ " : ""}{plate}
                                  </option>
                                );
                              })}
                            </select>
                          </div>

                          {/* Full Name display & parsed Catalog Ref */}
                          {selectedPlateValue && (() => {
                            const plateVerif = setVerifications[selectedPlateValue] || { verificationStatus: "unverified" };
                            return (
                              <div className="bg-white border border-slate-150 rounded-xl p-2.5 space-y-1.5 text-[11px] leading-relaxed">
                                <div className="font-semibold text-slate-800">
                                  <span className="text-[10px] font-bold text-slate-450 block uppercase tracking-tight">Active Selection:</span>
                                  {selectedPlateValue}
                                </div>
                                <div className="flex items-center gap-1 font-mono text-[10px]">
                                  <span className="text-slate-400 font-sans font-bold">CATALOG REF:</span>
                                  <span className="bg-teal-50 text-teal-800 border border-teal-100 px-1.5 py-0.2 rounded font-bold uppercase select-all">
                                    #{parsedRef}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 flex-wrap gap-1.5">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight font-sans">VERIFICATION STATUS:</span>
                                  <VerificationBadge
                                    status={plateVerif.verificationStatus as any}
                                    verifiedBy={plateVerif.verifiedBy}
                                    verifiedDate={plateVerif.verifiedDate}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onVerifyClick && onVerifyClick(selectedPlateValue, "plate", selectedPlateValue);
                                    }}
                                    size="sm"
                                  />
                                </div>
                              </div>
                            );
                          })()}
                        </div>

                        {/* Controls row */}
                        <div className="mt-4 pt-3 border-t border-slate-200/50 flex items-center justify-between gap-2.5 flex-wrap">
                          {/* Quantity inputs */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight select-none">Qty:</span>
                            <div className="flex items-center">
                              <button
                                type="button"
                                disabled={!selectedPlateValue}
                                onClick={() => handlePlateQtyChange(category, -1)}
                                className="w-6 h-6 border border-slate-200 bg-white hover:bg-slate-100 rounded-l-lg font-bold flex items-center justify-center transition disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                              >
                                -
                              </button>
                              <span className="w-8 text-center text-xs font-bold font-mono text-slate-900 border-y border-slate-200 py-1 bg-white">
                                {currentQty}
                              </span>
                              <button
                                type="button"
                                disabled={!selectedPlateValue}
                                onClick={() => handlePlateQtyChange(category, 1)}
                                className="w-6 h-6 border border-slate-200 bg-white hover:bg-slate-100 rounded-r-lg font-bold flex items-center justify-center transition disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Reorder Button */}
                          <div className="flex items-center gap-2">
                            {successMsg ? (
                              <span className="text-[10.5px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-150 px-2.5 py-1 rounded-lg flex items-center gap-1 animate-pulse select-none">
                                <Check size={12} className="stroke-[2.5]" />
                                <span>{successMsg}</span>
                              </span>
                            ) : (
                              <button
                                type="button"
                                disabled={!selectedPlateValue}
                                onClick={() => handleCommitPlateReorder(category)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-850 hover:bg-teal-900 text-white text-xs font-bold rounded-lg transition shadow-2xs hover:shadow-xs disabled:opacity-40 disabled:pointer-events-none select-none cursor-pointer border border-teal-900/60"
                              >
                                <Plus size={12} strokeWidth={2.5} />
                                <span>Record Plate Usage</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

          </div>
        </div>
      )}

      {/* Screw List card container */}
      <div
        className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs"
        id="screws-list-container"
      >
        <div className="bg-slate-50/70 p-4 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-650 uppercase tracking-wider select-none">
          <span>Screw Implants Specification Inventory</span>
          <span>Lengths</span>
        </div>

        <div className="divide-y divide-slate-100">
          {traumaSet.screws.map((screw, index) => {
            // Check if the current screw matches search query
            const isMatched =
              searchQuery &&
              (screw.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (screw.notes || "")
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase()));

            const screwVerif = setVerifications[screw.type] || { verificationStatus: "unverified" };

            return (
              <motion.div
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                key={index}
                onClick={() => onAddReorder(screw, traumaSet)}
                className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-teal-50/20 transition cursor-pointer border-l-2 hover:border-l-teal-600 ${
                  isMatched
                    ? "bg-amber-50/35 border-l-4 border-l-amber-500"
                    : "border-l-transparent"
                }`}
                id={`screw-row-${index}`}
              >
                {/* Left side: Type & Notes */}
                <div className="space-y-1 flex-1">
                  <div className="flex items-start sm:items-center gap-2.5 flex-wrap sm:flex-nowrap">
                    {/* Tiny representation of screw head */}
                    <div className="flex-shrink-0 w-4.5 h-4.5 rounded-full border border-slate-350 bg-slate-100 flex items-center justify-center text-[9px] font-mono font-bold text-slate-500 shadow-inner">
                      +
                    </div>
                    <span className="font-semibold text-slate-900 leading-tight block text-[14px] sm:text-base">
                      <Highlight text={screw.type} query={searchQuery} />
                    </span>
                    <VerificationBadge
                      status={screwVerif.verificationStatus as any}
                      verifiedBy={screwVerif.verifiedBy}
                      verifiedDate={screwVerif.verifiedDate}
                      onClick={(e) => {
                        e.stopPropagation();
                        onVerifyClick && onVerifyClick(screw.type, "screw", screw.type);
                      }}
                      size="sm"
                    />
                  </div>
                </div>

                {/* Right side: Length details & action */}
                <div className="pl-7 sm:pl-0 flex flex-wrap items-center gap-3.5 justify-between sm:justify-end w-full sm:w-auto">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-semibold select-none">
                      Length range:
                    </span>
                    <div className="bg-slate-105 text-slate-800 font-mono text-sm px-2.5 py-1 rounded-md border border-slate-200/80 font-bold block">
                      {screw.lengthRange} mm
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onOutOfStock) {
                          onOutOfStock(screw, traumaSet);
                        }
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 hover:text-rose-800 text-xs font-bold rounded-lg transition shadow-2xs hover:shadow-xs cursor-pointer select-none"
                      id={`btn-outofstock-click-${index}`}
                      title="Trigger Out of Stock email notification to main users"
                    >
                      <AlertTriangle size={13} className="text-rose-600" />
                      <span>Out of Stock</span>
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddReorder(screw, traumaSet);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-850 hover:bg-teal-900 border border-teal-950 text-white text-xs font-bold rounded-lg transition shadow-2xs hover:shadow-xs cursor-pointer select-none"
                      id={`btn-reorder-click-${index}`}
                    >
                      <Plus size={13} strokeWidth={2.5} />
                      <span>Record Use</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}

        </div>
      </div>

      {/* ⚠️ MANUAL ADD SHORTCUT BLOCK IF IMPLANT NOT FOUND */}
      {onAddManualItemClick && (
        <div className="bg-amber-50/45 border border-amber-250/70 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-3xs">
          <div className="space-y-1">
            <h4 className="text-amber-900 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 select-none">
              <span className="text-sm">📝</span>
              <span>Can't find the specific implant?</span>
            </h4>
            <p className="text-xs text-slate-550 leading-relaxed max-w-xl">
              If the exact implant specification, specialized length, or plate style is not cataloged in the <strong>{traumaSet.name}</strong> database list, you can input details manually.
            </p>
          </div>
          <button
            onClick={onAddManualItemClick}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition shadow-3xs cursor-pointer select-none uppercase tracking-wide shrink-0 flex items-center gap-1.5 border border-amber-600/30"
            type="button"
            id="btn-set-detail-add-implant-manually"
          >
            <Plus size={13} className="text-amber-100 stroke-[3]" />
            <span>Add Implant Manually</span>
          </button>
        </div>
      )}

      {/* Clinic Drill Bits Notice */}
      <div className="bg-amber-50/60 border border-amber-200/50 rounded-2xl p-4 flex gap-3 text-xs text-amber-900 leading-relaxed shadow-xs">
        <span className="text-lg select-none">💡</span>
        <div>
          <p className="font-bold text-amber-950 mb-0.5">Operational Note</p>
          Peel-Packed Drill Bits are kept in the core.
        </div>
      </div>
    </motion.div>
  );
}
