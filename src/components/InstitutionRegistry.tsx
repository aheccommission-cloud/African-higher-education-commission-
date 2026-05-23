import React, { useState } from "react";
import { 
  Building2, 
  MapPin, 
  Mail, 
  Phone, 
  UserCheck, 
  Globe, 
  Search,
  CheckCircle,
  Clock,
  ExternalLink
} from "lucide-react";
import { Institution } from "../types";

interface InstitutionRegistryProps {
  institutions: Institution[];
  onRegisterInstitution: (instData: { name: string; country: string; code: string; adminEmail: string; contact: string }) => Promise<void>;
}

export default function InstitutionRegistry({ 
  institutions, 
  onRegisterInstitution 
}: InstitutionRegistryProps) {
  
  const [activeTab, setActiveTab] = useState<"directory" | "register">("directory");
  
  // Registration Form States
  const [name, setName] = useState("");
  const [country, setCountry] = useState("Kenya");
  const [code, setCode] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [contact, setContact] = useState("");
  
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [search, setSearch] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !adminEmail) {
      setErrorMsg("University name and administration email are required.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      await onRegisterInstitution({
        name,
        country,
        code: code || name.substring(0, 3).toUpperCase(),
        adminEmail,
        contact
      });
      setSuccess(true);
      setName("");
      setCode("");
      setAdminEmail("");
      setContact("");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to catalog institution. Please confirm connection details.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredInstitutions = institutions.filter(i => 
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.country.toLowerCase().includes(search.toLowerCase()) ||
    i.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="institution-registry-sub">
      
      {/* Tab Selectors */}
      <div className="lg:col-span-12 flex bg-white p-2 rounded-2xl border border-slate-100 max-w-md">
        <button 
          onClick={() => { setActiveTab("directory"); setSuccess(false); }}
          className={`flex-1 py-2 rounded-xl text-xs uppercase tracking-wider font-semibold transition-all ${activeTab === "directory" ? "bg-slate-800 text-white shadow-xs" : "text-slate-600 hover:text-slate-800"}`}
        >
          University Directory ({institutions.length})
        </button>
        <button 
          onClick={() => { setActiveTab("register"); setSuccess(false); }}
          className={`flex-1 py-1.5 rounded-xl text-xs uppercase tracking-wider font-semibold transition-all ${activeTab === "register" ? "bg-slate-800 text-white shadow-xs" : "text-slate-600 hover:text-slate-800"}`}
        >
          Register University
        </button>
      </div>

      {activeTab === "directory" && (
        <>
          <div className="lg:col-span-12 space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="font-display font-bold text-lg text-slate-800">Verified Member Universities</h3>
                <p className="text-xs text-slate-500">Directory of fully authorized institutional desks with cryptographic sealing credentials.</p>
              </div>
              
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 w-4 top-2.5" />
                <input 
                  type="text" 
                  placeholder="Filter directory..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-1.5 rounded-xl border border-slate-200 text-xs w-full focus:outline-hidden focus:border-amber-500 bg-slate-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {filteredInstitutions.map((inst) => (
                <div 
                  key={inst.id}
                  className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs hover:shadow-md hover:border-amber-200 transition-all space-y-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="p-2 bg-slate-50 text-slate-700 rounded-lg border border-slate-100 inline-block font-mono text-[10px] font-bold">
                          {inst.code}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono italic">{inst.id}</span>
                      </div>
                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-100 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <UserCheck className="w-3 h-3 text-emerald-600" /> Verified Authority
                      </span>
                    </div>

                    <h4 className="font-semibold text-slate-800 text-sm mt-3 font-display">{inst.name}</h4>
                    
                    <span className="text-xs text-amber-700 font-semibold flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5" /> {inst.country}
                    </span>
                  </div>

                  <div className="border-t border-slate-50 pt-3 text-[11px] text-slate-500 grid grid-cols-1 sm:grid-cols-2 gap-2 font-sans">
                    <div className="flex items-center gap-1 text-slate-500">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{inst.adminEmail}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-500">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{inst.contact}</span>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-50/50 flex justify-between">
                    <span>Active since {inst.registeredAt}</span>
                    <span className="text-slate-500 flex items-center gap-0.5 pointer-events-none hover:underline">
                      AHEC Catalog <ExternalLink className="w-2.5 h-2.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === "register" && (
        <div className="lg:col-span-12 max-w-2xl mx-auto w-full bg-white border border-slate-100 rounded-3xl p-8 shadow-xs">
          
          <div className="mb-6 space-y-1">
            <h3 className="font-display font-bold text-lg text-slate-800">Catalog Your Institution</h3>
            <p className="text-xs text-slate-500">
              Only authorized government or university administrative boards may submit registrar requests to join the regional Higher Education platform.
            </p>
          </div>

          {success ? (
            <div className="bg-emerald-50 text-emerald-950 p-6 rounded-2xl border border-emerald-100 text-center space-y-2 py-12">
              <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto animate-bounce" />
              <strong className="text-sm block">Institution Board Registered</strong>
              <p className="text-xs">Your administration desk code and cryptographic signing credentials have been generated.</p>
              
              <button 
                onClick={() => { setActiveTab("directory"); setSuccess(false); }}
                className="mt-6 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold"
              >
                Access Director Index
              </button>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              
              {errorMsg && (
                <div className="bg-red-50 text-red-950 p-3 rounded-xl text-xs border border-red-100">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Official University Name</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Copperbelt University"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 focus:outline-hidden rounded-xl border border-slate-200 text-xs focus:border-amber-500 font-sans"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">African Member State</label>
                  <select 
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:outline-hidden"
                  >
                    {["Kenya", "Nigeria", "Ghana", "South Africa", "Uganda", "Ethiopia", "Rwanda", "Zambia", "Egypt", "Morocco", "Senegal", "Cameroon"].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Administrative Desk Initials</label>
                  <input 
                    type="text"
                    maxLength={4}
                    placeholder="e.g. CBU"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="w-full p-2.5 focus:outline-hidden rounded-xl border border-slate-200 text-xs focus:border-amber-500 font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Registry Admin Email Address</label>
                  <input 
                    type="email"
                    required
                    placeholder="e.g. registrar@cbu.edu.zm"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full p-2.5 focus:outline-hidden rounded-xl border border-slate-200 text-xs focus:border-amber-500 font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Technical Support Phone</label>
                  <input 
                    type="text"
                    placeholder="e.g. +260 970643745"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className="w-full p-2.5 focus:outline-hidden rounded-xl border border-slate-200 text-xs focus:border-amber-500 font-sans"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={submitting}
                className="w-full mt-2 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold transition-all shadow-xs"
              >
                {submitting ? "Broadcasting registrars parameters..." : "Broadcasting registrars parameters & catalogs"}
              </button>
            </form>
          )}

        </div>
      )}

    </div>
  );
}
