// Mock booking inventory — shared between BookingSystem.jsx (search/results)
// and DestinationPackageView.jsx (per-destination bundles), kept in its own
// module so neither file needs to import from the other (avoids a circular
// import between the two).
import { Plane, Train, Building, Tent, Compass } from "lucide-react";

export const TABS = [
  { id:"flights",    label:"Flights",    icon: Plane },
  { id:"trains",     label:"Trains",     icon: Train },
  { id:"hotels",     label:"Hotels",     icon: Building },
  { id:"hostels",    label:"Hostels",    icon: Tent },
  { id:"activities", label:"Activities", icon: Compass },
];

export const RESULTS = {
  flights: [
    { id:"f1", airline:"Air Garuda",  flight:"GA-865", from:"BOM", to:"DPS", dep:"06:15", arr:"14:40", duration:"8h 25m", stops:"1 Stop",   price:"₹24,500", rating:4.2, img:"https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&q=80" },
    { id:"f2", airline:"SkyJet",      flight:"SJ-410", from:"BOM", to:"DPS", dep:"22:30", arr:"14:15", duration:"11h 45m",stops:"2 Stops",  price:"₹18,200", rating:3.8, img:"https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=600&q=80" },
    { id:"f3", airline:"Vistara",     flight:"UK-101", from:"DEL", to:"DXB", dep:"10:00", arr:"12:30", duration:"3h 30m", stops:"Non-stop", price:"₹28,900", rating:4.7, img:"https://images.unsplash.com/photo-1542296332-2e4473faf563?w=600&q=80" },
    { id:"f4", airline:"IndiGo",      flight:"6E-205", from:"BOM", to:"COK", dep:"07:45", arr:"09:55", duration:"2h 10m", stops:"Non-stop", price:"₹6,800",  rating:4.1, img:"https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600&q=80" },
    { id:"f5", airline:"Air India",   flight:"AI-302", from:"DEL", to:"LHR", dep:"01:30", arr:"07:45", duration:"9h 15m", stops:"Non-stop", price:"₹52,000", rating:4.3, img:"https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=600&q=80" },
    { id:"f6", airline:"Emirates",    flight:"EK-507", from:"BOM", to:"DXB", dep:"13:45", arr:"15:50", duration:"3h 05m", stops:"Non-stop", price:"₹22,400", rating:4.8, img:"https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=600&q=80" },
  ],
  trains: [
    { id:"t1", name:"Rajdhani Express", number:"12951", from:"Mumbai", to:"Delhi",      dep:"16:35", arr:"08:35", duration:"16h",    class:"1A/2A/3A", price:"₹2,450", rating:4.3, img:"https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=600&q=80" },
    { id:"t2", name:"Vande Bharat",     number:"22439", from:"Mumbai", to:"Pune",       dep:"07:10", arr:"10:40", duration:"3h 30m", class:"Executive/Chair", price:"₹1,120", rating:4.8, img:"https://images.unsplash.com/photo-1580442374555-3def8fb41738?w=600&q=80" },
    { id:"t3", name:"Kerala Express",   number:"16605", from:"Mumbai", to:"Trivandrum", dep:"11:15", arr:"06:30", duration:"19h",    class:"SL/3A/2A", price:"₹1,890", rating:4.0, img:"https://images.unsplash.com/photo-1571893652827-a3e071ab463b?w=600&q=80" },
    { id:"t4", name:"Shatabdi Express", number:"12017", from:"Delhi",  to:"Dehradun",   dep:"06:45", arr:"12:05", duration:"5h 20m", class:"CC/Executive", price:"₹980",  rating:4.4, img:"https://images.unsplash.com/photo-1637995735729-c43250f1ef47?w=600&q=80" },
    { id:"t5", name:"Tejas Express",    number:"82901", from:"Lucknow", to:"Delhi",     dep:"06:10", arr:"10:30", duration:"4h 20m", class:"CC/Executive", price:"₹1,350", rating:4.6, img:"https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=600&q=80" },
    { id:"t6", name:"Duronto Express",  number:"12245", from:"Kolkata", to:"Bangalore", dep:"22:00", arr:"20:00", duration:"22h",    class:"1A/2A/3A/SL", price:"₹3,100", rating:4.1, img:"https://images.unsplash.com/photo-1442570468985-f63ed5de9086?w=600&q=80" },
  ],
  hotels: [
    { id:"h1", name:"Ubud Canopy Retreat",     loc:"Ubud, Bali",        price:"₹8,500/night",  rating:4.8, amenities:["Pool","Spa","WiFi"],    type:"Luxury Villa",    phone:"+62 361 555 0142", img:"https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80" },
    { id:"h2", name:"Seminyak Beach Resort",   loc:"Seminyak, Bali",    price:"₹12,000/night", rating:4.5, amenities:["Beach","Bar","WiFi"],    type:"5★ Resort",       phone:"+62 361 555 0187", img:"https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80" },
    { id:"h3", name:"Le Méridien Paris",       loc:"Paris, France",     price:"₹18,200/night", rating:4.9, amenities:["Rooftop","Spa","Pool"],  type:"Boutique Hotel",  phone:"+33 1 45 55 0163", img:"https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80" },
    { id:"h4", name:"Marari Beach Resort",     loc:"Kerala, India",     price:"₹5,400/night",  rating:4.6, amenities:["Ayurveda","Beach","Yoga"],type:"Heritage Resort", phone:"+91 484 555 0121", img:"https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80" },
    { id:"h5", name:"Burj Al Arab",            loc:"Dubai, UAE",        price:"₹42,000/night", rating:5.0, amenities:["Private Beach","Helipad","Butler"],type:"7★ Iconic",phone:"+971 4 555 0198", img:"https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80" },
    { id:"h6", name:"Taj Palace",              loc:"New Delhi, India",  price:"₹15,000/night", rating:4.9, amenities:["Pool","SPA","Gym","Golf"],type:"Heritage Palace", phone:"+91 11 555 0176", img:"https://images.unsplash.com/photo-1524613032530-449a5d94c285?w=800&q=80" },
    { id:"h7", name:"The Ritz-Carlton Tokyo",  loc:"Midtown, Tokyo",    price:"₹38,000/night", rating:4.9, amenities:["Sky Pool","Spa","Lounge"],type:"5★ Luxury",      phone:"+81 3 5555 0154", img:"https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80" },
    { id:"h8", name:"Santorini Cave Suites",   loc:"Oia, Santorini",    price:"₹28,000/night", rating:4.8, amenities:["Infinity Pool","View","WiFi"],type:"Cave Suite",  phone:"+30 22 8607 1233", img:"https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80" },
  ],
  hostels: [
    { id:"hs1", name:"The Bali Backpacker Hub", loc:"Kuta, Bali",          price:"₹1,200/night", rating:4.3, beds:"4-bed dorm",   phone:"+62 361 555 0119", img:"https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80",  vibe:"Party Scene" },
    { id:"hs2", name:"Wanderers Tokyo",         loc:"Shinjuku, Tokyo",     price:"₹1,800/night", rating:4.7, beds:"6-bed dorm",   phone:"+81 3 5555 0187", img:"https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",  vibe:"Social & Clean" },
    { id:"hs3", name:"Paris Budget Nest",       loc:"Montmartre, Paris",   price:"₹2,100/night", rating:4.1, beds:"Private room", phone:"+33 1 42 55 0143", img:"https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=800&q=80",  vibe:"Artsy Neighbourhood" },
    { id:"hs4", name:"Kerala River Hostel",     loc:"Alleppey, Kerala",    price:"₹900/night",   rating:4.5, beds:"4-bed dorm",   phone:"+91 477 555 0165", img:"https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=800&q=80",  vibe:"Backpacker's Chill" },
    { id:"hs5", name:"Singapore Smart Hostel",  loc:"Bugis, Singapore",    price:"₹2,400/night", rating:4.6, beds:"Pod bed",      phone:"+65 6555 0178", img:"https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=80",  vibe:"Tech-Friendly" },
    { id:"hs6", name:"Goa Beach Shack Stay",    loc:"Anjuna, Goa",         price:"₹800/night",   rating:4.2, beds:"8-bed dorm",   phone:"+91 832 555 0134", img:"https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80",  vibe:"Hippie Vibes" },
    { id:"hs7", name:"Istanbul Old City Hostel",loc:"Sultanahmet, Istanbul",price:"₹1,600/night", rating:4.4, beds:"Mixed dorm",   phone:"+90 212 555 0192", img:"https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80",  vibe:"Historic & Cozy" },
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
    { id:"a9",  name:"Ladakh Bike Expedition",             loc:"Ladakh",     price:"₹18,000/person",duration:"7D", rating:4.8, tag:"🏍 Epic Ride",     img:"https://images.unsplash.com/photo-1582084770885-36767753763d?w=800&q=80" },
    { id:"a10", name:"Singapore Night Safari",             loc:"Singapore",  price:"₹4,200/person", duration:"3h",  rating:4.6, tag:"🦁 Wildlife",      img:"https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=80" },
    { id:"a11", name:"Santorini Wine & Sunset Cruise",     loc:"Santorini",  price:"₹9,500/person", duration:"5h",  rating:4.9, tag:"🥂 Luxury",        img:"https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80" },
    { id:"a12", name:"Goa Scuba Diving Certification",     loc:"Goa",        price:"₹5,500/person", duration:"8h",  rating:4.5, tag:"🤿 Underwater",    img:"https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80" },
  ],
};
