import React from "react";
import { 
  Building2, 
  FileCheck2, 
  Award, 
  ShieldCheck, 
  Globe2, 
  HelpCircle,
  PhoneCall,
  ChevronRight
} from "lucide-react";
import { PortalStats } from "../types";

interface DashboardStatsProps {
  stats: PortalStats;
  onNavigate: (tab: string) => void;
}

export default function DashboardStats({ stats, onNavigate }: DashboardStatsProps) {
  const statCards = [
    {
      id: "stats-inst",
      title: "Registered Institutions",
      value: stats.totalInstitutions,
      description: "Validated university admins",
      icon: <Building2 className="w-5 h-5 text-amber-600" />,
      color: "bg-amber-50 text-amber-900 border-amber-100",
      action: "Manage Directory",
      tab: "institutions"
    },
    {
      id: "stats-apps",
      title: "Active Applications",
      value: stats.activeApplications,
      description: "Subject matter screening",
      icon: <FileCheck2 className="w-5 h-5 text-blue-600" />,
      color: "bg-blue-50 text-blue-900 border-blue-100",
      action: "Track Assessments",
      tab: "accreditation"
    },
    {
      id: "stats-accr",
      title: "Accredited Programs",
      value: stats.approvedAccreditations,
      description: "ASG-QA gold standard",
      icon: <Award className="w-5 h-5 text-emerald-600" />,
      color: "bg-emerald-50 text-emerald-900 border-emerald-100",
      action: "View Approved Standards",
      tab: "accreditation"
    },
    {
      id: "stats-cred",
      title: "Verifiable Diplomas",
      value: stats.verifiedCredentials,
      description: "Cryptographically sealed",
      icon: <ShieldCheck className="w-5 h-5 text-purple-600" />,
      color: "bg-purple-50 text-purple-900 border-purple-100",
      action: "Verify Graduate",
      tab: "credentials"
    }
  ];

  return (
    <div className="space-y-8" id="dashboard-stats-container">
      {/* Visual Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <div 
            key={card.id} 
            id={card.id}
            className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden group flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${card.color.split(" ")[0]} border`}>
                  {card.icon}
                </div>
                <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
                  {card.value}
                </span>
              </div>
              <h3 className="font-semibold text-slate-800 text-sm mb-1">{card.title}</h3>
              <p className="text-xs text-slate-500 mb-4">{card.description}</p>
            </div>
            
            <button 
              onClick={() => onNavigate(card.tab)}
              className="text-xs font-semibold text-slate-700 hover:text-amber-700 flex items-center gap-1 group/btn mt-2 border-t border-slate-50 pt-3 transition-colors align-bottom"
            >
              {card.action}
              <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
            </button>
          </div>
        ))}
      </div>

      {/* Main Educational Information Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Core mission */}
        <div id="mission-card" className="bg-slate-900 text-white p-8 rounded-3xl relative overflow-hidden lg:col-span-2 shadow-lg flex flex-col justify-between min-h-[320px]">
          {/* Decorative background circle */}
          <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full bg-amber-600/10 blur-2xl" />
          <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-emerald-600/10 blur-3xl" />
          
          <div className="relative space-y-4">
            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs px-3 py-1.5 rounded-full font-semibold uppercase tracking-wider inline-flex items-center gap-1">
              <Globe2 className="w-3.5 h-3.5" /> AHEC Framework Core
            </span>
            <h2 className="text-2xl lg:text-3xl font-bold font-display tracking-tight text-slate-100">
              Unifying Higher Education Quality Across member nations
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed max-w-2xl">
              The African Higher Education Commission (AHEC) streamlines the accreditation evaluation process through digital self-appraisal guides, providing unified oversight against regional **ASG-QA standards**. By implementing modern cryptographic ledger registers, we secure graduate digital degrees to prevent credentials fraud and ease continental academic mobility.
            </p>
          </div>

          <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-800 pt-6 mt-6">
            <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800/30">
              <span className="text-xs text-slate-400">Regional Standard</span>
              <p className="text-sm font-semibold text-amber-400">ASG-QA Framework</p>
            </div>
            <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800/30">
              <span className="text-xs text-slate-400">Lead Security</span>
              <p className="text-sm font-semibold text-emerald-400">Verifiable Ledger Signatures</p>
            </div>
            <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800/30">
              <span className="text-xs text-slate-400">Participating Nations</span>
              <p className="text-sm font-semibold text-slate-200">54 Continental Members</p>
            </div>
          </div>
        </div>

        {/* Support widget side-panel */}
        <div id="support-widget" className="bg-white border border-slate-100 p-8 rounded-3xl shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
          <div className="space-y-4">
            <div className="p-3 bg-amber-50 rounded-2xl w-fit border border-amber-100">
              <HelpCircle className="w-6 h-6 text-amber-700" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 font-display">AHEC Technical Secretariat</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Facing difficulties registering your high education institution or generating degree signatures? Our technical team provides fast-track assistance for university registrars and administration desks.
            </p>
            
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Hotline Inquiry:</span>
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">Online</span>
              </div>
              <p className="text-lg font-bold text-slate-900 tracking-tight font-mono select-all flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-amber-600" />
                0970643745
              </p>
              <div className="text-[10px] text-slate-400 font-sans">
                AHEC Technical support desk is operational standard UTC hours.
              </div>
            </div>
          </div>

          <button 
            onClick={() => onNavigate("support")}
            className="w-full mt-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold tracking-wide transition-all shadow-xs inline-flex items-center justify-center gap-1.5"
          >
            Access Support Hub
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Member country map list */}
      <div id="member-nations" className="bg-white border border-slate-100 p-8 rounded-3xl shadow-xs">
        <h3 className="font-display font-semibold text-slate-800 mb-6 flex items-center gap-2">
          <Globe2 className="w-5 h-5 text-amber-600" /> Member Nations Accreditation Statistics
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { name: "Kenya", code: "KE", active: 1, accredited: 18, flag: "🇰🇪" },
            { name: "Nigeria", code: "NG", active: 1, accredited: 34, flag: "🇳🇬" },
            { name: "Ghana", code: "GH", active: 1, accredited: 21, flag: "🇬🇭" },
            { name: "South Africa", code: "ZA", active: 0, accredited: 45, flag: "🇿🇦" },
            { name: "Uganda", code: "UG", active: 1, accredited: 14, flag: "🇺🇬" },
            { name: "Ethiopia", code: "ET", active: 0, accredited: 12, flag: "🇪🇹" },
            { name: "Rwanda", code: "RW", active: 0, accredited: 9, flag: "🇷🇼" },
            { name: "Zambia", code: "ZM", active: 0, accredited: 11, flag: "🇿🇲" },
            { name: "Egypt", code: "EG", active: 0, accredited: 28, flag: "🇪🇬" },
            { name: "Morocco", code: "MA", active: 0, accredited: 17, flag: "🇲🇦" },
            { name: "Senegal", code: "SN", active: 0, accredited: 8, flag: "🇸🇳" },
            { name: "Cameroon", code: "CM", active: 0, accredited: 13, flag: "🇨🇲" }
          ].map((nation) => (
            <div 
              key={nation.code}
              className="border border-slate-100 p-3.5 rounded-2xl hover:border-amber-200 hover:bg-slate-50/50 transition-colors flex flex-col justify-between"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl" role="img" aria-label={nation.name}>{nation.flag}</span>
                <span className="font-semibold text-slate-800 text-xs truncate">{nation.name}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-400">
                <span>Accredited: <strong className="text-slate-700">{nation.accredited}</strong></span>
                {nation.active > 0 && <span className="bg-amber-100 text-amber-800 font-semibold px-1 py-0.2 rounded">1 Pending</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
