import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import {
  Search, MapPin, Calendar, Users, Star, Sparkles, ArrowRight,
  Clock, Zap, Shield, TrendingUp, ChevronRight, Heart, Map, List,
  Globe, X, RotateCw
} from "lucide-react";
import Reviews from "./Reviews";
import BookingModal from "./BookingModal";
import ResultCard from "./ui/ResultCard";
import DarkPromoBanner from "./ui/DarkPromoBanner";
import Autocomplete from "./ui/Autocomplete";
import DestinationPackageView from "./DestinationPackageView";
import { useBooking } from "../context/BookingContext";
import { CATEGORY_TINT } from "../utils/visuals";
import { getAITravelInsights } from "../data/api";
import { TABS, RESULTS } from "../data/inventory";

/* Fix Leaflet default icon */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/* ── ALL DESTINATIONS (40+) ─────────────────────────────────── */
const ALL_DESTINATIONS = [
  // India
  { id:"i1",  name:"Goa",            country:"India",       region:"South Asia",    lat:15.2993, lng:74.1240, img:"https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&q=80", tag:"🏖 Beach",      temp:"30°C", price:"From ₹4,200", popular:true },
  { id:"i2",  name:"Kerala",         country:"India",       region:"South Asia",    lat:10.8505, lng:76.2711, img:"https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=600&q=80", tag:"🌿 Nature",     temp:"30°C", price:"From ₹3,800", popular:true },
  { id:"i3",  name:"Rajasthan",      country:"India",       region:"South Asia",    lat:27.0238, lng:74.2179, img:"https://images.unsplash.com/photo-1477587458883-47145ed94245?w=600&q=80", tag:"🏰 Heritage",   temp:"28°C", price:"From ₹3,500" },
  { id:"i4",  name:"Manali",         country:"India",       region:"South Asia",    lat:32.2432, lng:77.1892, img:"https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600&q=80", tag:"🏔 Mountains",  temp:"8°C",  price:"From ₹2,900" },
  { id:"i5",  name:"Varanasi",       country:"India",       region:"South Asia",    lat:25.3176, lng:82.9739, img:"https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=600&q=80", tag:"🕌 Spiritual",  temp:"26°C", price:"From ₹2,200" },
  { id:"i6",  name:"Andaman Islands",country:"India",       region:"South Asia",    lat:11.7401, lng:92.6586, img:"https://images.unsplash.com/photo-1586500036706-41963de24d8b?w=600&q=80", tag:"🏝 Island",     temp:"29°C", price:"From ₹6,800" },
  { id:"i7",  name:"Leh Ladakh",     country:"India",       region:"South Asia",    lat:34.1526, lng:77.5771, img:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80", tag:"🏔 Adventure",  temp:"5°C",  price:"From ₹5,200", popular:true },
  { id:"i8",  name:"Darjeeling",     country:"India",       region:"South Asia",    lat:27.0360, lng:88.2627, img:"https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&q=80", tag:"☕ Hills",      temp:"12°C", price:"From ₹2,400" },
  { id:"i9",  name:"Jaipur",         country:"India",       region:"South Asia",    lat:26.9124, lng:75.7873, img:"https://images.unsplash.com/photo-1524613032530-449a5d94c285?w=600&q=80", tag:"🏰 Royal",      temp:"30°C", price:"From ₹3,200" },
  { id:"i10", name:"Mumbai",         country:"India",       region:"South Asia",    lat:19.0760, lng:72.8777, img:"https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=600&q=80", tag:"🌆 Metro",      temp:"30°C", price:"From ₹2,800" },

  // Southeast Asia
  { id:"s1",  name:"Bali",           country:"Indonesia",   region:"Southeast Asia",lat:-8.4095, lng:115.1889, img:"https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80", tag:"🌴 Tropical",  temp:"28°C", price:"From ₹18,500", popular:true },
  { id:"s2",  name:"Bangkok",        country:"Thailand",    region:"Southeast Asia",lat:13.7563, lng:100.5018, img:"https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=600&q=80", tag:"🛕 Culture",   temp:"34°C", price:"From ₹16,000", popular:true },
  { id:"s3",  name:"Phuket",         country:"Thailand",    region:"Southeast Asia",lat:7.8804,  lng:98.3923, img:"https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=600&q=80", tag:"🏖 Beach",     temp:"31°C", price:"From ₹17,500" },
  { id:"s4",  name:"Hanoi",          country:"Vietnam",     region:"Southeast Asia",lat:21.0278, lng:105.8342, img:"https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600&q=80", tag:"🍜 Food",      temp:"25°C", price:"From ₹14,000" },
  { id:"s5",  name:"Singapore",      country:"Singapore",   region:"Southeast Asia",lat:1.3521,  lng:103.8198, img:"https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600&q=80", tag:"✨ Modern",    temp:"31°C", price:"From ₹28,000", popular:true },
  { id:"s6",  name:"Kuala Lumpur",   country:"Malaysia",    region:"Southeast Asia",lat:3.1390,  lng:101.6869, img:"https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600&q=80", tag:"🏙 City",      temp:"32°C", price:"From ₹15,500" },
  { id:"s7",  name:"Colombo",        country:"Sri Lanka",   region:"Southeast Asia",lat:6.9271,  lng:79.8612, img:"https://images.unsplash.com/photo-1608170825938-a8ea0305e4c2?w=600&q=80", tag:"🌊 Beach",     temp:"29°C", price:"From ₹10,500" },
  { id:"s8",  name:"Bagan",          country:"Myanmar",     region:"Southeast Asia",lat:21.1717, lng:94.8586, img:"https://images.unsplash.com/photo-1545414959-2f6e892ee0b5?w=600&q=80", tag:"⛩ Ancient",   temp:"26°C", price:"From ₹12,000" },

  // East Asia
  { id:"e1",  name:"Tokyo",          country:"Japan",       region:"East Asia",     lat:35.6762, lng:139.6503, img:"https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80", tag:"⛩ Culture",  temp:"22°C", price:"From ₹42,000", popular:true },
  { id:"e2",  name:"Kyoto",          country:"Japan",       region:"East Asia",     lat:35.0116, lng:135.7681, img:"https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&q=80", tag:"🌸 Temples",  temp:"20°C", price:"From ₹38,000" },
  { id:"e3",  name:"Seoul",          country:"South Korea", region:"East Asia",     lat:37.5665, lng:126.9780, img:"https://images.unsplash.com/photo-1601621915196-2621bfb0cd6e?w=600&q=80", tag:"🎮 K-Culture",temp:"18°C", price:"From ₹34,000", popular:true },
  { id:"e4",  name:"Bali",           country:"Indonesia",   region:"East Asia",     lat:-8.3405, lng:115.0920, img:"https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80", tag:"🌺 Island",   temp:"28°C", price:"From ₹18,500" },
  { id:"e5",  name:"Shanghai",       country:"China",       region:"East Asia",     lat:31.2304, lng:121.4737, img:"https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c2?w=600&q=80", tag:"🌆 Skyline",  temp:"20°C", price:"From ₹30,000" },

  // Middle East
  { id:"m1",  name:"Dubai",          country:"UAE",         region:"Middle East",   lat:25.2048, lng:55.2708, img:"https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80", tag:"✨ Luxury",    temp:"35°C", price:"From ₹24,000", popular:true },
  { id:"m2",  name:"Abu Dhabi",      country:"UAE",         region:"Middle East",   lat:24.4539, lng:54.3773, img:"https://images.unsplash.com/photo-1541401139778-c4d1d21c8e89?w=600&q=80", tag:"🕌 Grand",     temp:"36°C", price:"From ₹22,000" },
  { id:"m3",  name:"Istanbul",       country:"Turkey",      region:"Middle East",   lat:41.0082, lng:28.9784, img:"https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=600&q=80", tag:"🕌 Historic",  temp:"22°C", price:"From ₹26,000", popular:true },
  { id:"m4",  name:"Doha",           country:"Qatar",       region:"Middle East",   lat:25.2854, lng:51.5310, img:"https://images.unsplash.com/photo-1598127168957-c12af3e5ccc4?w=600&q=80", tag:"🏙 Modern",    temp:"38°C", price:"From ₹28,000" },

  // Europe
  { id:"eu1", name:"Paris",          country:"France",      region:"Europe",        lat:48.8566, lng:2.3522,  img:"https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80", tag:"🗼 Romance",   temp:"18°C", price:"From ₹65,000", popular:true },
  { id:"eu2", name:"Rome",           country:"Italy",       region:"Europe",        lat:41.9028, lng:12.4964, img:"https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&q=80", tag:"🏛 History",   temp:"20°C", price:"From ₹58,000", popular:true },
  { id:"eu3", name:"Barcelona",      country:"Spain",       region:"Europe",        lat:41.3851, lng:2.1734,  img:"https://images.unsplash.com/photo-1562883676-8c7feb83f09b?w=600&q=80", tag:"🎨 Art",        temp:"22°C", price:"From ₹62,000" },
  { id:"eu4", name:"Amsterdam",      country:"Netherlands", region:"Europe",        lat:52.3676, lng:4.9041,  img:"https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=600&q=80", tag:"🌷 Canals",    temp:"16°C", price:"From ₹60,000" },
  { id:"eu5", name:"Santorini",      country:"Greece",      region:"Europe",        lat:36.3932, lng:25.4615, img:"https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&q=80", tag:"🌊 Scenic",    temp:"25°C", price:"From ₹68,000" },
  { id:"eu6", name:"London",         country:"UK",          region:"Europe",        lat:51.5074, lng:-0.1278, img:"https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&q=80", tag:"🎡 Iconic",    temp:"14°C", price:"From ₹70,000" },
  { id:"eu7", name:"Zurich",         country:"Switzerland", region:"Europe",        lat:47.3769, lng:8.5417,  img:"https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=600&q=80", tag:"🏔 Alpine",    temp:"12°C", price:"From ₹82,000" },
  { id:"eu8", name:"Prague",         country:"Czech Republic",region:"Europe",      lat:50.0755, lng:14.4378, img:"https://images.unsplash.com/photo-1541849546-216549ae216d?w=600&q=80", tag:"🏰 Fairytale", temp:"14°C", price:"From ₹48,000" },

  // Americas
  { id:"a1",  name:"New York",       country:"USA",         region:"Americas",      lat:40.7128, lng:-74.0060, img:"https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&q=80", tag:"🗽 Iconic",   temp:"15°C", price:"From ₹72,000", popular:true },
  { id:"a2",  name:"Miami",          country:"USA",         region:"Americas",      lat:25.7617, lng:-80.1918, img:"https://images.unsplash.com/photo-1514214246283-d427a95c5d2f?w=600&q=80", tag:"🏖 Vibes",    temp:"28°C", price:"From ₹68,000" },
  { id:"a3",  name:"Maldives",       country:"Maldives",    region:"South Asia",    lat:3.2028,  lng:73.2207,  img:"https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=600&q=80", tag:"🏝 Paradise",  temp:"30°C", price:"From ₹85,000", popular:true },
  { id:"a4",  name:"Rio de Janeiro", country:"Brazil",      region:"Americas",      lat:-22.9068, lng:-43.1729, img:"https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=600&q=80", tag:"🎉 Carnival",  temp:"26°C", price:"From ₹80,000" },

  // Africa & others
  { id:"af1", name:"Cape Town",      country:"South Africa",region:"Africa",        lat:-33.9249, lng:18.4241, img:"https://images.unsplash.com/photo-1576485375217-d6a95e34d043?w=600&q=80", tag:"🌍 Wild",      temp:"20°C", price:"From ₹58,000" },
  { id:"af2", name:"Marrakech",      country:"Morocco",     region:"Africa",        lat:31.6295, lng:-7.9811,  img:"https://images.unsplash.com/photo-1489493887464-892be6d1daae?w=600&q=80", tag:"🪔 Exotic",    temp:"28°C", price:"From ₹42,000" },
];

const REGIONS = ["All", "South Asia", "Southeast Asia", "East Asia", "Middle East", "Europe", "Americas", "Africa"];

/* ── MAP FLYTO ── */
function MapFlyTo({ center, zoom }) {
  const map = useMap();
  useEffect(() => { map.flyTo(center, zoom, { duration: 1.5 }); }, [center, zoom]);
  return null;
}

/* ── PER-CATEGORY CARD RENDERERS (share ResultCard chrome) ── */
function renderFlightCard(item, { onReview, onBook }) {
  const tint = CATEGORY_TINT.flight;
  return (
    <ResultCard
      key={item.id}
      imageSrc={item.img}
      imageAlt={item.airline}
      imageHeight="h-32"
      tint={tint}
      badge={
        <span className="text-[10px] font-bold bg-white/15 backdrop-blur text-white px-2 py-0.5 rounded-full">
          {item.airline} · {item.flight}
        </span>
      }
      overlay={
        <div className="flex items-end justify-between text-white">
          <div><div className="text-xl font-bold">{item.from}</div><div className="text-[10px] text-white/70">{item.dep}</div></div>
          <div className="text-center px-2 text-[10px] text-white/60">
            {item.stops}
            <div className="border-t border-white/30 mt-1 w-10 mx-auto" />
            {item.duration}
          </div>
          <div className="text-right"><div className="text-xl font-bold">{item.to}</div><div className="text-[10px] text-white/70">{item.arr}</div></div>
        </div>
      }
      price={item.price}
      ratingValue={item.rating}
      ctaLabel="Book"
      onReview={() => onReview(item)}
      onBook={() => onBook(item)}
    />
  );
}

function renderTrainCard(item, { onReview, onBook }) {
  const tint = CATEGORY_TINT.train;
  return (
    <ResultCard
      key={item.id}
      imageSrc={item.img}
      imageAlt={item.name}
      imageHeight="h-28"
      tint={tint}
      overlay={
        <div className="flex items-end justify-between text-white">
          <div><div className="font-bold text-sm">{item.name}</div><div className="text-[10px] text-white/70">{item.number} · {item.class}</div></div>
          <div className="text-right text-[10px] text-white/70"><div>{item.dep} → {item.arr}</div><div className="font-semibold text-xs text-white">{item.duration}</div></div>
        </div>
      }
      price={item.price}
      ratingValue={item.rating}
      metaText={`${item.from} → ${item.to}`}
      ctaLabel="Book Seat"
      onReview={() => onReview(item)}
      onBook={() => onBook(item)}
    />
  );
}

function renderHotelCard(item, { onReview, onBook }) {
  const tint = CATEGORY_TINT.hotel;
  return (
    <ResultCard
      key={item.id}
      imageSrc={item.img}
      imageAlt={item.name}
      imageHeight="h-40"
      tint={tint}
      badge={<span className={`text-[10px] font-bold backdrop-blur text-white px-2 py-0.5 rounded-full ${tint.badgeBg}`}>{item.type}</span>}
      overlay={
        <div className="flex items-end justify-between">
          <div>
            <div className="font-bold text-white text-sm leading-tight">{item.name}</div>
            <div className="text-[10px] text-white/70 flex items-center gap-1 mt-0.5"><MapPin className="h-2.5 w-2.5" />{item.loc}</div>
          </div>
          <span className="flex items-center gap-1 text-status-risk font-bold text-xs bg-black/50 backdrop-blur px-2 py-0.5 rounded-lg"><Star className="h-3 w-3 fill-status-risk" />{item.rating}</span>
        </div>
      }
      price={item.price}
      priceLabel="from"
      ctaLabel="Reserve"
      onReview={() => onReview(item)}
      onBook={() => onBook(item)}
    />
  );
}

function renderHostelCard(item, { onReview, onBook }) {
  const tint = CATEGORY_TINT.hostel;
  return (
    <ResultCard
      key={item.id}
      imageSrc={item.img}
      imageAlt={item.name}
      imageHeight="h-32"
      tint={tint}
      badge={<span className={`text-[10px] font-bold text-white px-2 py-0.5 rounded-full backdrop-blur ${tint.badgeBg}`}>{item.vibe}</span>}
      overlay={
        <div>
          <div className="font-bold text-white text-sm">{item.name}</div>
          <div className="text-[10px] text-white/70 flex items-center gap-1"><MapPin className="h-2.5 w-2.5" />{item.loc}</div>
        </div>
      }
      price={item.price}
      ratingValue={item.rating}
      metaText={item.beds}
      ctaLabel="Book Bed"
      onReview={() => onReview(item)}
      onBook={() => onBook(item)}
    />
  );
}

function renderActivityCard(item, { onReview, onBook }) {
  const tint = CATEGORY_TINT.activity;
  return (
    <ResultCard
      key={item.id}
      imageSrc={item.img}
      imageAlt={item.name}
      imageHeight="h-40"
      tint={tint}
      badge={<span className="text-[10px] font-bold bg-white/15 backdrop-blur text-white px-2 py-0.5 rounded-full border border-white/15">{item.tag}</span>}
      overlay={
        <div>
          <div className="font-bold text-white text-sm mb-0.5 leading-tight">{item.name}</div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] text-white/70"><MapPin className="h-2.5 w-2.5" />{item.loc}<Clock className="h-2.5 w-2.5 ml-1" />{item.duration}</div>
          </div>
        </div>
      }
      price={item.price}
      ratingValue={item.rating}
      metaText="Instant confirmation"
      ctaLabel="Book"
      onReview={() => onReview(item)}
      onBook={() => onBook(item)}
    />
  );
}

const CARD_RENDERERS = {
  flights: renderFlightCard,
  trains: renderTrainCard,
  hotels: renderHotelCard,
  hostels: renderHostelCard,
  activities: renderActivityCard,
};

/* ── MAIN ── */
export default function BookingSystem() {
  const { savedDestinations, toggleSaved, confirmedBookings } = useBooking();
  const [activeTab, setActiveTab] = useState("flights");
  const [selectedItemForReview, setSelectedItemForReview] = useState(null);
  const [bookingModal, setBookingModal] = useState(null); // { item, category }
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [viewMode, setViewMode] = useState("grid");
  const [mapCenter, setMapCenter] = useState([20, 78]);
  const [mapZoom, setMapZoom] = useState(4);
  const [selectedDest, setSelectedDest] = useState(null);
  const [showAllDests, setShowAllDests] = useState(false);
  const [aiInsights, setAiInsights] = useState([]);
  const [loadingInsights, setLoadingInsights] = useState(true);
  const [packageDest, setPackageDest] = useState(null);
  const [heroIndex, setHeroIndex] = useState(0);

  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");
  const [travelDate, setTravelDate] = useState("2026-11-14");
  const [guestCount, setGuestCount] = useState(1);
  const destinationsRef = useRef(null);
  const heroRef = useRef(null);

  const filteredDests = useMemo(() => {
    let d = ALL_DESTINATIONS;
    if (selectedRegion !== "All") d = d.filter(x => x.region === selectedRegion);
    if (searchQuery.trim()) d = d.filter(x =>
      x.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      x.country.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return d;
  }, [selectedRegion, searchQuery]);

  const displayDests = showAllDests ? filteredDests : filteredDests.slice(0, 12);

  const currentResults = RESULTS[activeTab] || [];

  const handleDestClick = (d) => {
    setPackageDest(d);
  };

  const handleSearch = () => {
    const query = toCity.trim() || fromCity.trim();
    setSearchQuery(query);
    destinationsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const loadInsights = async () => {
    setLoadingInsights(true);
    try {
      const insights = await getAITravelInsights(confirmedBookings);
      setAiInsights(insights);
    } catch {
      setAiInsights([]);
    } finally {
      setLoadingInsights(false);
    }
  };

  useEffect(() => { loadInsights(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleInsightClick = (insight) => {
    if (insight.category && TABS.some(t => t.id === insight.category)) {
      setActiveTab(insight.category);
    }
    if (insight.destinationHint) {
      setSearchQuery(insight.destinationHint);
    }
    destinationsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const popularDests = useMemo(() => {
    const popular = ALL_DESTINATIONS.filter(d => d.popular);
    if (confirmedBookings.length === 0) return popular;
    const bookedWords = confirmedBookings.map(b => (b.loc || b.itemName || "").toLowerCase()).join(" ");
    return [...popular].sort((a, b) => {
      const aMatch = bookedWords.includes(a.country.toLowerCase()) ? 1 : 0;
      const bMatch = bookedWords.includes(b.country.toLowerCase()) ? 1 : 0;
      return bMatch - aMatch;
    });
  }, [confirmedBookings]);

  useEffect(() => {
    if (popularDests.length < 2) return;
    const id = setInterval(() => setHeroIndex(i => (i + 1) % popularDests.length), 7000);
    return () => clearInterval(id);
  }, [popularDests.length]);

  const heroDest = popularDests[heroIndex % Math.max(1, popularDests.length)];

  return (
    <div className="min-h-screen bg-page-soft">

      {/* ── HERO ── */}
      <div ref={heroRef}>
      <DarkPromoBanner
        className="mb-8"
        eyebrow={<><Sparkles className="h-3.5 w-3.5 text-brand" />AI-Powered · {ALL_DESTINATIONS.length}+ Destinations · One Platform</>}
        heading={<>Your Next Journey<br /><span className="text-brand">Starts Here</span></>}
        subtext={heroDest && (
          <AnimatePresence mode="wait">
            <motion.button
              key={heroDest.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              onClick={() => setPackageDest(heroDest)}
              className="inline-flex items-center gap-2 text-white/70 hover:text-white text-xs font-medium transition cursor-pointer"
            >
              <span className="text-brand">Trending now</span> · {heroDest.tag} {heroDest.name}, {heroDest.country} · {heroDest.price}
            </motion.button>
          </AnimatePresence>
        )}
      >
        {/* Booking Tabs */}
        <div className="flex justify-center mb-5 overflow-x-auto">
          <div className="flex items-center gap-1 bg-white/8 border border-white/12 p-1 rounded-md">
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSelectedItemForReview(null); }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-sm text-xs font-bold whitespace-nowrap transition-all ${activeTab === tab.id ? "bg-white text-ink shadow-sm" : "text-white/60 hover:text-white hover:bg-white/10"}`}>
                  <Icon className="h-3.5 w-3.5" />{tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Bar */}
        <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
          className="max-w-4xl mx-auto">
          <div className="bg-white/8 border border-white/12 rounded-md p-3 grid grid-cols-1 md:grid-cols-[1fr_1fr_auto_auto_auto] gap-2">
            <Autocomplete value={fromCity} onChange={setFromCity} placeholder="From (City / Airport)" icon={MapPin} dark />
            <Autocomplete value={toCity} onChange={setToCity} placeholder="To (Destination)" icon={MapPin} dark />
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
              <input type="date" value={travelDate} onChange={e => setTravelDate(e.target.value)}
                className="bg-white/8 border border-white/10 rounded-sm pl-9 pr-3 py-3 text-white text-sm outline-none focus:border-brand/50 transition [color-scheme:dark]" />
            </div>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
              <select value={guestCount} onChange={e => setGuestCount(Number(e.target.value))}
                className="bg-white/8 border border-white/10 rounded-sm pl-9 pr-3 py-3 text-white text-sm outline-none appearance-none focus:border-brand/50 transition [color-scheme:dark]">
                {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} {n===1?"Person":"People"}</option>)}
              </select>
            </div>
            <button onClick={handleSearch} className="px-6 py-3 rounded-sm bg-brand text-brand-ink font-bold text-sm hover:brightness-105 shadow-sm flex items-center gap-2 justify-center whitespace-nowrap">
              <Search className="h-4 w-4" /> Search
            </button>
          </div>
        </motion.div>

        <div className="flex items-center justify-center gap-6 mt-5 flex-wrap">
          {[{icon:Zap,label:"Instant Confirmation"},{icon:Shield,label:"100% Secure"},{icon:TrendingUp,label:"Best Price Guarantee"}].map(b => (
            <div key={b.label} className="flex items-center gap-1.5 text-white/50 text-xs font-medium">
              <b.icon className="h-3.5 w-3.5 text-brand" />{b.label}
            </div>
          ))}
        </div>
      </DarkPromoBanner>
      </div>

      <div className="space-y-10">

        {/* ── AI SUGGESTIONS ── */}
        <div>
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-sm bg-brand flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-brand-ink" />
              </div>
              <h2 className="font-display font-medium text-lg text-ink">AI Travel Insights</h2>
              <span className="text-[10px] font-bold text-status-resolved border border-status-resolved/20 bg-status-resolved-dim px-2 py-0.5 rounded-full">Recoup AI</span>
            </div>
            <button
              onClick={loadInsights}
              disabled={loadingInsights}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-faint hover:text-brand transition disabled:opacity-50"
            >
              <RotateCw className={`h-3.5 w-3.5 ${loadingInsights ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {(loadingInsights ? Array.from({ length: 8 }) : aiInsights).map((s, i) => (
              <motion.div key={s?.text || i} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay: i*0.06 }}
                onClick={() => s && handleInsightClick(s)}
                className="bg-surface rounded-md border border-border p-4 shadow-sm hover:border-brand/30 hover:shadow-md transition-all cursor-pointer group">
                {s ? (
                  <>
                    <div className="text-xl mb-2">{s.icon}</div>
                    <p className="text-xs text-ink-dim leading-relaxed group-hover:text-ink transition">{s.text}</p>
                  </>
                ) : (
                  <div className="animate-pulse space-y-2">
                    <div className="h-5 w-5 rounded bg-surface-sunk" />
                    <div className="h-3 w-full rounded bg-surface-sunk" />
                    <div className="h-3 w-2/3 rounded bg-surface-sunk" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── RESULTS ── */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-medium text-xl text-ink">
              {TABS.find(t => t.id === activeTab)?.label} — Top Picks
            </h2>
            <span className="text-xs text-ink-faint">{currentResults.length} results · AI-sorted</span>
          </div>
          <div className={`grid gap-6 ${selectedItemForReview ? "lg:grid-cols-[1fr_380px]" : ""}`}>
            <div className={`grid gap-4 ${
              selectedItemForReview
                ? "grid-cols-1"
                : activeTab === "flights" || activeTab === "trains"
                ? "grid-cols-1 xl:grid-cols-2"
                : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
            }`}>
              {currentResults.map(item => CARD_RENDERERS[activeTab](item, {
                onReview: setSelectedItemForReview,
                onBook: (it) => setBookingModal({ item: it, category: activeTab }),
              }))}
            </div>
            <AnimatePresence>
              {selectedItemForReview && (
                <motion.div
                  key={selectedItemForReview.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="lg:sticky lg:top-6"
                >
                  <Reviews
                    itemName={selectedItemForReview.name || selectedItemForReview.title}
                    onClose={() => setSelectedItemForReview(null)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── DESTINATIONS: SEARCH + FILTER + GRID/MAP ── */}
        <div ref={destinationsRef}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="font-display font-medium text-xl text-ink flex items-center gap-2">
                <Globe className="h-5 w-5 text-brand" /> {ALL_DESTINATIONS.length}+ Destinations Worldwide
              </h2>
              <p className="text-xs text-ink-dim mt-0.5">Handpicked from India and across the globe</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-faint" />
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search destination…"
                  className="pl-9 pr-3 py-2 rounded-sm bg-surface-sunk border border-border text-xs text-ink focus:outline-none focus:border-brand/50 transition w-44" />
                {searchQuery && <button onClick={() => setSearchQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink"><X className="h-3 w-3" /></button>}
              </div>
              {/* View toggle */}
              <div className="flex items-center gap-1 bg-surface-sunk p-1 rounded-sm border border-border">
                <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded-sm transition ${viewMode==="grid" ? "bg-surface shadow-sm text-ink" : "text-ink-dim hover:text-ink"}`}><List className="h-3.5 w-3.5" /></button>
                <button onClick={() => setViewMode("map")} className={`p-1.5 rounded-sm transition ${viewMode==="map" ? "bg-surface shadow-sm text-ink" : "text-ink-dim hover:text-ink"}`}><Map className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          </div>

          {/* Region Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap mb-5">
            {REGIONS.map(r => (
              <button key={r} onClick={() => setSelectedRegion(r)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${selectedRegion === r ? "bg-ink text-page border-ink shadow-sm" : "bg-surface border-border text-ink-dim hover:text-ink hover:border-border-strong"}`}>
                {r}
              </button>
            ))}
            <span className="text-xs text-ink-faint ml-1">{filteredDests.length} shown</span>
          </div>

          {/* Grid View */}
          {viewMode === "grid" && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {displayDests.map((d, i) => (
                  <motion.div key={d.id} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: Math.min(i*0.04, 0.5) }}
                    className="group relative rounded-md overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                    style={{ aspectRatio:"3/4" }} onClick={() => handleDestClick(d)}>
                    <img src={d.img} alt={d.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                    <button onClick={e => { e.stopPropagation(); toggleSaved(d.id); }}
                      className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/30 backdrop-blur flex items-center justify-center hover:bg-black/50 transition">
                      <Heart className={`h-3.5 w-3.5 ${savedDestinations.includes(d.id) ? "fill-status-disrupted text-status-disrupted" : "text-white"}`} />
                    </button>
                    {d.popular && <div className="absolute top-2 left-2 text-[9px] font-bold bg-brand text-brand-ink px-1.5 py-0.5 rounded-full">🔥 Popular</div>}
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <div className="text-[9px] font-semibold text-white/70 mb-0.5">{d.tag}</div>
                      <div className="text-sm font-bold text-white leading-tight">{d.name}</div>
                      <div className="text-[9px] text-white/60">{d.country} · {d.temp}</div>
                      <div className="text-[10px] font-bold text-brand mt-0.5">{d.price}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
              {filteredDests.length > 12 && (
                <div className="text-center mt-6">
                  <button onClick={() => setShowAllDests(!showAllDests)}
                    className="px-8 py-3 rounded-md border-2 border-border hover:border-ink text-ink font-semibold text-sm transition-all hover:bg-surface-sunk">
                    {showAllDests ? "Show Less" : `Show All ${filteredDests.length} Destinations`} <ChevronRight className={`inline h-4 w-4 ml-1 transition-transform ${showAllDests ? "rotate-90" : ""}`} />
                  </button>
                </div>
              )}
            </>
          )}

          {/* Map View */}
          {viewMode === "map" && (
            <div className="relative rounded-md overflow-hidden border border-border shadow-sm" style={{ height: "600px" }}>
              <MapContainer center={mapCenter} zoom={mapZoom} className="h-full w-full" zoomControl={true}>
                <TileLayer
                  attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapFlyTo center={mapCenter} zoom={mapZoom} />
                {filteredDests.map(d => (
                  <Marker key={d.id} position={[d.lat, d.lng]} eventHandlers={{ click: () => { setSelectedDest(d); setMapCenter([d.lat, d.lng]); setMapZoom(10); } }}>
                    <Popup>
                      <div className="text-center min-w-[160px]">
                        <img src={d.img} alt={d.name} className="w-full h-20 object-cover rounded-lg mb-2" />
                        <div className="font-bold text-sm">{d.name}</div>
                        <div className="text-xs text-gray-500">{d.country} · {d.temp}</div>
                        <div className="text-xs font-bold mt-1" style={{ color: "#a9791f" }}>{d.price}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">{d.tag}</div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
              {/* Map Legend */}
              <div className="absolute bottom-4 left-4 bg-surface/95 backdrop-blur rounded-sm border border-border p-3 shadow-md">
                <div className="text-xs font-bold text-ink mb-1">{filteredDests.length} destinations shown</div>
                <div className="text-[10px] text-ink-dim">Click any pin for details</div>
              </div>
            </div>
          )}
        </div>

        {/* ── BOTTOM CTA ── */}
        <div className="pb-8">
          <DarkPromoBanner
            contentClassName="px-8 md:px-12 py-12 text-center"
            heading={<>Every Booking Protected<br />by <span className="text-brand">Recoup AI</span></>}
            subtext="Flight delayed? Hotel changed? Our AI recovers your entire itinerary automatically at zero hassle."
          >
            <button
              onClick={() => heroDest ? setPackageDest(heroDest) : heroRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-sm bg-brand text-brand-ink font-bold hover:brightness-105 shadow-sm"
            >
              Plan Your Protected Trip <ArrowRight className="h-4 w-4" />
            </button>
          </DarkPromoBanner>
        </div>
      </div>

      {/* Booking Modal */}
      {bookingModal && (
        <BookingModal
          item={bookingModal.item}
          category={bookingModal.category}
          onClose={() => setBookingModal(null)}
        />
      )}

      {/* Destination Bundle View */}
      {packageDest && (
        <DestinationPackageView dest={packageDest} onClose={() => setPackageDest(null)} />
      )}
    </div>
  );
}
