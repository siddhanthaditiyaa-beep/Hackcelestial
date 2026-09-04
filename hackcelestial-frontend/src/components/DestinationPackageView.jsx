import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plane, Train, Building, Tent, Compass, Check, Star, MapPin, Sparkles, ShoppingBag } from "lucide-react";
import Modal from "./ui/Modal";
import Skeleton from "./ui/Skeleton";
import BookingModal from "./BookingModal";
import BundleCheckoutModal from "./BundleCheckoutModal";
import { RESULTS, TABS } from "../data/inventory";
import { AIRPORT_CITY } from "../data/locations";
import { getAITripSuggestions } from "../data/api";

const CATEGORY_ICON = { flights: Plane, trains: Train, hotels: Building, hostels: Tent, activities: Compass };

function normalize(str) {
  return (str || "").toLowerCase();
}

function destKeywords(dest) {
  const words = new Set();
  normalize(dest.name).split(/\s+/).forEach((w) => w.length > 2 && words.add(w));
  words.add(normalize(dest.name));
  words.add(normalize(dest.country));
  return [...words];
}

function itemMatchesDestination(category, item, keywords) {
  let haystack = "";
  if (category === "flights") {
    haystack = `${AIRPORT_CITY[item.from] || item.from} ${AIRPORT_CITY[item.to] || item.to}`;
  } else if (category === "trains") {
    haystack = `${item.from} ${item.to}`;
  } else {
    haystack = item.loc || "";
  }
  haystack = normalize(haystack);
  return keywords.some((k) => k && haystack.includes(k));
}

function getItemMeta(category, item) {
  const basePrice = parseInt(String(item.price || "0").replace(/[^0-9]/g, ""), 10) || 0;
  if (category === "flights") {
    return { title: `${item.airline} · ${item.from} → ${item.to}`, subtitle: `${item.dep} – ${item.arr} · ${item.duration}`, image: item.img, price: item.price, priceNum: basePrice };
  }
  if (category === "trains") {
    return { title: `${item.name} · ${item.from} → ${item.to}`, subtitle: `${item.dep} – ${item.arr} · ${item.class}`, image: item.img, price: item.price, priceNum: basePrice };
  }
  return { title: item.name, subtitle: item.loc, image: item.img, price: item.price, priceNum: basePrice, rating: item.rating };
}

export default function DestinationPackageView({ dest, onClose }) {
  const keywords = useMemo(() => destKeywords(dest), [dest]);

  const matchesByCategory = useMemo(() => {
    const out = {};
    TABS.forEach((t) => {
      out[t.id] = (RESULTS[t.id] || []).filter((item) => itemMatchesDestination(t.id, item, keywords));
    });
    return out;
  }, [keywords]);

  const availableTabs = TABS.filter((t) => matchesByCategory[t.id].length > 0);
  const [activeTab, setActiveTab] = useState(availableTabs[0]?.id || "activities");
  const [selected, setSelected] = useState({}); // `${category}:${id}` -> {category, item}
  const [customizeItem, setCustomizeItem] = useState(null); // {item, category}
  const [showCheckout, setShowCheckout] = useState(false);
  const [aiTips, setAiTips] = useState([]);
  const [loadingTips, setLoadingTips] = useState(availableTabs.length === 0);

  useEffect(() => {
    if (availableTabs.length === 0) {
      setLoadingTips(true);
      getAITripSuggestions(dest.name).then(setAiTips).catch(() => setAiTips([])).finally(() => setLoadingTips(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dest.name]);

  const toggleSelect = (category, item) => {
    const key = `${category}:${item.id}`;
    setSelected((prev) => {
      const next = { ...prev };
      if (next[key]) delete next[key];
      else next[key] = { category, item };
      return next;
    });
  };

  const selectedList = Object.values(selected);
  const bundleTotal = selectedList.reduce((sum, { category, item }) => sum + getItemMeta(category, item).priceNum, 0);

  if (customizeItem) {
    return (
      <BookingModal
        item={customizeItem.item}
        category={customizeItem.category}
        onClose={() => setCustomizeItem(null)}
      />
    );
  }

  if (showCheckout) {
    return (
      <BundleCheckoutModal
        items={selectedList}
        onClose={() => setShowCheckout(false)}
        onDone={onClose}
      />
    );
  }

  return (
    <Modal onClose={onClose} showCloseButton maxWidth="max-w-5xl" className="max-h-[88vh]">
      {/* Header */}
      <div className="relative h-40 shrink-0 overflow-hidden">
        <img src={dest.img} alt={dest.name} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-4 left-6 right-6">
          <div className="text-white/70 text-xs font-semibold uppercase tracking-wide flex items-center gap-1.5">
            <MapPin className="h-3 w-3" /> {dest.country} · {dest.temp}
          </div>
          <h2 className="font-display font-semibold text-white text-2xl leading-tight">{dest.name}</h2>
        </div>
      </div>

      {availableTabs.length > 0 ? (
        <>
          {/* Category tabs */}
          <div className="flex items-center gap-1 p-3 border-b border-border overflow-x-auto shrink-0">
            {availableTabs.map((t) => {
              const Icon = CATEGORY_ICON[t.id];
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-sm text-xs font-bold whitespace-nowrap transition-all ${
                    activeTab === t.id ? "bg-ink text-page" : "text-ink-dim hover:bg-surface-sunk"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" /> {t.label} <span className="opacity-60">({matchesByCategory[t.id].length})</span>
                </button>
              );
            })}
          </div>

          {/* Items */}
          <div className="p-6 overflow-y-auto space-y-3 flex-1">
            {matchesByCategory[activeTab].map((item) => {
              const meta = getItemMeta(activeTab, item);
              const key = `${activeTab}:${item.id}`;
              const isSelected = !!selected[key];
              return (
                <div
                  key={item.id}
                  className={`flex flex-wrap items-center gap-3 rounded-md border p-3 transition-all ${
                    isSelected ? "border-brand bg-brand-dim/40" : "border-border bg-surface hover:border-border-strong"
                  }`}
                >
                  <img src={meta.image} alt={meta.title} className="h-14 w-20 rounded-sm object-cover shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-sm text-ink truncate">{meta.title}</div>
                    <div className="text-xs text-ink-faint flex items-center gap-2">
                      <span className="truncate">{meta.subtitle}</span>
                      {meta.rating && <span className="inline-flex items-center gap-0.5 shrink-0"><Star className="h-3 w-3 fill-status-risk text-status-risk" />{meta.rating}</span>}
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 w-full sm:w-auto sm:ml-auto">
                    <div className="font-semibold text-sm text-ink">{meta.price}</div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setCustomizeItem({ item, category: activeTab })}
                        className="px-3 py-2 rounded-sm border border-border text-xs font-semibold text-ink-dim hover:text-ink hover:bg-surface-sunk transition"
                      >
                        Customize
                      </button>
                      <button
                        onClick={() => toggleSelect(activeTab, item)}
                        className={`h-9 w-9 rounded-sm flex items-center justify-center transition shrink-0 ${
                          isSelected ? "bg-brand text-brand-ink" : "border border-border text-ink-faint hover:border-brand/50"
                        }`}
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bundle summary footer */}
          <div className="p-4 border-t border-border bg-surface-sunk flex items-center justify-between gap-3 shrink-0">
            <div className="text-sm text-ink-dim">
              {selectedList.length === 0 ? (
                "Select items to build your trip bundle"
              ) : (
                <>
                  <span className="font-bold text-ink">{selectedList.length} item{selectedList.length > 1 ? "s" : ""}</span> selected · <span className="font-bold text-ink">₹{bundleTotal.toLocaleString()}</span>
                </>
              )}
            </div>
            <button
              onClick={() => setShowCheckout(true)}
              disabled={selectedList.length === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-sm bg-brand text-brand-ink text-sm font-bold hover:brightness-105 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ShoppingBag className="h-4 w-4" /> Book Everything
            </button>
          </div>
        </>
      ) : (
        <div className="p-8 overflow-y-auto flex-1">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-4 w-4 text-brand" />
            <h3 className="font-display font-medium text-ink">Coming soon for {dest.name} — here's what our AI suggests</h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 mb-6">
            {(loadingTips ? Array.from({ length: 4 }) : aiTips).map((tip, i) => (
              <motion.div key={tip?.title || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="rounded-md bg-surface border border-border p-4">
                {tip ? (
                  <>
                    <div className="flex items-center gap-2 mb-1.5"><span className="text-lg">{tip.emoji}</span><span className="font-semibold text-sm text-ink">{tip.title}</span></div>
                    <p className="text-xs text-ink-dim leading-relaxed">{tip.text}</p>
                  </>
                ) : (
                  <Skeleton className="h-12" />
                )}
              </motion.div>
            ))}
          </div>
          <p className="text-xs text-ink-faint">We don't have live inventory here yet — try one of these nearby destinations with real bookings available:</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {TABS.map((t) => {
              const count = (RESULTS[t.id] || []).length;
              return count ? (
                <span key={t.id} className="text-xs px-2.5 py-1 rounded-full bg-surface-sunk border border-border text-ink-dim">{t.label}: {count} live</span>
              ) : null;
            })}
          </div>
        </div>
      )}
    </Modal>
  );
}
