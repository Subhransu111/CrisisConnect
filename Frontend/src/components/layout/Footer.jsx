import { Link } from "react-router-dom"
import { AlertTriangle, Phone } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-800 py-12">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <AlertTriangle size={16} className="text-white" />
              </div>
              <span className="text-white font-black tracking-tight text-xl">
                CRISIS<span className="text-red-500">CONNECT</span>
              </span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
              A real-time disaster relief coordination platform connecting victims with verified nearby volunteers during emergencies.
            </p>
            <div className="flex items-center gap-2 mt-4 bg-red-950/30 border border-red-500/20 px-4 py-2 w-fit">
              <Phone size={14} className="text-red-400" />
              <span className="text-red-400 text-sm font-bold">Emergency: Call 112</span>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-4">Platform</h4>
            <ul className="space-y-2">
              {[
                { label: "Report Emergency", to: "/#quick-report" },
                { label: "Become a Volunteer", to: "/register" },
                { label: "Login", to: "/login" },
              ].map(({ label, to }) => (
                <li key={to}>
                  <Link to={to} className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Emergency Contacts */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-4">Emergency</h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: "National Emergency", number: "112" },
                { label: "Police", number: "100" },
                { label: "Fire", number: "101" },
                { label: "Ambulance", number: "108" },
              ].map(({ label, number }) => (
                <li key={number} className="flex justify-between">
                  <span className="text-gray-500">{label}</span>
                  <a href={`tel:${number}`} className="text-red-400 font-bold hover:text-red-300 transition-colors">
                    {number}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-zinc-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-zinc-600 text-xs">
            © {new Date().getFullYear()} CrisisConnect. Not a replacement for official emergency services.
          </p>
          <p className="text-zinc-600 text-xs">
            For life-threatening emergencies always call <span className="text-red-500 font-bold">112</span> first.
          </p>
        </div>
      </div>
    </footer>
  )
}