import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import {
  Search, MapPin, Calendar, Users, Star, Plane, Building,
  MessageSquare, Train, Tent, Compass, Sparkles, ArrowRight,
  Clock, Zap, Shield, TrendingUp, ChevronRight, Heart, Map, List,
  Globe, Filter, X
} from "lucide-react";
import Reviews from "./Reviews";

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
  { id:"i7",  name:"Leh Ladakh",     country:"India",       region:"South Asia",    lat:34.1526, lng:77.5771, img:"https://images.unsplash.com/photo-1600701434106-4ccaf64ac34e?w=600&q=80", tag:"🏔 Adventure",  temp:"5°C",  price:"From ₹5,200", popular:true },
  { id:"i8",  name:"Darjeeling",     country:"India",       region:"South Asia",    lat:27.0360, lng:88.2627, img:"https://images.unsplash.com/photo-1583403765025-b53bab7d7715?w=600&q=80", tag:"☕ Hills",      temp:"12°C", price:"From ₹2,400" },
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

const AI_SUGGESTIONS = [
  { icon:"✈️", text:"Bali in November — perfect weather, off-peak pricing. Flights from ₹18,500." },
  { icon:"🏨", text:"Book 3+ nights for 15% discount. Ubud hotels filling fast this week." },
  { icon:"🚄", text:"Train to Kerala 40% cheaper than flights & scenic. Seats dropping fast." },
  { icon:"🎭", text:"Uluwatu Kecak Dance sold out Nov 16 — book Day 2 activity now." },
  { icon:"🌴", text:"Maldives overwater villas: best rates in Sept–Oct before peak season." },
  { icon:"🗼", text:"Paris + Rome combo: saves ₹12,000 vs. booking separately." },
  { icon:"🏔", text:"Ladakh road-trip season closes Dec 1 — only 3 weeks left to book." },
  { icon:"🎌", text:"Japan cherry blossom season peaks late March — hotel spots gone in 2 weeks." },
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
    { id:"f5", airline:"Air India",   flight:"AI-302", from:"DEL", to:"LHR", dep:"01:30", arr:"07:45", duration:"9h 15m", stops:"Non-stop", price:"₹52,000", rating:4.3, img:"https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=600&q=80" },
    { id:"f6", airline:"Emirates",    flight:"EK-507", from:"BOM", to:"DXB", dep:"13:45", arr:"15:50", duration:"3h 05m", stops:"Non-stop", price:"₹22,400", rating:4.8, img:"https://images.unsplash.com/photo-1500116085538-39dff5a03bb1?w=600&q=80" },
  ],
  trains: [
    { id:"t1", name:"Rajdhani Express", number:"12951", from:"Mumbai", to:"Delhi",      dep:"16:35", arr:"08:35", duration:"16h",    class:"1A/2A/3A", price:"₹2,450", rating:4.3, img:"https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=600&q=80" },
    { id:"t2", name:"Vande Bharat",     number:"22439", from:"Mumbai", to:"Pune",       dep:"07:10", arr:"10:40", duration:"3h 30m", class:"Executive/Chair", price:"₹1,120", rating:4.8, img:"https://images.unsplash.com/photo-1553701743-7e9b2a88e3fd?w=600&q=80" },
    { id:"t3", name:"Kerala Express",   number:"16605", from:"Mumbai", to:"Trivandrum", dep:"11:15", arr:"06:30", duration:"19h",    class:"SL/3A/2A", price:"₹1,890", rating:4.0, img:"https://images.unsplash.com/photo-1609667083964-f3dbecfd1516?w=600&q=80" },
    { id:"t4", name:"Shatabdi Express", number:"12017", from:"Delhi",  to:"Dehradun",   dep:"06:45", arr:"12:05", duration:"5h 20m", class:"CC/Executive", price:"₹980",  rating:4.4, img:"https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=80" },
    { id:"t5", name:"Tejas Express",    number:"82901", from:"Lucknow", to:"Delhi",     dep:"06:10", arr:"10:30", duration:"4h 20m", class:"CC/Executive", price:"₹1,350", rating:4.6, img:"https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=600&q=80" },
    { id:"t6", name:"Duronto Express",  number:"12245", from:"Kolkata", to:"Bangalore", dep:"22:00", arr:"20:00", duration:"22h",    class:"1A/2A/3A/SL", price:"₹3,100", rating:4.1, img:"https://images.unsplash.com/photo-1609667083964-f3dbecfd1516?w=600&q=80" },
  ],
  hotels: [
    { id:"h1", name:"Ubud Canopy Retreat",     loc:"Ubud, Bali",        price:"₹8,500/night",  rating:4.8, amenities:["Pool","Spa","WiFi"],    type:"Luxury Villa",    img:"https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80" },
    { id:"h2", name:"Seminyak Beach Resort",   loc:"Seminyak, Bali",    price:"₹12,000/night", rating:4.5, amenities:["Beach","Bar","WiFi"],    type:"5★ Resort",       img:"https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80" },
    { id:"h3", name:"Le Méridien Paris",       loc:"Paris, France",     price:"₹18,200/night", rating:4.9, amenities:["Rooftop","Spa","Pool"],  type:"Boutique Hotel",  img:"https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80" },
    { id:"h4", name:"Marari Beach Resort",     loc:"Kerala, India",     price:"₹5,400/night",  rating:4.6, amenities:["Ayurveda","Beach","Yoga"],type:"Heritage Resort", img:"https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80" },
    { id:"h5", name:"Burj Al Arab",            loc:"Dubai, UAE",        price:"₹42,000/night", rating:5.0, amenities:["Private Beach","Helipad","Butler"],type:"7★ Iconic",img:"https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80" },
    { id:"h6", name:"Taj Palace",              loc:"New Delhi, India",  price:"₹15,000/night", rating:4.9, amenities:["Pool","SPA","Gym","Golf"],type:"Heritage Palace", img:"https://images.unsplash.com/photo-1524613032530-449a5d94c285?w=800&q=80" },
    { id:"h7", name:"The Ritz-Carlton Tokyo",  loc:"Midtown, Tokyo",    price:"₹38,000/night", rating:4.9, amenities:["Sky Pool","Spa","Lounge"],type:"5★ Luxury",      img:"https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80" },
    { id:"h8", name:"Santorini Cave Suites",   loc:"Oia, Santorini",    price:"₹28,000/night", rating:4.8, amenities:["Infinity Pool","View","WiFi"],type:"Cave Suite",  img:"https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80" },
  ],
  hostels: [
    { id:"hs1", name:"The Bali Backpacker Hub", loc:"Kuta, Bali",          price:"₹1,200/night", rating:4.3, beds:"4-bed dorm",   img:"https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80",  vibe:"Party Scene" },
    { id:"hs2", name:"Wanderers Tokyo",         loc:"Shinjuku, Tokyo",     price:"₹1,800/night", rating:4.7, beds:"6-bed dorm",   img:"https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",  vibe:"Social & Clean" },
    { id:"hs3", name:"Paris Budget Nest",       loc:"Montmartre, Paris",   price:"₹2,100/night", rating:4.1, beds:"Private room", img:"https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=800&q=80",  vibe:"Artsy Neighbourhood" },
    { id:"hs4", name:"Kerala River Hostel",     loc:"Alleppey, Kerala",    price:"₹900/night",   rating:4.5, beds:"4-bed dorm",   img:"https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=800&q=80",  vibe:"Backpacker's Chill" },
    { id:"hs5", name:"Singapore Smart Hostel",  loc:"Bugis, Singapore",    price:"₹2,400/night", rating:4.6, beds:"Pod bed",      img:"https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=80",  vibe:"Tech-Friendly" },
    { id:"hs6", name:"Goa Beach Shack Stay",    loc:"Anjuna, Goa",         price:"₹800/night",   rating:4.2, beds:"8-bed dorm",   img:"https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80",  vibe:"Hippie Vibes" },
    { id:"hs7", name:"Istanbul Old City Hostel",loc:"Sultanahmet, Istanbul",price:"₹1,600/night", rating:4.4, beds:"Mixed dorm",   img:"https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80",  vibe:"Historic & Cozy" },
  ],
  activities: [
    { id:"a1",  name:"Mount Batur Sunrise Trek",         loc:"Bali",       price:"₹3,200/person", duration:"6h",  rating:4.9, tag:"🌄 Adventure",    img:"https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=800&q=80" },
    { id:"a2",  name:"Uluwatu Kecak Fire Dance",          loc:"Bali",       price:"₹1,500/person", duration:"2h",  rating:4.8, tag:"🎭 Culture",       img:"https://images.unsplash.com/photo-1604928141064-207cea6f571f?w=800&q=80" },
    { id:"a3",  name:"Eiffel Tower Skip-the-Line",        loc:"Paris",      price:"₹4,800/person", duration:"3h",  rating:4.6, tag:"🗼 Sightseeing",   img:"https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&q=80" },
    { id:"a4",  name:"Kerala Backwaters Houseboat",       loc:"Kerala",     price:"₹8,000/couple", duration:"24h", rating:4.7, tag:"🚢 Experience",    img:"https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80" },
    { id:"a5",  name:"Tsukiji Fish Market Tour",           loc:"Tokyo",      price:"₹2,600/person", duration:"3h",  rating:4.5, tag:"🍣 Food & Culture",img:"https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80" },
    { id:"a6",  name:"Desert Safari & Dune Bashing",      loc:"Dubai",      price:"₹6,500/person", duration:"5h",  rating:4.8, tag:"🏜 Adventure",     img:"https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80" },
    { id:"a7",  name:"Colosseum Guided Night Tour",        loc:"Rome",       price:"₹3,800/person", duration:"2h",  rating:4.7, tag:"🏛 History",       img:"https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80" },
    { id:"a8",  name:"Taj Mahal Sunrise Tour",             loc:"Agra",       price:"₹2,200/person", duration:"4h",  rating:4.9, tag:"🕌 Icon",          img:"https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&q=80" },
    { id:"a9",  name:"Ladakh Bike Expedition",             loc:"Ladakh",     price:"₹18,000/person",duration:"7D", rating:4.8, tag:"🏍 Epic Ride",     img:"https://images.unsplash.com/photo-1600701434106-4ccaf64ac34e?w=800&q=80" },
    { id:"a10", name:"Singapore Night Safari",             loc:"Singapore",  price:"₹4,200/person", duration:"3h",  rating:4.6, tag:"🦁 Wildlife",      img:"https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=80" },
    { id:"a11", name:"Santorini Wine & Sunset Cruise",     loc:"Santorini",  price:"₹9,500/person", duration:"5h",  rating:4.9, tag:"🥂 Luxury",        img:"https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80" },
    { id:"a12", name:"Goa Scuba Diving Certification",     loc:"Goa",        price:"₹5,500/person", duration:"8h",  rating:4.5, tag:"🤿 Underwater",    img:"https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80" },
  ],
};

/* ── MAP FLYTO ── */
function MapFlyTo({ center, zoom }) {
  const map = useMap();
  useEffect(() => { map.flyTo(center, zoom, { duration: 1.5 }); }, [center, zoom]);
  return null;
}

/* ── CARD COMPONENTS ── */
function FlightCard({ item, onReview }) {
  return (
    <motion.div whileHover={{ y:-3 }} className="bg-page rounded-2xl border border-border shadow-sm overflow-hidden group">
      <div className="relative h-32 overflow-hidden">
        <img src={item.img} alt={item.airline} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
        <div className="absolute inset-0 p-4 flex flex-col justify-between">
          <div className="flex justify-between">
            <span className="text-[10px] font-bold bg-white/20 backdrop-blur text-white px-2 py-0.5 rounded-full">{item.airline} · {item.flight}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.stops === "Non-stop" ? "bg-teal text-slate-900" : "bg-amber-dim/80 text-amber backdrop-blur border border-amber/30"}`}>{item.stops}</span>
          </div>
          <div className="flex items-end justify-between text-white">
            <div><div className="text-xl font-bold">{item.from}</div><div className="text-[10px] text-white/70">{item.dep}</div></div>
            <div className="text-center px-2 text-[10px] text-white/60">{item.duration}<div className="border-t border-white/40 mt-1" /></div>
            <div className="text-right"><div className="text-xl font-bold">{item.to}</div><div className="text-[10px] text-white/70">{item.arr}</div></div>
          </div>
        </div>
      </div>
      <div className="px-4 py-3 flex items-center justify-between">
        <div>
          <div className="font-display font-bold text-lg text-ink">{item.price}</div>
          <div className="flex items-center gap-1 text-amber text-xs mt-0.5"><Star className="h-3 w-3 fill-amber" />{item.rating}</div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onReview(item)} className="px-3 py-1.5 rounded-xl border border-border text-xs font-semibold text-ink-dim hover:text-ink hover:bg-surface-sunk transition">Reviews</button>
          <button className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-coral to-pink text-white text-xs font-bold hover:brightness-110 shadow-sm">Book</button>
        </div>
      </div>
    </motion.div>
  );
}

function TrainCard({ item, onReview }) {
  return (
    <motion.div whileHover={{ y:-3 }} className="bg-page rounded-2xl border border-border shadow-sm overflow-hidden group">
      <div className="relative h-28 overflow-hidden">
        <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 to-black/20" />
        <div className="absolute inset-0 p-4 flex items-end justify-between text-white">
          <div><div className="font-bold text-sm">{item.name}</div><div className="text-[10px] text-white/70">{item.number} · {item.class}</div></div>
          <div className="text-right text-[10px] text-white/70"><div>{item.dep} → {item.arr}</div><div className="font-semibold text-xs text-white">{item.duration}</div></div>
        </div>
      </div>
      <div className="px-4 py-3 flex items-center justify-between">
        <div>
          <div className="font-display font-bold text-lg text-ink">{item.price}</div>
          <div className="flex items-center gap-1 text-amber text-xs mt-0.5"><Star className="h-3 w-3 fill-amber" />{item.rating} · {item.from}→{item.to}</div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onReview(item)} className="px-3 py-1.5 rounded-xl border border-border text-xs font-semibold text-ink-dim hover:text-ink hover:bg-surface-sunk transition">Reviews</button>
          <button className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-blue to-teal text-white text-xs font-bold hover:brightness-110 shadow-sm">Book Seat</button>
        </div>
      </div>
    </motion.div>
  );
}

function HotelCard({ item, onReview }) {
  return (
    <motion.div whileHover={{ y:-3 }} className="bg-page rounded-2xl border border-border shadow-sm overflow-hidden group">
      <div className="relative h-40 overflow-hidden">
        <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute top-3 left-3"><span className="text-[10px] font-bold bg-blue/90 backdrop-blur text-white px-2 py-0.5 rounded-full">{item.type}</span></div>
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
          <div>
            <div className="font-bold text-white text-sm leading-tight">{item.name}</div>
            <div className="text-[10px] text-white/70 flex items-center gap-1 mt-0.5"><MapPin className="h-2.5 w-2.5" />{item.loc}</div>
          </div>
          <span className="flex items-center gap-1 text-amber font-bold text-xs bg-black/50 backdrop-blur px-2 py-0.5 rounded-lg"><Star className="h-3 w-3 fill-amber" />{item.rating}</span>
        </div>
      </div>
      <div className="px-4 py-3">
        <div className="flex flex-wrap gap-1 mb-2">{item.amenities.map(a => <span key={a} className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-teal-dim/30 text-teal border border-teal/20">{a}</span>)}</div>
        <div className="flex items-center justify-between">
          <div><div className="text-[10px] text-ink-faint">from</div><div className="font-display font-bold text-lg text-ink">{item.price}</div></div>
          <div className="flex gap-2">
            <button onClick={() => onReview(item)} className="px-3 py-1.5 rounded-xl border border-border text-xs font-semibold text-ink-dim hover:text-ink hover:bg-surface-sunk transition">Reviews</button>
            <button className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber to-coral text-white text-xs font-bold hover:brightness-110 shadow-sm">Reserve</button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function HostelCard({ item, onReview }) {
  return (
    <motion.div whileHover={{ y:-3 }} className="bg-page rounded-2xl border border-border shadow-sm overflow-hidden group">
      <div className="relative h-32 overflow-hidden">
        <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <div className="absolute top-3 left-3"><span className="text-[10px] font-bold bg-pink/90 text-white px-2 py-0.5 rounded-full backdrop-blur">{item.vibe}</span></div>
        <div className="absolute bottom-3 left-4 right-4">
          <div className="font-bold text-white text-sm">{item.name}</div>
          <div className="text-[10px] text-white/70 flex items-center gap-1"><MapPin className="h-2.5 w-2.5" />{item.loc}</div>
        </div>
      </div>
      <div className="px-4 py-3 flex items-center justify-between">
        <div>
          <div className="font-display font-bold text-lg text-ink">{item.price}</div>
          <div className="flex items-center gap-2 text-xs mt-0.5">
            <span className="flex items-center gap-1 text-amber font-semibold"><Star className="h-3 w-3 fill-amber" />{item.rating}</span>
            <span className="text-ink-faint">· {item.beds}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onReview(item)} className="px-3 py-1.5 rounded-xl border border-border text-xs font-semibold text-ink-dim hover:text-ink hover:bg-surface-sunk transition">Reviews</button>
          <button className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-pink to-coral text-white text-xs font-bold hover:brightness-110 shadow-sm">Book Bed</button>
        </div>
      </div>
    </motion.div>
  );
}

function ActivityCard({ item, onReview }) {
  return (
    <motion.div whileHover={{ y:-3 }} className="bg-page rounded-2xl border border-border shadow-sm overflow-hidden group">
      <div className="relative h-40 overflow-hidden">
        <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
        <div className="absolute top-3 left-3"><span className="text-[10px] font-bold bg-white/20 backdrop-blur text-white px-2 py-0.5 rounded-full border border-white/20">{item.tag}</span></div>
        <div className="absolute bottom-3 left-4 right-4">
          <div className="font-bold text-white text-sm mb-0.5 leading-tight">{item.name}</div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] text-white/70"><MapPin className="h-2.5 w-2.5" />{item.loc}<Clock className="h-2.5 w-2.5 ml-1" />{item.duration}</div>
            <span className="flex items-center gap-1 text-amber font-bold text-xs"><Star className="h-3 w-3 fill-amber" />{item.rating}</span>
          </div>
        </div>
      </div>
      <div className="px-4 py-3 flex items-center justify-between">
        <div><div className="font-display font-bold text-lg text-ink">{item.price}</div><div className="text-[10px] text-ink-faint">Instant confirmation</div></div>
        <div className="flex gap-2">
          <button onClick={() => onReview(item)} className="px-3 py-1.5 rounded-xl border border-border text-xs font-semibold text-ink-dim hover:text-ink hover:bg-surface-sunk transition">Reviews</button>
          <button className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-teal to-blue text-white text-xs font-bold hover:brightness-110 shadow-sm">Book</button>
        </div>
      </div>
    </motion.div>
  );
}

/* ── MAIN ── */
export default function BookingSystem() {
  const [activeTab, setActiveTab] = useState("flights");
  const [selectedItemForReview, setSelectedItemForReview] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "map"
  const [mapCenter, setMapCenter] = useState([20, 78]);
  const [mapZoom, setMapZoom] = useState(4);
  const [selectedDest, setSelectedDest] = useState(null);
  const [likedDests, setLikedDests] = useState(new Set());
  const [showAllDests, setShowAllDests] = useState(false);

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
    setSelectedDest(d);
    setMapCenter([d.lat, d.lng]);
    setMapZoom(10);
    if (viewMode !== "map") setViewMode("map");
  };

  const toggleLike = (id) => {
    setLikedDests(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  return (
    <div className="min-h-screen bg-page-soft">

      {/* ── HERO ── */}
      <div className="relative overflow-hidden rounded-[2rem] mb-8"
        style={{ background: "linear-gradient(135deg, #0b0f19 0%, #1a1040 50%, #0b1220 100%)" }}>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-coral/20 rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-teal/15 rounded-full blur-3xl translate-y-1/2" />
        <div className="relative z-10 px-6 md:px-12 pt-12 pb-8">
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/15 text-white/80 text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
              <Sparkles className="h-3.5 w-3.5 text-amber" />
              AI-Powered · {ALL_DESTINATIONS.length}+ Destinations · One Platform
            </div>
            <h1 className="font-display font-extrabold text-white text-4xl md:text-5xl mb-3 tracking-tight">
              Your Next Journey<br />
              <span className="bg-gradient-to-r from-coral via-amber to-teal bg-clip-text text-transparent">Starts Here</span>
            </h1>
          </motion.div>

          {/* Booking Tabs */}
          <div className="flex justify-center mb-5 overflow-x-auto">
            <div className="flex items-center gap-1 bg-white/10 backdrop-blur border border-white/15 p-1 rounded-2xl">
              {TABS.map(tab => {
                const Icon = tab.icon;
                return (
                  <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSelectedItemForReview(null); }}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${activeTab === tab.id ? "bg-white text-slate-900 shadow-md" : "text-white/60 hover:text-white hover:bg-white/10"}`}>
                    <Icon className="h-3.5 w-3.5" />{tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search Bar */}
          <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
            className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur border border-white/15 rounded-2xl p-3 grid grid-cols-1 md:grid-cols-[1fr_1fr_auto_auto_auto] gap-2">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                <input placeholder="From (City / Airport)"
                  className="w-full bg-white/10 border border-white/10 rounded-xl pl-9 pr-3 py-3 text-white placeholder:text-white/40 text-sm outline-none focus:border-coral/50 focus:ring-1 focus:ring-coral/20 transition" />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-coral/70" />
                <input placeholder="To (Destination)"
                  className="w-full bg-white/10 border border-white/10 rounded-xl pl-9 pr-3 py-3 text-white placeholder:text-white/40 text-sm outline-none focus:border-teal/50 focus:ring-1 focus:ring-teal/20 transition" />
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                <input type="date" defaultValue="2026-11-14"
                  className="bg-white/10 border border-white/10 rounded-xl pl-9 pr-3 py-3 text-white text-sm outline-none focus:border-blue/50 transition [color-scheme:dark]" />
              </div>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                <select className="bg-white/10 border border-white/10 rounded-xl pl-9 pr-3 py-3 text-white text-sm outline-none appearance-none focus:border-amber/50 transition [color-scheme:dark]">
                  {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} {n===1?"Person":"People"}</option>)}
                </select>
              </div>
              <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-coral to-pink text-white font-bold text-sm hover:brightness-110 shadow-[0_4px_20px_-4px_rgba(255,79,94,0.5)] flex items-center gap-2 justify-center whitespace-nowrap">
                <Search className="h-4 w-4" /> Search
              </button>
            </div>
          </motion.div>

          <div className="flex items-center justify-center gap-6 mt-5 flex-wrap">
            {[{icon:Zap,label:"Instant Confirmation"},{icon:Shield,label:"100% Secure"},{icon:TrendingUp,label:"Best Price Guarantee"}].map(b => (
              <div key={b.label} className="flex items-center gap-1.5 text-white/50 text-xs font-medium">
                <b.icon className="h-3.5 w-3.5 text-teal" />{b.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-10">

        {/* ── AI SUGGESTIONS ── */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-coral to-pink flex items-center justify-center shadow-[0_0_16px_rgba(255,79,94,0.4)]">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <h2 className="font-display font-bold text-lg text-ink">AI Travel Insights</h2>
            <span className="text-[10px] font-bold text-teal border border-teal/20 bg-teal-dim/20 px-2 py-0.5 rounded-full">Recoup AI</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {AI_SUGGESTIONS.map((s, i) => (
              <motion.div key={i} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay: i*0.08 }}
                className="bg-page rounded-2xl border border-border p-4 shadow-sm hover:border-coral/30 transition-all cursor-pointer group">
                <div className="text-xl mb-2">{s.icon}</div>
                <p className="text-xs text-ink-dim leading-relaxed group-hover:text-ink transition">{s.text}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── RESULTS ── */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-bold text-xl text-ink">
              {TABS.find(t => t.id === activeTab)?.label} — Top Picks
            </h2>
            <span className="text-xs text-ink-faint">{currentResults.length} results · AI-sorted</span>
          </div>
          <div className="grid lg:grid-cols-[1fr_360px] gap-8">
            <div className={`grid gap-4 ${activeTab === "activities" ? "sm:grid-cols-2" : "grid-cols-1"}`}>
              {activeTab === "flights"    && currentResults.map(i => <FlightCard   key={i.id} item={i} onReview={setSelectedItemForReview} />)}
              {activeTab === "trains"     && currentResults.map(i => <TrainCard    key={i.id} item={i} onReview={setSelectedItemForReview} />)}
              {activeTab === "hotels"     && currentResults.map(i => <HotelCard    key={i.id} item={i} onReview={setSelectedItemForReview} />)}
              {activeTab === "hostels"    && currentResults.map(i => <HostelCard   key={i.id} item={i} onReview={setSelectedItemForReview} />)}
              {activeTab === "activities" && currentResults.map(i => <ActivityCard key={i.id} item={i} onReview={setSelectedItemForReview} />)}
            </div>
            <div className="hidden lg:block">
              <AnimatePresence mode="wait">
                {selectedItemForReview ? (
                  <motion.div key={selectedItemForReview.id} initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:20 }} className="sticky top-6">
                    <Reviews itemId={selectedItemForReview.id} itemName={selectedItemForReview.name || selectedItemForReview.title} />
                  </motion.div>
                ) : (
                  <motion.div className="sticky top-6 rounded-2xl border border-dashed border-border p-8 text-center flex flex-col items-center justify-center h-64">
                    <MessageSquare className="h-10 w-10 text-ink-faint/30 mb-3" />
                    <p className="text-sm text-ink-faint">Click "Reviews" on any card to see traveler feedback</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ── DESTINATIONS: SEARCH + FILTER + GRID/MAP ── */}
        <div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="font-display font-bold text-xl text-ink flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue" /> {ALL_DESTINATIONS.length}+ Destinations Worldwide
              </h2>
              <p className="text-xs text-ink-dim mt-0.5">Handpicked from India and across the globe</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-faint" />
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search destination…"
                  className="pl-9 pr-3 py-2 rounded-xl bg-surface-sunk/50 border border-border text-xs text-ink focus:outline-none focus:border-blue/50 transition w-44" />
                {searchQuery && <button onClick={() => setSearchQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink"><X className="h-3 w-3" /></button>}
              </div>
              {/* View toggle */}
              <div className="flex items-center gap-1 bg-surface-sunk p-1 rounded-xl border border-border">
                <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded-lg transition ${viewMode==="grid" ? "bg-page shadow-sm text-ink" : "text-ink-dim hover:text-ink"}`}><List className="h-3.5 w-3.5" /></button>
                <button onClick={() => setViewMode("map")} className={`p-1.5 rounded-lg transition ${viewMode==="map" ? "bg-page shadow-sm text-ink" : "text-ink-dim hover:text-ink"}`}><Map className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          </div>

          {/* Region Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap mb-5">
            {REGIONS.map(r => (
              <button key={r} onClick={() => setSelectedRegion(r)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${selectedRegion === r ? "bg-ink text-page border-ink shadow-sm" : "bg-page border-border text-ink-dim hover:text-ink hover:border-border-strong"}`}>
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
                    className="group relative rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-shadow"
                    style={{ aspectRatio:"3/4" }} onClick={() => handleDestClick(d)}>
                    <img src={d.img} alt={d.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                    <button onClick={e => { e.stopPropagation(); toggleLike(d.id); }}
                      className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/30 backdrop-blur flex items-center justify-center hover:bg-black/50 transition">
                      <Heart className={`h-3.5 w-3.5 ${likedDests.has(d.id) ? "fill-pink text-pink" : "text-white"}`} />
                    </button>
                    {d.popular && <div className="absolute top-2 left-2 text-[9px] font-bold bg-amber text-black px-1.5 py-0.5 rounded-full">🔥 Popular</div>}
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <div className="text-[9px] font-semibold text-white/70 mb-0.5">{d.tag}</div>
                      <div className="text-sm font-bold text-white leading-tight">{d.name}</div>
                      <div className="text-[9px] text-white/60">{d.country} · {d.temp}</div>
                      <div className="text-[10px] font-bold text-amber mt-0.5">{d.price}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
              {filteredDests.length > 12 && (
                <div className="text-center mt-6">
                  <button onClick={() => setShowAllDests(!showAllDests)}
                    className="px-8 py-3 rounded-2xl border-2 border-border hover:border-ink text-ink font-semibold text-sm transition-all hover:bg-surface-sunk">
                    {showAllDests ? "Show Less" : `Show All ${filteredDests.length} Destinations`} <ChevronRight className={`inline h-4 w-4 ml-1 transition-transform ${showAllDests ? "rotate-90" : ""}`} />
                  </button>
                </div>
              )}
            </>
          )}

          {/* Map View */}
          {viewMode === "map" && (
            <div className="relative rounded-2xl overflow-hidden border border-border shadow-sm" style={{ height: "600px" }}>
              <MapContainer center={mapCenter} zoom={mapZoom} className="h-full w-full" zoomControl={true}>
                <TileLayer
                  attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapFlyTo center={mapCenter} zoom={mapZoom} />
                {filteredDests.map(d => (
                  <Marker key={d.id} position={[d.lat, d.lng]} eventHandlers={{ click: () => setSelectedDest(d) }}>
                    <Popup>
                      <div className="text-center min-w-[160px]">
                        <img src={d.img} alt={d.name} className="w-full h-20 object-cover rounded-lg mb-2" />
                        <div className="font-bold text-sm">{d.name}</div>
                        <div className="text-xs text-gray-500">{d.country} · {d.temp}</div>
                        <div className="text-xs font-bold text-orange-500 mt-1">{d.price}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">{d.tag}</div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
              {/* Map Legend */}
              <div className="absolute bottom-4 left-4 bg-page/95 backdrop-blur rounded-xl border border-border p-3 shadow-lg">
                <div className="text-xs font-bold text-ink mb-1">{filteredDests.length} destinations shown</div>
                <div className="text-[10px] text-ink-dim">Click any pin for details</div>
              </div>
            </div>
          )}
        </div>

        {/* ── BOTTOM CTA ── */}
        <div className="pb-8">
          <div className="relative overflow-hidden rounded-3xl p-8 md:p-12 text-center"
            style={{ background: "linear-gradient(135deg, #1a1040, #0b1220)" }}>
            <div className="absolute top-0 left-0 w-64 h-64 bg-coral/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-teal/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
            <div className="relative z-10">
              <div className="text-3xl mb-3">🛡️</div>
              <h2 className="font-display font-extrabold text-white text-2xl md:text-3xl mb-2">Every Booking Protected by Recoup AI</h2>
              <p className="text-white/60 max-w-lg mx-auto text-sm mb-6">Flight delayed? Hotel changed? Our AI recovers your entire itinerary automatically at zero hassle.</p>
              <button className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-coral to-pink text-white font-bold hover:brightness-110 shadow-[0_8px_24px_-8px_rgba(255,79,94,0.6)]">
                Plan Your Protected Trip <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
