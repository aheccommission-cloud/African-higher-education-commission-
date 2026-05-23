import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Building2, 
  FileCheck2, 
  Award, 
  ShieldCheck, 
  Globe2, 
  HelpCircle,
  PhoneCall, 
  Menu, 
  X,
  Sparkles,
  ExternalLink
} from "lucide-react";

import { 
  Institution, 
  AHECApplication, 
  AcademicCredential, 
  PortalStats 
} from "./types";

import DashboardStats from "./components/DashboardStats";
import AccreditationTracker from "./components/AccreditationTracker";
import CredentialVerifier from "./components/CredentialVerifier";
import InstitutionRegistry from "./components/InstitutionRegistry";
import SupportSection from "./components/SupportSection";

export default function App() {
  const [activeTab, setActiveTab] = useState<"overview" | "accreditation" | "credentials" | "institutions" | "support">("overview");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Core global state registers
  const [stats, setStats] = useState<PortalStats>({
    totalInstitutions: 4,
    activeApplications: 2,
    approvedAccreditations: 1,
    verifiedCredentials: 3,
    memberNationsCount: 54
  });

  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [applications, setApplications] = useState<AHECApplication[]>([]);
  const [credentials, setCredentials] = useState<AcademicCredential[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial memory data from Express server
  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [resStats, resInsts, resApps, resCreds] = await Promise.all([
        fetch("/api/stats").then(r => r.json()),
        fetch("/api/institutions").then(r => r.json()),
        fetch("/api/applications").then(r => r.json()),
        fetch("/api/credentials").then(r => r.json())
      ]);

      setStats(resStats);
      setInstitutions(resInsts);
      setApplications(resApps);
      setCredentials(resCreds);
    } catch (err) {
      console.error("Failed to load initial data registers from AHEC server:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Registry & application trigger submit handlers
  const handleRegisterInstitution = async (instData: { name: string; country: string; code: string; adminEmail: string; contact: string }) => {
    const response = await fetch("/api/institutions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(instData)
    });

    if (!response.ok) {
      throw new Error("Secret key authentication or registry error.");
    }

    // Refresh database stats and listing
    await fetchAllData();
  };

  const handleCreateApplication = async (appData: { institutionId: string; programName: string; level: string; syllabus: string }) => {
    const response = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(appData)
    });

    if (!response.ok) {
      throw new Error("Ledger process submission failure.");
    }

    // Refresh data lists
    await fetchAllData();
  };

  const handleSealCredentialCallback = async (newCred: AcademicCredential) => {
    // Instantly append to list or reload stats
    await fetchAllData();
  };

  // Stepper state promotion handler (Simulated check)
  const handleUpdateStageLog = (appId: string, nextStage: string, note: string) => {
    setApplications(prev => prev.map(app => {
      if (app.id === appId) {
        // Build new history states
        const updatedHistory = app.history.map(h => {
          if (h.stage === app.currentStage) {
            return { ...h, status: "Completed" };
          }
          if (h.stage === nextStage) {
            return { ...h, status: "In Progress", date: new Date().toISOString().split('T')[0], note };
          }
          return h;
        });

        // If accrediting matches finished, update status
        const isApproved = nextStage === "Accredited & Final Approved";
        
        // Define matches
        const draftApp = {
          ...app,
          currentStage: nextStage,
          status: isApproved ? "Approved" : app.status,
          readinessScore: isApproved ? 100 : Math.min(app.readinessScore + 10, 98),
          history: updatedHistory,
          criteriaEvaluation: {
            ...app.criteriaEvaluation,
            facultyAccreditation: nextStage === "Expert Committee Review" ? "Satisfactory" : app.criteriaEvaluation.facultyAccreditation,
            curriculumQuality: nextStage === "Site Inspection Visit" ? "Excellent" : app.criteriaEvaluation.curriculumQuality,
            infrastructureAdequacy: nextStage === "Commission Final Decision" ? "Satisfactory" : app.criteriaEvaluation.infrastructureAdequacy,
            studentSupport: isApproved ? "Excellent" : app.criteriaEvaluation.studentSupport
          }
        };

        // If program approved, trigger visual helper
        return draftApp;
      }
      return app;
    }));

    // Update statistics counter matching approval changes
    setStats(old => ({
      ...old,
      approvedAccreditations: nextStage === "Accredited & Final Approved" ? old.approvedAccreditations + 1 : old.approvedAccreditations
    }));
  };

  const menuItems = [
    { id: "overview", label: "Dashboard Overview", icon: <Globe2 className="w-4 h-4" /> },
    { id: "accreditation", label: "Accreditation Bureau", icon: <FileCheck2 className="w-4 h-4" /> },
    { id: "credentials", label: "Credential Verification", icon: <ShieldCheck className="w-4 h-4" /> },
    { id: "institutions", label: "Member Directory", icon: <Building2 className="w-4 h-4" /> },
    { id: "support", label: "Help & Technical Support", icon: <HelpCircle className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans selection:bg-amber-100 selection:text-amber-900" id="main-panel-container">
      
      {/* HEADER SECTION WITH OFFICIAL LOGO CREST */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40 transition-colors shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* Crest Emblem & Branding */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab("overview")}>
              <img 
                src="/src/assets/images/ahec_crest_1779541407561.png" 
                alt="African Higher Education Commission Crest" 
                className="w-11 h-11 object-contain rounded-xl border border-slate-50 p-0.5 shadow-xs"
                referrerPolicy="no-referrer"
              />
              <div>
                <span className="text-[10px] tracking-widest font-bold text-amber-700 uppercase block font-display">African Commission</span>
                <h1 className="text-sm md:text-base font-bold text-slate-800 tracking-tight leading-none uppercase">Higher Education Commission</h1>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all uppercase flex items-center gap-1.5 ${activeTab === item.id ? "bg-slate-800 text-white shadow-xs" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/50"}`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Support Hotline highlighted */}
            <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-1.5 rounded-xl font-mono text-xs text-slate-700">
              <PhoneCall className="w-3.5 h-3.5 text-amber-600" />
              <span>Technical Help:</span>
              <strong className="text-slate-900 select-all">0970643745</strong>
            </div>

            {/* Mobile Menu Toggle Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900"
              aria-label="Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>

        {/* Mobile menu expanded */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-slate-100 px-4 py-3 space-y-1 shadow-md">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id as any); setIsMobileMenuOpen(false); }}
                className={`w-full text-left px-4 py-3 rounded-lg text-xs font-semibold tracking-wide flex items-center gap-2 ${activeTab === item.id ? "bg-slate-800 text-white" : "text-slate-600 hover:bg-slate-100/60"}`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
            
            <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl font-mono text-xs text-amber-900 mt-2 border border-amber-100">
              <PhoneCall className="w-3.5 h-3.5 text-amber-600" />
              <span>Hotline tech support:</span>
              <strong className="text-amber-950 font-bold">0970643745</strong>
            </div>
          </div>
        )}
      </header>

      {/* MAIN LAYOUT CANVAS */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full" id="portal-inner-content">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-amber-600 border-t-transparent mx-auto" />
            <p className="text-xs text-slate-500 font-semibold animate-pulse">Consulting African Academic Ledger directory...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              {activeTab === "overview" && (
                <DashboardStats stats={stats} onNavigate={setActiveTab as any} />
              )}

              {activeTab === "accreditation" && (
                <AccreditationTracker 
                  applications={applications} 
                  institutions={institutions}
                  onSubmitApplication={handleCreateApplication}
                  onPerformSimulatedUpdate={handleUpdateStageLog}
                  isLoading={loading}
                />
              )}

              {activeTab === "credentials" && (
                <CredentialVerifier 
                  credentials={credentials} 
                  institutions={institutions}
                  onSealCredential={handleSealCredentialCallback}
                />
              )}

              {activeTab === "institutions" && (
                <InstitutionRegistry 
                  institutions={institutions} 
                  onRegisterInstitution={handleRegisterInstitution}
                />
              )}

              {activeTab === "support" && (
                <SupportSection />
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {/* FOOTER SECTION */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-10 mt-16 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <img 
                src="/src/assets/images/ahec_crest_1779541407561.png" 
                alt="AHEC Official Crest Secondary" 
                className="w-8 h-8 object-contain rounded p-0.5 bg-white/10"
                referrerPolicy="no-referrer"
              />
              <span className="font-display font-bold text-slate-200 uppercase tracking-widest text-[11px]">AHEC Secretariat</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Serving the educational councils and accreditation bodies of the 54 African Union partner countries to build secure, transparent, and unified standards.
            </p>
          </div>

          <div className="space-y-2">
            <span className="font-semibold text-slate-200 uppercase font-display block">Technical Support desk</span>
            <p className="text-slate-400 text-[11px]">
              For any urgent technical support requests or system inquiries regarding credentials sealing:
            </p>
            <p className="text-slate-200 font-mono font-bold text-sm tracking-tight select-all flex items-center gap-1.5 pt-1">
              <PhoneCall className="w-3.5 h-3.5 text-amber-500" />
              0970643745
            </p>
          </div>

          <div className="space-y-2">
            <span className="font-semibold text-slate-200 uppercase font-display block">Quick References</span>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <a onClick={() => setActiveTab("overview")} className="hover:text-amber-500 cursor-pointer flex items-center gap-1">
                  ASG-QA Regional Guidelines <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
              <li>
                <a onClick={() => setActiveTab("credentials")} className="hover:text-amber-500 cursor-pointer flex items-center gap-1">
                  Verifiable Graduate Records Ledger <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
              <li>
                <a onClick={() => setActiveTab("support")} className="hover:text-amber-500 cursor-pointer flex items-center gap-1">
                  Technical Secretariat Helpdesk <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800/80 mt-8 pt-4 text-[10px] text-center text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>© 2026 African Higher Education Commission (AHEC). All rights reserved across member nations.</span>
          <span className="bg-slate-800 text-slate-400 px-3 py-1 rounded-full border border-slate-700/50">
            System Status: <strong>All Ledgers Synchronized</strong>
          </span>
        </div>
      </footer>

    </div>
  );
}
