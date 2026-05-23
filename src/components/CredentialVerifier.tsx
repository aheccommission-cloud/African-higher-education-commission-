import React, { useState } from "react";
import { 
  ShieldCheck, 
  Search, 
  Sparkles, 
  CheckCircle, 
  XOctagon, 
  Award, 
  Send,
  Lock,
  Building2,
  CalendarCheck
} from "lucide-react";
import { AcademicCredential, Institution } from "../types";

interface CredentialVerifierProps {
  credentials: AcademicCredential[];
  institutions: Institution[];
  onSealCredential: (newCred: AcademicCredential) => Promise<void>;
}

export default function CredentialVerifier({ 
  credentials, 
  institutions, 
  onSealCredential 
}: CredentialVerifierProps) {
  
  const [subTab, setSubTab] = useState<"verify" | "seal">("verify");
  
  // Verify states
  const [query, setQuery] = useState("");
  const [searchResult, setSearchResult] = useState<{ found: boolean; credential?: AcademicCredential; message?: string } | null>(null);
  const [searching, setSearching] = useState(false);

  // Seal states
  const [studentName, setStudentName] = useState("");
  const [selectedInstId, setSelectedInstId] = useState(institutions[0]?.id || "");
  const [degree, setDegree] = useState("");
  const [gradYear, setGradYear] = useState<number>(2025);
  const [isSealing, setIsSealing] = useState(false);
  const [sealDone, setSealDone] = useState(false);
  const [sealResult, setSealResult] = useState<AcademicCredential | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setSearching(true);
    setSearchResult(null);

    try {
      const response = await fetch(`/api/credentials/verify/${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error("Verification gateway failure.");
      const data = await response.json();
      setSearchResult(data);
    } catch (err) {
      setSearchResult({ found: false, message: "Credential network gateway currently offline. Try again." });
    } finally {
      setSearching(false);
    }
  };

  const handleSeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !degree) return;

    setIsSealing(true);
    setSealDone(false);

    try {
      const response = await fetch("/api/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName,
          institutionId: selectedInstId,
          degree,
          graduationYear: gradYear
        })
      });

      if (!response.ok) throw new Error("Sealing ledger registration fail.");
      const newCred = await response.json();
      
      onSealCredential(newCred); // update parent React list
      setSealResult(newCred);
      setSealDone(true);
      
      // Reset
      setStudentName("");
      setDegree("");
    } catch (err) {
      alert("Registration failed: " + err);
    } finally {
      setIsSealing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="credential-center">
      
      {/* Selector Navigation inside credentials */}
      <div className="lg:col-span-12 flex bg-white p-2 rounded-2xl border border-slate-100 max-w-md">
        <button 
          onClick={() => { setSubTab("verify"); setSearchResult(null); }}
          className={`flex-1 py-2 rounded-xl text-xs uppercase tracking-wider font-semibold transition-all ${subTab === "verify" ? "bg-amber-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-800"}`}
        >
          Verify Degree Credential
        </button>
        <button 
          onClick={() => { setSubTab("seal"); setSealDone(false); }}
          className={`flex-1 py-2 rounded-xl text-xs uppercase tracking-wider font-semibold transition-all ${subTab === "seal" ? "bg-amber-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-800"}`}
        >
          Seal & Sign (Admins Only)
        </button>
      </div>

      {subTab === "verify" && (
        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* SEARCH TRIGGER */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100 w-fit">
                <ShieldCheck className="w-6 h-6 text-amber-600" />
              </div>

              <div>
                <h3 className="font-display font-bold text-lg text-slate-800 leading-snug">
                  Secured academic Verification Engine
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Validate the digital seal of degrees issued by AHEC member nation universities. Search using the uniquely assigned Student ID, full legal name, or exact cryptographic hash.
                </p>
              </div>

              <form onSubmit={handleVerify} className="space-y-3">
                <div className="relative">
                  <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                  <input 
                    type="text"
                    required
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search e.g. Musa Kiprop, or AHEC-NG..."
                    className="w-full pl-11 pr-4 py-3 border border-slate-200 focus:outline-hidden text-xs rounded-xl focus:border-amber-500 bg-slate-50/50"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={searching}
                  className="w-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold py-2.5 rounded-xl transition-all disabled:opacity-50"
                >
                  {searching ? "Consulting Continental Ledger..." : "Search Ledger Registry"}
                </button>
              </form>
            </div>

            {/* Quick Helper with suggestions */}
            <div className="mt-8 border-t border-slate-50 pt-4">
              <span className="text-[10px] text-slate-400 font-mono block mb-2">TRY MOCK LEDGER RECORDS:</span>
              <div className="flex flex-wrap gap-2 text-[10px] font-semibold text-slate-600">
                <button onClick={() => setQuery("Musa Kiprop")} className="bg-slate-100 px-2.5 py-1 rounded-md hover:bg-slate-200">"Musa Kiprop"</button>
                <button onClick={() => setQuery("AHEC-NG-2024-3382")} className="bg-slate-100 px-2.5 py-1 rounded-md hover:bg-slate-200">"AHEC-NG-2024-3382"</button>
                <button onClick={() => setQuery("Kwame Boateng")} className="bg-slate-100 px-2.5 py-1 rounded-md hover:bg-slate-200">"Kwame Boateng"</button>
              </div>
            </div>
          </div>

          {/* VERIFY RESULTS */}
          <div className="space-y-4">
            {searchResult ? (
              searchResult.found && searchResult.credential ? (
                <div className="bg-emerald-50/40 border border-emerald-200 rounded-3xl p-6 text-xs text-emerald-900 space-y-4">
                  <div className="flex items-center gap-2 border-b border-emerald-200 pb-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <div>
                      <span className="text-[10px] uppercase font-mono text-emerald-600 font-bold">Verification Succeeded</span>
                      <h4 className="font-bold text-slate-800">Authentic AHEC Signature Found</h4>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] text-emerald-700 font-mono">GRADUATED STUDENT:</span>
                      <p className="font-bold text-slate-900 mt-0.5">{searchResult.credential.studentName}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-700 font-mono">ACCREDITED QUALIFICATION:</span>
                      <p className="font-bold text-slate-900 mt-0.5">{searchResult.credential.degree}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-700 font-mono">MEMBER INSTITUTION:</span>
                      <p className="font-bold text-slate-900 mt-0.5">{searchResult.credential.institutionName}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-700 font-mono">CONFERENCE YEAR:</span>
                      <p className="font-bold text-slate-900 mt-0.5">{searchResult.credential.graduationYear}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-white/80 rounded-xl border border-emerald-100 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono text-zinc-400 uppercase">Cryptographic Seal Signature:</span>
                      <span className="bg-emerald-100 text-[10px] text-emerald-800 font-semibold px-2 py-0.5 rounded">Sealed File Verified</span>
                    </div>
                    <p className="font-mono text-[9px] text-slate-500 break-all select-all">{searchResult.credential.digitalSignature}</p>
                    
                    <div className="border-t border-emerald-100 pt-2 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Authority: {searchResult.credential.sealedBy}</span>
                      <span>Sealed: {searchResult.credential.dateSealed}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50/50 border border-red-200 rounded-3xl p-6 text-xs text-red-950 space-y-2">
                  <div className="flex items-start gap-2">
                    <XOctagon className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <strong className="block text-slate-800">Record verification mismatch</strong>
                      <p className="text-slate-500 mt-1">
                        {searchResult.message || "No degree alignment found matching this code inside AHEC database."}
                      </p>
                    </div>
                  </div>
                </div>
              )
            ) : (
              <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-12 text-center text-slate-400 text-xs h-full flex flex-col justify-center items-center">
                <Award className="w-8 h-8 text-slate-300 mb-2 animate-pulse" />
                <span>Search results will instantly display ledger audit matches.</span>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ADMINS ONLY: SEAL NEW DEGREE FORM */}
      {subTab === "seal" && (
        <div className="lg:col-span-12 max-w-2xl mx-auto w-full bg-white border border-slate-100 rounded-3xl p-8 shadow-xs">
          
          <div className="mb-6 space-y-1">
            <h3 className="font-display font-bold text-lg text-slate-800 flex items-center gap-1.5 ">
              <Lock className="w-5 h-5 text-slate-600" /> Seal New Graduate Digital Degree
            </h3>
            <p className="text-xs text-slate-500">
              Only authorized African Higher Education Commission university registrars may seal and broadcast new diplomas across the secure continental ledger network.
            </p>
          </div>

          {sealDone && sealResult ? (
            <div className="bg-emerald-50/40 p-6 rounded-2xl border border-emerald-200 space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
                <h4 className="font-bold text-slate-800 text-sm">Graduate Sealed Successfully</h4>
              </div>

              <div className="p-4 bg-white rounded-xl border border-emerald-100 text-xs">
                <p className="text-slate-400 uppercase font-mono text-[9px]">BROADCAST STAMP ID:</p>
                <p className="font-semibold text-slate-800 mb-2">{sealResult.id}</p>
                
                <p className="text-slate-400 uppercase font-mono text-[9px]">SECURE CRYPTO HASH:</p>
                <p className="font-mono text-[10px] text-slate-500 break-all select-all">{sealResult.digitalSignature}</p>
              </div>

              <button 
                onClick={() => setSealDone(false)}
                className="text-xs font-semibold text-amber-700 underline text-center block mx-auto"
              >
                Seal another student record
              </button>
            </div>
          ) : (
            <form onSubmit={handleSeal} className="space-y-4">
              
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Student Legal Name</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Cynthia Musonda"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full p-2.5 focus:outline-hidden rounded-xl border border-slate-200 text-xs focus:border-amber-500 font-sans"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Member Institution</label>
                  <select 
                    value={selectedInstId}
                    onChange={(e) => setSelectedInstId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:outline-hidden"
                  >
                    {institutions.map(inst => (
                      <option key={inst.id} value={inst.id}>{inst.name} ({inst.country})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Accreidted Degree Awarded</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. B.Sc. Electrical Engineering"
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    className="w-full p-2.5 focus:outline-hidden rounded-xl border border-slate-200 text-xs focus:border-amber-500 font-sans"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Graduation & Sealing Year</label>
                <select 
                  value={gradYear}
                  onChange={(e) => setGradYear(parseInt(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:outline-hidden"
                >
                  <option value="2026">2026 (Current Academic Cycle)</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                </select>
              </div>

              <button 
                type="submit"
                disabled={isSealing}
                className="w-full mt-2 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold transition-all shadow-xs flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                {isSealing ? "Generating cryptographic seal signature..." : "Generate Cryptographic Seal & Register"}
              </button>
            </form>
          )}

        </div>
      )}

    </div>
  );
}
