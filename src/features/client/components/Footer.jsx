import { Link } from "react-router-dom";
import logo from "@/assets/images/logo.svg";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white pt-16 pb-8 w-full mt-auto">
      <div className="mx-auto flex w-full max-w-7xl flex-col px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-12 mb-12 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start max-w-xs">
            <Link className="flex items-center gap-2.5 mb-4 no-underline hover:opacity-90 transition-opacity" to="/">
              <span className="flex shrink-0 items-center justify-center">
                <img alt="GlowFix" className="h-8 w-auto" src={logo} />
              </span>
              <span className="text-[20px] font-bold italic tracking-tight text-gray-900">
                _Glow<span className="text-brand-500">Fix</span>._
              </span>
            </Link>
            <p className="text-[14px] text-gray-500 leading-relaxed">
              Book trusted local service providers with real-time updates and seamless communication.
            </p>
          </div>
          
          <div className="flex gap-12 sm:gap-20 text-[14px] text-left">
            <div className="flex flex-col gap-3">
              <strong className="text-gray-900 font-bold mb-1 tracking-wide">Explore</strong>
              <Link to="/" className="text-gray-500 hover:text-brand-500 transition-colors no-underline">Home</Link>
              <Link to="/providers" className="text-gray-500 hover:text-brand-500 transition-colors no-underline">Discover</Link>
              <Link to="/browse" className="text-gray-500 hover:text-brand-500 transition-colors no-underline">Search Services</Link>
            </div>
            <div className="flex flex-col gap-3">
              <strong className="text-gray-900 font-bold mb-1 tracking-wide">Support</strong>
              <Link to="/bookings" className="text-gray-500 hover:text-brand-500 transition-colors no-underline">My Bookings</Link>
              <Link to="/chat?support=true" className="text-gray-500 hover:text-brand-500 transition-colors no-underline">Live Chat</Link>
              <Link to="/settings/help" className="text-gray-500 hover:text-brand-500 transition-colors no-underline">Help Center</Link>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-[13px] text-gray-400">
          <p>© {new Date().getFullYear()} GlowFix. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}




