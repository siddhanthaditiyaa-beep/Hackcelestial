import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, MapPin, Calendar, Users, Star, Plane, Building,
  MessageSquare, Train, Tent, Compass, Sparkles, ArrowRight,
  Clock, Zap, Shield, TrendingUp, ChevronRight, Heart
} from "lucide-react";
import Reviews from "./Reviews";

/* ─── DATA ─────────────────────────────────────────────────── */
const DESTINATIONS = [
  { id:"d1", name:"Bali, Indonesia",   img:"https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80", tag:"🌴 Tropical", temp:"28°C" },
  { id:"d2", name:"Paris, France",     img:"https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80", tag:"🗼 Romance",  temp:"18°C" },
  { id:"d3", name:"Tokyo, Japan",      img:"https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80", tag:"⛩ Culture",  temp:"22°C" },
  { id:"d4", name:"Dubai, UAE",        img:"https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80", tag:"✨ Luxury",   temp:"35°C" },
  { id:"d5", name:"Kerala, India",     img:"https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=800&q=80", tag:"🌿 Nature",   temp:"30°C" },
  { id:"d6", name:"Santorini, Greece", img:"https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80", tag:"🌊 Scenic",   temp:"25°C" },
];

const AI_SUGGESTIONS = [
  { icon:"✈️", text:"Based on your travel history, you'll love Bali in November — perfect weather, off-peak pricing." },
  { icon:"🏨", text:"Book accommodation 3+ nights for a 15% discount. Hotels in Ubud have high occupancy this week." },
  { icon:"🚄", text:"Train travel to Kerala is 40% cheaper than flights and scenic. Seat availability drops fast." },
  { icon:"🎭", text:"The Uluwatu Kecak Fire Dance is sold out Nov 16 — book your Day 2 activity slot now." },
];

const TABS = [
  { id:"flights",    label:"Flights",    icon: Plane },
  { id:"trains",     label:"Trains",     icon: Train },
  { id:"hotels",     label:"Hotels",     icon: Building },
  { id:"hostels",    label:"Hostels",    icon: Tent },
  { id:"activities", label:"Activities", icon: Compass },
];

const RESULTS = {
  flights: [
    { id:"f1", airline:"Air Garuda",  flight:"GA-865", from:"BOM", to:"DPS", dep:"06:15", arr:"14:40", duration:"8h 25m", stops:"1 Stop",   price:"₹24,500", rating:4.2, img:"https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&q=80" },
    { id:"f2", airline:"SkyJet",      flight:"SJ-410", from:"BOM", to:"DPS", dep:"22:30", arr:"14:15", duration:"11h 45m",stops:"2 Stops",  price:"₹18,200", rating:3.8, img:"https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=600&q=80" },
    { id:"f3", airline:"Vistara",     flight:"UK-101", from:"DEL", to:"DXB", dep:"10:00", arr:"12:30", duration:"3h 30m", stops:"Non-stop", price:"₹28,900", rating:4.7, img:"https://images.unsplash.com/photo-1542296332-2e4473faf563?w=600&q=80" },
    { id:"f4", airline:"IndiGo",      flight:"6E-205", from:"BOM", to:"COK", dep:"07:45", arr:"09:55", duration:"2h 10m", stops:"Non-stop", price:"₹6,800",  rating:4.1, img:"https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600&q=80" },
  ],
  trains: [
    { id:"t1", name:"Rajdhani Express",   number:"12951", from:"Mumbai", to:"Delhi",     dep:"16:35", arr:"08:35",  duration:"16h",    class:"1A/2A/3A", price:"₹2,450", rating:4.3, img:"https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=600&q=80" },
    { id:"t2", name:"Vande Bharat",        number:"22439", from:"Mumbai", to:"Pune",      dep:"07:10", arr:"10:40",  duration:"3h 30m", class:"Executive/Chair", price:"₹1,120", rating:4.8, img:"https://images.unsplash.com/photo-1553701743-7e9b2a88e3fd?w=600&q=80" },
    { id:"t3", name:"Kerala Express",      number:"16605", from:"Mumbai", to:"Trivandrum",dep:"11:15", arr:"06:30",  duration:"19h",    class:"SL/3A/2A", price:"₹1,890", rating:4.0, img:"https://images.unsplash.com/photo-1609667083964-f3dbecfd1516?w=600&q=80" },
    { id:"t4", name:"Shatabdi Express",    number:"12017", from:"Delhi",  to:"Dehradun",  dep:"06:45", arr:"12:05",  duration:"5h 20m", class:"CC/Executive", price:"₹980",   rating:4.4, img:"https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=80" },
  ],
  hotels: [
    { id:"h1", name:"Ubud Canopy Retreat",       loc:"Ubud, Bali",       price:"₹8,500/night",  rating:4.8, amenities:["Pool","Spa","WiFi"], type:"Luxury Villa",   img:"https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80" },
    { id:"h2", name:"Seminyak Beach Resort",      loc:"Seminyak, Bali",   price:"₹12,000/night", rating:4.5, amenities:["Beach","Bar","WiFi"], type:"5★ Resort",      img:"https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80" },
    { id:"h3", name:"Le Méridien Paris Étoile",   loc:"Paris, France",    price:"₹18,200/night", rating:4.9, amenities:["Rooftop","Spa","Pool"],type:"Boutique Hotel", img:"https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80" },
    { id:"h4", name:"Marari Beach Resort",        loc:"Kerala, India",    price:"₹5,400/night",  rating:4.6, amenities:["Ayurveda","Beach","Yoga"],type:"Heritage Resort",img:"https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80" },
  ],
  hostels: [
    { id:"hs1", name:"The Bali Backpacker Hub", loc:"Kuta, Bali",      price:"₹1,200/night", rating:4.3, beds:"4-bed dorm", img:"https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80", vibe:"Party Scene" },
    { id:"hs2", name:"Wanderers Tokyo",         loc:"Shinjuku, Tokyo", price:"₹1,800/night", rating:4.7, beds:"6-bed dorm", img:"https://images.unsplash.com/photo-1540541338537-1d4d9e8f8b0f?w=800&q=80", vibe:"Social & Clean" },
    { id:"hs3", name:"Paris Budget Nest",       loc:"Montmartre, Paris",price:"₹2,100/night",rating:4.1, beds:"Private room",img:"https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=800&q=80", vibe:"Artsy Neighbourhood" },
    { id:"hs4", name:"Kerala River Hostel",     loc:"Alleppey, Kerala", price:"₹900/night",  rating:4.5, beds:"4-bed dorm", img:"https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80", vibe:"Backpacker's Chill" },
  ],
  activities: [
    { id:"a1", name:"Mount Batur Sunrise Trek",       loc:"Bali",    price:"₹3,200/person", duration:"6h",  rating:4.9, tag:"🌄 Adventure",  img:"https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=800&q=80" },
    { id:"a2", name:"Uluwatu Kecak Fire Dance",        loc:"Bali",    price:"₹1,500/person", duration:"2h",  rating:4.8, tag:"🎭 Culture",    img:"https://images.unsplash.com/photo-1604928141064-207cea6f571f?w=800&q=80" },
    { id:"a3", name:"Eiffel Tower Skip-the-Line Tour", loc:"Paris",   price:"₹4,800/person", duration:"3h",  rating:4.6, tag:"🗼 Sightseeing", img:"https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&q=80" },
    { id:"a4", name:"Kerala Backwaters Houseboat",     loc:"Kerala",  price:"₹8,000/couple", duration:"24h", rating:4.7, tag:"🚢 Experience",  img:"https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80" },
    { id:"a5", name:"Tsukiji Fish Market Tour",         loc:"Tokyo",   price:"₹2,600/person", duration:"3h",  rating:4.5, tag:"🍣 Food & Culture",img:"https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80" },
    { id:"a6", name:"Desert Safari & Dune Bashing",    loc:"Dubai",   price:"₹6,500/person", duration:"5h",  rating:4.8, tag:"🏜 Adventure",   img:"https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80" },
  ],
};

/* ─── SUB-COMPONENTS ────────────────────────────────────────── */
function FlightCard({ item, onReview }) {
  return (
    <motion.div whileHover={{ y:-3 }} className="bg-page rounded-2xl border border-border shadow-sm overflow-hidden group cursor-pointer">
      <div className="relative h-36 overflow-hidden">
        <img src={item.img} alt={item.airline} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
        <div className="absolute inset-0 p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold bg-white/20 backdrop-blur text-white px-2.5 py-1 rounded-full">{item.airline} · {item.flight}</span>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${item.stops === "Non-stop" ? "bg-teal text-slate-900" : "bg-amber-dim/80 text-amber backdrop-blur"}`}>{item.stops}</span>
          </div>
          <div className="flex items-end justify-between text-white">
            <div>
              <div className="text-2xl font-bold font-display">{item.from}</div>
              <div className="text-xs text-white/70">{item.dep}</div>
            </div>
            <div className="text-center px-3">
              <div className="text-xs text-white/70 mb-1">{item.duration}</div>
              <div className="relative flex items-center gap-1">
                <div className="h-px w-12 bg-white/40" />
                <Plane className="h-3 w-3 text-white" />
                <div className="h-px w-12 bg-white/40" />
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold font-display">{item.to}</div>
              <div className="text-xs text-white/70">{item.arr}</div>
            </div>
          </div>
        </div>
      </div>
      <div className="px-4 py-3 flex items-center justify-between">
        <div>
          <div className="font-display font-bold text-xl text-ink">{item.price}</div>
          <div className="flex items-center gap-1 text-amber text-xs font-semibold mt-0.5">
            <Star className="h-3 w-3 fill-amber" /> {item.rating} · per person
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onReview(item)} className="px-3 py-1.5 rounded-xl border border-border text-xs font-semibold text-ink-dim hover:text-ink hover:bg-surface-sunk transition">Reviews</button>
          <button className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-coral to-pink text-white text-xs font-bold hover:brightness-110 transition shadow-sm">Book Now</button>
        </div>
      </div>
    </motion.div>
  );
}

function TrainCard({ item, onReview }) {
  return (
    <motion.div whileHover={{ y:-3 }} className="bg-page rounded-2xl border border-border shadow-sm overflow-hidden group cursor-pointer">
      <div className="relative h-32 overflow-hidden">
        <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 to-black/20" />
        <div className="absolute inset-0 p-4 flex items-end justify-between text-white">
          <div>
            <div className="font-bold text-base">{item.name}</div>
            <div className="text-xs text-white/70">{item.number} · {item.class}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-white/70">{item.dep} → {item.arr}</div>
            <div className="text-sm font-semibold">{item.duration}</div>
          </div>
        </div>
      </div>
      <div className="px-4 py-3 flex items-center justify-between">
        <div>
          <div className="font-display font-bold text-xl text-ink">{item.price}</div>
          <div className="flex items-center gap-1 text-amber text-xs font-semibold mt-0.5">
            <Star className="h-3 w-3 fill-amber" /> {item.rating} · {item.from} → {item.to}
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onReview(item)} className="px-3 py-1.5 rounded-xl border border-border text-xs font-semibold text-ink-dim hover:text-ink hover:bg-surface-sunk transition">Reviews</button>
          <button className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-blue to-teal text-white text-xs font-bold hover:brightness-110 transition shadow-sm">Book Seat</button>
        </div>
      </div>
    </motion.div>
  );
}

function HotelCard({ item, onReview }) {
  return (
    <motion.div whileHover={{ y:-3 }} className="bg-page rounded-2xl border border-border shadow-sm overflow-hidden group cursor-pointer">
      <div className="relative h-44 overflow-hidden">
        <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute top-3 left-3">
          <span className="text-xs font-bold bg-blue/90 backdrop-blur text-white px-2.5 py-1 rounded-full">{item.type}</span>
        </div>
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
          <div>
            <div className="font-bold text-white text-base leading-tight">{item.name}</div>
            <div className="text-xs text-white/70 flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3" />{item.loc}</div>
          </div>
          <span className="flex items-center gap-1 text-amber font-bold text-sm bg-black/50 backdrop-blur px-2 py-0.5 rounded-lg">
            <Star className="h-3.5 w-3.5 fill-amber" />{item.rating}
          </span>
        </div>
      </div>
      <div className="px-4 py-3">
        <div className="flex flex-wrap gap-1.5 mb-3">
          {item.amenities.map(a => (
            <span key={a} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-dim/30 text-teal border border-teal/20">{a}</span>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-ink-faint">Starting from</div>
            <div className="font-display font-bold text-xl text-ink">{item.price}</div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => onReview(item)} className="px-3 py-1.5 rounded-xl border border-border text-xs font-semibold text-ink-dim hover:text-ink hover:bg-surface-sunk transition">Reviews</button>
            <button className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber to-coral text-white text-xs font-bold hover:brightness-110 transition shadow-sm">Reserve</button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function HostelCard({ item, onReview }) {
  return (
    <motion.div whileHover={{ y:-3 }} className="bg-page rounded-2xl border border-border shadow-sm overflow-hidden group cursor-pointer">
      <div className="relative h-36 overflow-hidden">
        <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <div className="absolute top-3 left-3">
          <span className="text-[11px] font-bold bg-pink/90 text-white px-2.5 py-1 rounded-full backdrop-blur">{item.vibe}</span>
        </div>
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
          <div>
            <div className="font-bold text-white">{item.name}</div>
            <div className="text-xs text-white/70 flex items-center gap-1"><MapPin className="h-3 w-3" />{item.loc}</div>
          </div>
        </div>
      </div>
      <div className="px-4 py-3 flex items-center justify-between">
        <div>
          <div className="font-display font-bold text-xl text-ink">{item.price}</div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="flex items-center gap-1 text-amber text-xs font-semibold"><Star className="h-3 w-3 fill-amber" />{item.rating}</span>
            <span className="text-xs text-ink-faint">· {item.beds}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onReview(item)} className="px-3 py-1.5 rounded-xl border border-border text-xs font-semibold text-ink-dim hover:text-ink hover:bg-surface-sunk transition">Reviews</button>
          <button className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-pink to-coral text-white text-xs font-bold hover:brightness-110 transition shadow-sm">Book Bed</button>
        </div>
      </div>
    </motion.div>
  );
}

function ActivityCard({ item, onReview }) {
  return (
    <motion.div whileHover={{ y:-3 }} className="bg-page rounded-2xl border border-border shadow-sm overflow-hidden group cursor-pointer">
      <div className="relative h-44 overflow-hidden">
        <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
        <div className="absolute top-3 left-3">
          <span className="text-[11px] font-bold bg-white/20 backdrop-blur text-white px-2.5 py-1 rounded-full border border-white/20">{item.tag}</span>
        </div>
        <div className="absolute bottom-3 left-4 right-4">
          <div className="font-bold text-white text-base leading-tight mb-1">{item.name}</div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-white/70">
              <MapPin className="h-3 w-3" />{item.loc}
              <Clock className="h-3 w-3 ml-1" />{item.duration}
            </div>
            <span className="flex items-center gap-1 text-amber font-bold text-sm">
              <Star className="h-3.5 w-3.5 fill-amber" />{item.rating}
            </span>
          </div>
        </div>
      </div>
      <div className="px-4 py-3 flex items-center justify-between">
        <div>
          <div className="font-display font-bold text-lg text-ink">{item.price}</div>
          <div className="text-xs text-ink-faint">Instant confirmation</div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onReview(item)} className="px-3 py-1.5 rounded-xl border border-border text-xs font-semibold text-ink-dim hover:text-ink hover:bg-surface-sunk transition">Reviews</button>
          <button className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-teal to-blue text-white text-xs font-bold hover:brightness-110 transition shadow-sm">Book</button>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── MAIN COMPONENT ────────────────────────────────────────── */
export default function BookingSystem() {
  const [activeTab, setActiveTab] = useState("flights");
  const [selectedItemForReview, setSelectedItemForReview] = useState(null);
  const [searchFrom, setSearchFrom] = useState("");
  const [searchTo, setSearchTo] = useState("");
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [passengers, setPassengers] = useState("2");
  const [showResults, setShowResults] = useState(true);
  const [likedDests, setLikedDests] = useState(new Set());

  const handleSearch = (e) => {
    e.preventDefault();
    setShowResults(true);
  };

  const toggleLike = (id) => {
    setLikedDests(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const currentResults = RESULTS[activeTab] || [];

  return (
    <div className="min-h-screen bg-page-soft">

      {/* ── HERO / SEARCH SECTION ─────────────────────────────── */}
      <div className="relative overflow-hidden rounded-[2rem] mx-0 mb-8"
        style={{ background: "linear-gradient(135deg, #0b0f19 0%, #1a1040 50%, #0b1220 100%)" }}>
        {/* Animated orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-coral/20 rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-teal/15 rounded-full blur-3xl translate-y-1/2" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue/15 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />

        <div className="relative z-10 px-6 md:px-12 pt-12 pb-8">
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }} className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/15 text-white/80 text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
              <Sparkles className="h-3.5 w-3.5 text-amber" />
              AI-Powered · One Platform · Infinite Adventures
            </div>
            <h1 className="font-display font-extrabold text-white text-4xl md:text-5xl lg:text-6xl mb-3 tracking-tight">
              Your Next Journey<br />
              <span className="bg-gradient-to-r from-coral via-amber to-teal bg-clip-text text-transparent">Starts Here</span>
            </h1>
            <p className="text-white/60 text-base md:text-lg max-w-xl mx-auto">
              Flights · Trains · Hotels · Hostels · Activities — everything in one place, powered by AI resilience.
            </p>
          </motion.div>

          {/* Category Tabs */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md border border-white/15 p-1 rounded-2xl">
              {TABS.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setSelectedItemForReview(null); }}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === tab.id ? "bg-white text-slate-900 shadow-md" : "text-white/60 hover:text-white hover:bg-white/10"}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search Form */}
          <motion.form onSubmit={handleSearch} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
            className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-[1fr_1fr_auto_auto_auto] gap-2">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
              <input value={searchFrom} onChange={e => setSearchFrom(e.target.value)} placeholder={activeTab === "flights" ? "From (City/Airport)" : "From"}
                className="w-full bg-white/10 border border-white/10 rounded-xl pl-9 pr-3 py-3 text-white placeholder:text-white/40 text-sm outline-none focus:border-coral/50 focus:ring-1 focus:ring-coral/20 transition" />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-coral/70" />
              <input value={searchTo} onChange={e => setSearchTo(e.target.value)} placeholder={activeTab === "flights" ? "To (City/Airport)" : "Destination"}
                className="w-full bg-white/10 border border-white/10 rounded-xl pl-9 pr-3 py-3 text-white placeholder:text-white/40 text-sm outline-none focus:border-teal/50 focus:ring-1 focus:ring-teal/20 transition" />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
              <input type="date" value={checkin} onChange={e => setCheckin(e.target.value)}
                className="w-full bg-white/10 border border-white/10 rounded-xl pl-9 pr-3 py-3 text-white text-sm outline-none focus:border-blue/50 focus:ring-1 focus:ring-blue/20 transition [color-scheme:dark]" />
            </div>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
              <select value={passengers} onChange={e => setPassengers(e.target.value)}
                className="w-full bg-white/10 border border-white/10 rounded-xl pl-9 pr-3 py-3 text-white text-sm outline-none appearance-none focus:border-amber/50 transition [color-scheme:dark]">
                {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} {n===1?"Person":"People"}</option>)}
              </select>
            </div>
            <button type="submit"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-coral to-pink text-white font-bold text-sm hover:brightness-110 transition shadow-[0_4px_20px_-4px_rgba(255,79,94,0.5)] flex items-center gap-2 justify-center whitespace-nowrap">
              <Search className="h-4 w-4" /> Search
            </button>
          </motion.form>

          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-6 mt-6 flex-wrap">
            {[
              { icon: Zap,    label: "Instant Confirmation" },
              { icon: Shield, label: "100% Secure Payments" },
              { icon: TrendingUp, label: "Best Price Guarantee" },
            ].map(b => (
              <div key={b.label} className="flex items-center gap-1.5 text-white/50 text-xs font-medium">
                <b.icon className="h-3.5 w-3.5 text-teal" />
                {b.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-0 md:px-0 space-y-10">

        {/* ── AI SUGGESTIONS STRIP ──────────────────────────────── */}
        <div className="px-4 md:px-0">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-coral to-pink flex items-center justify-center shadow-[0_0_16px_rgba(255,79,94,0.4)]">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <h2 className="font-display font-bold text-lg text-ink">AI Travel Insights</h2>
            <span className="text-[10px] font-bold text-teal border border-teal/20 bg-teal-dim/20 px-2 py-0.5 rounded-full ml-1">Powered by Recoup AI</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {AI_SUGGESTIONS.map((s, i) => (
              <motion.div key={i} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay: i*0.1 }}
                className="bg-page rounded-2xl border border-border p-4 shadow-sm hover:border-coral/30 hover:shadow-[0_4px_20px_-8px_rgba(255,79,94,0.2)] transition-all cursor-pointer group">
                <div className="text-2xl mb-2">{s.icon}</div>
                <p className="text-xs text-ink-dim leading-relaxed group-hover:text-ink transition">{s.text}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── SEARCH RESULTS ────────────────────────────────────── */}
        {showResults && (
          <div className="px-4 md:px-0">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-xl text-ink">
                {TABS.find(t => t.id === activeTab)?.label} — Top Picks for You
              </h2>
              <span className="text-xs text-ink-faint font-medium">{currentResults.length} results · AI-sorted</span>
            </div>

            <div className="grid lg:grid-cols-[1fr_360px] gap-8">
              <div className={`grid gap-5 ${activeTab === "activities" ? "sm:grid-cols-2" : "grid-cols-1"}`}>
                {activeTab === "flights"    && currentResults.map(i => <FlightCard    key={i.id} item={i} onReview={setSelectedItemForReview} />)}
                {activeTab === "trains"     && currentResults.map(i => <TrainCard     key={i.id} item={i} onReview={setSelectedItemForReview} />)}
                {activeTab === "hotels"     && currentResults.map(i => <HotelCard     key={i.id} item={i} onReview={setSelectedItemForReview} />)}
                {activeTab === "hostels"    && currentResults.map(i => <HostelCard    key={i.id} item={i} onReview={setSelectedItemForReview} />)}
                {activeTab === "activities" && currentResults.map(i => <ActivityCard  key={i.id} item={i} onReview={setSelectedItemForReview} />)}
              </div>

              {/* Reviews Side Panel */}
              <div className="hidden lg:block">
                <AnimatePresence mode="wait">
                  {selectedItemForReview ? (
                    <motion.div key={selectedItemForReview.id} initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:20 }} className="sticky top-6">
                      <Reviews itemId={selectedItemForReview.id} itemName={selectedItemForReview.name || selectedItemForReview.title} />
                    </motion.div>
                  ) : (
                    <motion.div key="empty" className="sticky top-6 rounded-2xl border border-dashed border-border p-8 text-center flex flex-col items-center justify-center h-72">
                      <MessageSquare className="h-10 w-10 text-ink-faint/30 mb-3" />
                      <p className="text-sm font-medium text-ink-faint">Click "Reviews" on any card to read what fellow travelers say</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        )}

        {/* ── TRENDING DESTINATIONS ─────────────────────────────── */}
        <div className="px-4 md:px-0">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-bold text-xl text-ink">🌍 Trending Destinations</h2>
            <button className="flex items-center gap-1 text-xs font-semibold text-coral hover:underline">View All <ChevronRight className="h-3.5 w-3.5" /></button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {DESTINATIONS.map((d, i) => (
              <motion.div key={d.id} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.07 }}
                className="group relative rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-shadow"
                style={{ aspectRatio:"3/4" }}>
                <img src={d.img} alt={d.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <button
                  onClick={() => toggleLike(d.id)}
                  className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/30 backdrop-blur flex items-center justify-center hover:bg-black/50 transition"
                >
                  <Heart className={`h-3.5 w-3.5 transition-colors ${likedDests.has(d.id) ? "fill-pink text-pink" : "text-white"}`} />
                </button>
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <div className="text-[10px] font-semibold text-white/70 mb-0.5">{d.tag} · {d.temp}</div>
                  <div className="text-sm font-bold text-white leading-tight">{d.name}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── CTA BANNER ───────────────────────────────────────────── */}
        <div className="px-4 md:px-0 pb-8">
          <div className="relative overflow-hidden rounded-3xl p-8 md:p-12 text-center"
            style={{ background: "linear-gradient(135deg, #1a1040, #0b1220)" }}>
            <div className="absolute top-0 left-0 w-64 h-64 bg-coral/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-teal/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
            <div className="relative z-10">
              <div className="text-3xl mb-3">🛡️</div>
              <h2 className="font-display font-extrabold text-white text-2xl md:text-3xl mb-2">
                Every Booking Protected by Recoup AI
              </h2>
              <p className="text-white/60 max-w-lg mx-auto text-sm mb-6">
                If your flight delays, hotel changes, or any disruption happens — our AI instantly recovers your entire itinerary at zero hassle.
              </p>
              <button className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-coral to-pink text-white font-bold hover:brightness-110 transition shadow-[0_8px_24px_-8px_rgba(255,79,94,0.6)]">
                Plan Your Protected Trip <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
