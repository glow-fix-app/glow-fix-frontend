import { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "@/routes/paths";
import { useQuery } from "@tanstack/react-query";
import { clientApi } from "@/features/client/services/clientApi";
import { useDiscover } from "@/features/client/hooks/useDiscover";
import { useDiscoverLocation } from "@/features/client/hooks/useDiscoverLocation";
import DiscoverMap from "@/features/client/components/discover/DiscoverMap";
import ProviderCard from "@/features/client/components/discover/ProviderCard";
import { 
  MapPinIcon, 
  MagnifyingGlassIcon, 
  ArrowRightIcon, 
  ShieldCheckIcon, 
  CreditCardIcon, 
  StarIcon,
  CalendarDaysIcon,
  CheckBadgeIcon,
  ChatBubbleBottomCenterTextIcon
} from "@heroicons/react/24/outline";
import { ROLES } from "@/features/auth/constants/roles";

export default function ClientHomePage() {
  const user = useSelector((state) => state.auth.user);
  const initialCity = user?.client?.city || user?.city || user?.clientLocation?.city || "Zamalek, Cairo";
  
  const [location, setLocation] = useState(initialCity);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedProviderId, setSelectedProviderId] = useState(null);
  const navigate = useNavigate();

  const { userLocation } = useDiscoverLocation();

  const { providers, isLoading: isProvidersLoading } = useDiscover({
    filters: { maxDistance: 50, categories: [], search: "", searchType: "provider", minRating: 0, openNow: false },
    sort: "recommended",
    userLocation,
    city: null,
    enabled: true,
  });

  const topProviders = providers?.slice(0, 4) || [];

  // Show a decent number of providers on the home page so scrolling is meaningful
  const homeProviders = providers?.slice(0, 15) || [];

  const topRatedProviders = useMemo(() => {
    if (!providers) return [];
    return [...providers].sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0)).slice(0, 4);
  }, [providers]);

  useEffect(() => {
    if (user) {
      const city = user?.client?.city || user?.city || user?.clientLocation?.city;
      if (city) setLocation(city);

      if (user.role === ROLES.MANAGER || user.role === "manager") {
        navigate("/provider");
      } else if (user.role === ROLES.ADMIN || user.role === "admin") {
        navigate("/admin");
      }
    }
  }, [user, navigate]);

  // Fetch all services for autocomplete
  const { data: allServices } = useQuery({
    queryKey: ["client", "services", "all"],
    queryFn: () => clientApi.services(),
    staleTime: 5 * 60 * 1000,
  });

  const suggestions = (allServices || [])
    .filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .slice(0, 5);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleSuggestionClick = (title) => {
    setSearchQuery(title);
    setIsSearchFocused(false);
    navigate(`/browse?q=${encodeURIComponent(title)}`);
  };

  return (
    <div className="relative w-full bg-gradient-to-b from-blue-100/60 via-transparent to-transparent min-h-[75vh] flex flex-col items-center justify-center pt-40 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl flex flex-col items-center justify-center">
        <div className="text-center max-w-4xl w-full">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-gray-900 leading-[1.15] mb-6 tracking-tight transition-all">
            Book Trusted Car Care,<br className="hidden sm:block" />
            <span className="text-brand-500 font-semibold italic">
              Right <span className="relative inline-block">
                Where You Are.
                {/* Swoosh underline decoration */}
                <svg className="absolute w-[105%] h-3 sm:h-4 -bottom-1 sm:-bottom-2 -left-1 text-brand-200/80" viewBox="0 0 200 9" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                  <path d="M2.00017 6.44111C47.0002 1.44111 133.5 -2.05889 198 7.94111" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              </span>
            </span>
          </h1>
        
        <p className="text-sm sm:text-base md:text-lg text-gray-500 mb-10 px-4 md:px-12 font-medium leading-relaxed transition-all">
          Find verified car wash and repair providers near you. Browse,<br className="hidden md:block" />
          compare, and book your slot in minutes.
        </p>

        {/* Search Bar Container */}
        <form 
          onSubmit={handleSearch}
          className="bg-white p-2 rounded-[2rem] md:rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex flex-col md:flex-row items-center w-full max-w-2xl mx-auto border border-gray-100 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative gap-2 md:gap-0"
        >
          {/* Location */}
          <div className="flex items-center px-4 py-2 w-full md:w-auto text-gray-700">
            <MapPinIcon className="w-5 h-5 text-brand-500 mr-2 shrink-0" />
            <input 
              type="text" 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location"
              className="bg-transparent border-none outline-none w-full md:w-32 text-sm font-semibold focus:ring-0 text-gray-800" 
            />
          </div>

          {/* Desktop Divider */}
          <div className="hidden md:block w-px h-8 bg-gray-200 mx-2"></div>
          
          {/* Mobile Divider */}
          <div className="md:hidden w-[calc(100%-2rem)] h-px bg-gray-100 mx-auto"></div>

          {/* Service Search */}
          <div className="flex items-center px-4 py-2 flex-1 w-full text-gray-700 relative">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 mr-2 shrink-0" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              placeholder="What does your car need?"
              className="bg-transparent border-none outline-none w-full text-sm font-medium focus:ring-0 placeholder-gray-400 text-gray-800" 
              autoComplete="off"
            />

            {/* Suggestions Dropdown */}
            {isSearchFocused && searchQuery && suggestions.length > 0 && (
              <div className="absolute top-full left-0 mt-3 w-full bg-white rounded-2xl shadow-xl shadow-blue-900/5 border border-gray-100 overflow-hidden z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                {suggestions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSuggestionClick(s.title)}
                    className="w-full text-left px-5 py-2.5 transition-all group hover:bg-brand-50/50"
                  >
                    <span className="text-sm font-semibold text-gray-700 group-hover:text-brand-500 transition-colors">
                      {s.title}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Button */}
          <button 
            type="submit" 
            className="w-full md:w-auto mt-2 md:mt-0 bg-brand-500 hover:bg-brand-600 text-white px-8 py-3 rounded-full font-semibold flex items-center justify-center transition-colors shadow-md shadow-brand-500/30"
          >
            Search
            <ArrowRightIcon className="w-4 h-4 ml-2 stroke-[2.5]" />
          </button>
        </form>

        {/* Trust Badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500 font-medium">
          <div className="flex items-center">
            <ShieldCheckIcon className="w-5 h-5 text-green-500 mr-1.5" />
            Verified Pros
          </div>
          <div className="hidden md:block w-1 h-1 rounded-full bg-gray-300"></div>
          <div className="flex items-center">
            <CreditCardIcon className="w-5 h-5 text-blue-500 mr-1.5" />
            Secure Payments
          </div>
          <div className="hidden md:block w-1 h-1 rounded-full bg-gray-300"></div>
          <div className="flex items-center">
            <StarIcon className="w-5 h-5 text-orange-400 mr-1.5" />
            4.8/5 Avg Rating
          </div>
        </div>
        </div>
      </div>

      {/* Providers Near You Section */}
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="mb-8">
          <p className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary mb-1">Live</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Providers near you</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-auto lg:h-[600px]">
          {/* Provider List */}
          <div className="flex flex-col gap-4 overflow-y-auto px-1.5 pb-4 pt-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-300 hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent pr-2">
             {isProvidersLoading ? (
               <div className="flex flex-col gap-4 opacity-50">
                 {[1,2,3,4].map(i => (
                   <div key={i} className="h-[120px] bg-gray-100 animate-pulse rounded-xl shrink-0" />
                 ))}
               </div>
             ) : homeProviders.length > 0 ? (
               homeProviders.map(p => (
                 <ProviderCard 
                   key={p.id} 
                   provider={p} 
                   isSelected={selectedProviderId === p.id}
                   onSelect={setSelectedProviderId}
                   variant="compact"
                 />
               ))
             ) : (
               <div className="flex flex-col items-center justify-center h-full min-h-[250px] text-center bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                 <div className="bg-gray-50 p-4 rounded-full mb-4 ring-1 ring-gray-100">
                   <MapPinIcon className="w-8 h-8 text-brand-400" />
                 </div>
                 <p className="text-[15px] font-semibold text-gray-800">No providers nearby</p>
                 <p className="text-[13px] text-gray-500 mt-1 max-w-[250px]">
                   We couldn't find any service providers near this location. Try exploring a different area.
                 </p>
               </div>
             )}
          </div>
          
          {/* Map */}
          <div className="h-[400px] lg:h-full rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 relative shadow-sm">
             <DiscoverMap 
               providers={homeProviders}  
               userLocation={userLocation}
               selectedId={selectedProviderId}
               onSelectProvider={setSelectedProviderId}
             />
          </div>
        </div>
      </div>

      {/* Recommended Providers Section */}
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12 pb-24 border-t border-gray-100">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">For you</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Recommended Providers</h2>
          </div>
          <button 
            onClick={() => navigate(ROUTE_PATHS.SERVICES)}
            className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold text-gray-700 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors shadow-sm"
          >
            See all
            <ArrowRightIcon className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isProvidersLoading ? (
             [1,2,3,4].map(i => (
               <div key={i} className="h-[200px] bg-gray-50 animate-pulse rounded-2xl border border-gray-100" />
             ))
          ) : topRatedProviders.length > 0 ? (
            topRatedProviders.map(p => (
              <ProviderCard 
                key={p.id} 
                provider={p} 
              />
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-2xl border border-gray-100">
              No recommendations available at this time.
            </div>
          )}
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-white border-t border-gray-100 py-20 pb-32">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-[12px] font-bold uppercase tracking-wider text-brand-500 mb-2">Simple Process</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">How it works</h2>
            <p className="mt-4 text-gray-500 text-[15px]">Getting your vehicle serviced has never been easier. Just follow these simple steps to get back on the road in no time.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Desktop connecting line */}
            <div className="hidden md:block absolute top-[45px] left-[12%] right-[12%] h-[2px] bg-gray-100 z-0"></div>

            {/* Step 1 */}
            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-24 h-24 rounded-full bg-white border-4 border-gray-50 shadow-sm flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300 group-hover:border-brand-50">
                <div className="w-16 h-16 rounded-full bg-brand-50 text-brand-500 flex items-center justify-center">
                  <MagnifyingGlassIcon className="w-7 h-7" />
                </div>
              </div>
              <h3 className="text-[17px] font-bold text-gray-900 mb-2">1. Find Providers</h3>
              <p className="text-[14px] text-gray-500 max-w-[200px]">Search for highly rated service centers near your location.</p>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-24 h-24 rounded-full bg-white border-4 border-gray-50 shadow-sm flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300 group-hover:border-brand-50">
                <div className="w-16 h-16 rounded-full bg-brand-50 text-brand-500 flex items-center justify-center">
                  <CalendarDaysIcon className="w-7 h-7" />
                </div>
              </div>
              <h3 className="text-[17px] font-bold text-gray-900 mb-2">2. Book a Time</h3>
              <p className="text-[14px] text-gray-500 max-w-[200px]">Select a convenient date and time that fits your schedule.</p>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-24 h-24 rounded-full bg-white border-4 border-gray-50 shadow-sm flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300 group-hover:border-brand-50">
                <div className="w-16 h-16 rounded-full bg-brand-50 text-brand-500 flex items-center justify-center">
                  <CreditCardIcon className="w-7 h-7" />
                </div>
              </div>
              <h3 className="text-[17px] font-bold text-gray-900 mb-2">3. Secure Payment</h3>
              <p className="text-[14px] text-gray-500 max-w-[200px]">Pay securely upfront or choose to pay after service completion.</p>
            </div>

            {/* Step 4 */}
            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-24 h-24 rounded-full bg-white border-4 border-gray-50 shadow-sm flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300 group-hover:border-brand-50">
                <div className="w-16 h-16 rounded-full bg-brand-50 text-brand-500 flex items-center justify-center">
                  <CheckBadgeIcon className="w-7 h-7" />
                </div>
              </div>
              <h3 className="text-[17px] font-bold text-gray-900 mb-2">4. Get it Done</h3>
              <p className="text-[14px] text-gray-500 max-w-[200px]">Drop off your vehicle and relax while the experts handle the rest.</p>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}
