import { useState } from "react";
import { Search, MapPin, Calendar as CalendarIcon, Users, Star, Plane, Building, MessageSquare } from "lucide-react";
import Reviews from "./Reviews";

export default function BookingSystem() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [activeTab, setActiveTab] = useState("flights"); // 'flights' or 'hotels'
  const [selectedItemForReview, setSelectedItemForReview] = useState(null);

  // Mock data for search results
  const mockResults = {
    flights: [
      { id: "f1", title: "Air Garuda GA-865", price: "₹24,500", duration: "8h 25m", stops: "1 Stop", rating: 4.2 },
      { id: "f2", title: "SkyJet SJ-410", price: "₹18,200", duration: "11h 10m", stops: "2 Stops", rating: 3.8 },
      { id: "f3", title: "Vistara UK-101", price: "₹28,900", duration: "6h 50m", stops: "Non-stop", rating: 4.7 }
    ],
    hotels: [
      { id: "h1", title: "Ubud Canopy Retreat", price: "₹8,500/night", location: "Ubud, Bali", rating: 4.8, image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
      { id: "h2", title: "Seminyak Beach Resort", price: "₹12,000/night", location: "Seminyak, Bali", rating: 4.5, image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
      { id: "h3", title: "Bali Backpacker Hostel", price: "₹1,200/night", location: "Kuta, Bali", rating: 4.1, image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" }
    ]
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim().toLowerCase().includes("bali")) {
      setSelectedDestination("Bali");
    } else if (searchQuery.trim()) {
      setSelectedDestination(searchQuery);
    }
  };

  return (
    <div className="bg-page-soft min-h-[70vh] rounded-[2rem] p-4 md:p-8">
      {/* Search Bar Container */}
      <div className="bg-page rounded-[2rem] shadow-sm border border-border p-6 mb-8 max-w-4xl mx-auto">
        <h2 className="font-display font-bold text-2xl text-ink mb-6 text-center">Where to next?</h2>
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-faint" />
            <input 
              type="text" 
              placeholder="Search destinations (e.g., Bali)" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-surface-sunk/50 border border-border focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue text-sm text-ink font-medium transition"
            />
          </div>
          <div className="md:w-48 relative">
            <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-faint" />
            <input 
              type="text" 
              placeholder="Dates" 
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-surface-sunk/50 border border-border focus:outline-none focus:border-blue text-sm text-ink font-medium transition cursor-pointer"
              readOnly
              value="Nov 14 - Nov 17"
            />
          </div>
          <div className="md:w-40 relative">
            <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-faint" />
            <input 
              type="text" 
              placeholder="Guests" 
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-surface-sunk/50 border border-border focus:outline-none focus:border-blue text-sm text-ink font-medium transition cursor-pointer"
              readOnly
              value="2 Adults"
            />
          </div>
          <button type="submit" className="px-8 py-4 rounded-2xl bg-blue text-white font-bold hover:brightness-110 transition flex items-center justify-center gap-2">
            <Search className="h-4 w-4" />
            Search
          </button>
        </form>
      </div>

      {selectedDestination && (
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-bold text-xl text-ink">Showing results for {selectedDestination}</h3>
            
            {/* Tabs */}
            <div className="flex items-center gap-1 bg-surface-sunk p-1 rounded-xl border border-border">
              <button 
                onClick={() => { setActiveTab("flights"); setSelectedItemForReview(null); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${activeTab === "flights" ? "bg-page text-blue shadow-sm" : "text-ink-dim hover:text-ink"}`}
              >
                <Plane className="h-4 w-4" /> Flights
              </button>
              <button 
                onClick={() => { setActiveTab("hotels"); setSelectedItemForReview(null); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${activeTab === "hotels" ? "bg-page text-blue shadow-sm" : "text-ink-dim hover:text-ink"}`}
              >
                <Building className="h-4 w-4" /> Hotels
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1fr_400px] gap-8">
            {/* Results List */}
            <div className="space-y-4">
              {activeTab === "flights" && mockResults.flights.map(flight => (
                <div key={flight.id} className="bg-page p-5 rounded-2xl border border-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-ink">{flight.title}</h4>
                    <div className="flex items-center gap-3 text-xs text-ink-dim mt-1">
                      <span>{flight.duration}</span>
                      <span>•</span>
                      <span>{flight.stops}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-amber font-semibold">
                        <Star className="h-3.5 w-3.5 fill-amber" /> {flight.rating}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-2">
                    <div className="font-display font-bold text-lg text-ink">{flight.price}</div>
                    <div className="flex gap-2 w-full">
                      <button onClick={() => setSelectedItemForReview(flight)} className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-border text-xs font-semibold text-ink-dim hover:text-ink hover:bg-surface-sunk transition">
                        Reviews
                      </button>
                      <button className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-ink text-page text-xs font-semibold hover:opacity-90 transition">
                        Book
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {activeTab === "hotels" && mockResults.hotels.map(hotel => (
                <div key={hotel.id} className="bg-page p-4 rounded-2xl border border-border shadow-sm flex flex-col sm:flex-row gap-5">
                  <div className="w-full sm:w-48 h-32 rounded-xl overflow-hidden shrink-0">
                    <img src={hotel.image} alt={hotel.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-ink text-lg">{hotel.title}</h4>
                        <span className="flex items-center gap-1 text-amber font-semibold text-sm bg-amber-dim/20 px-2 py-0.5 rounded-md">
                          <Star className="h-3.5 w-3.5 fill-amber" /> {hotel.rating}
                        </span>
                      </div>
                      <div className="text-xs text-ink-dim flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {hotel.location}
                      </div>
                    </div>
                    <div className="flex items-end justify-between mt-4">
                      <div>
                        <div className="text-xs text-ink-faint">Starting from</div>
                        <div className="font-display font-bold text-xl text-ink">{hotel.price}</div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setSelectedItemForReview(hotel)} className="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-ink-dim hover:text-ink hover:bg-surface-sunk transition">
                          Reviews
                        </button>
                        <button className="px-5 py-2 rounded-xl bg-ink text-page text-xs font-semibold hover:opacity-90 transition">
                          Select Room
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Sidebar: Reviews Panel */}
            <div className="hidden lg:block">
              {selectedItemForReview ? (
                <div className="sticky top-6">
                  <Reviews itemId={selectedItemForReview.id} itemName={selectedItemForReview.title} />
                </div>
              ) : (
                <div className="sticky top-6 bg-surface-sunk/30 rounded-2xl border border-border/50 border-dashed p-8 text-center h-64 flex flex-col items-center justify-center">
                  <MessageSquare className="h-8 w-8 text-ink-faint mb-3 opacity-50" />
                  <p className="text-sm font-medium text-ink-dim">Select "Reviews" on any flight or hotel to see what other travelers think.</p>
                </div>
              )}
            </div>
            
            {/* Mobile Reviews Modal (simplistic fallback) */}
            {selectedItemForReview && (
              <div className="lg:hidden mt-8">
                <Reviews itemId={selectedItemForReview.id} itemName={selectedItemForReview.title} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
