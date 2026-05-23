import React, { useState } from "react";
import { 
  FileEdit, 
  Search, 
  Cpu, 
  Hourglass, 
  CheckCircle, 
  AlertCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  ShieldAlert,
  MapPin,
  ClipboardList
} from "lucide-react";
import { AHECApplication, Institution, EvaluationResult } from "../types";

interface AccreditationTrackerProps {
  applications: AHECApplication[];
  institutions: Institution[];
  onSubmitApplication: (appData: { institutionId: string; programName: string; level: string; syllabus: string }) => Promise<void>;
  onPerformSimulatedUpdate: (appId: string, nextStage: string, note: string) => void;
  isLoading: boolean;
}

export default function AccreditationTracker({ 
  applications, 
  institutions, 
  onSubmitApplication, 
  onPerformSimulatedUpdate,
  isLoading 
}: AccreditationTrackerProps) {
  
  // Tab states for inside accreditation panel
  const [activeSubTab, setActiveSubTab] = useState<"list" | "submit" | "audit">("list");
  const [selectedApp, setSelectedApp] = useState<AHECApplication | null>(applications[0] || null);
  
  // Submit new program states
  const [selectedInstId, setSelectedInstId] = useState(institutions[0]?.id || "");
  const [programName, setProgramName] = useState("");
  const [level, setLevel] = useState("Undergraduate");
  const [syllabus, setSyllabus] = useState("");
  const [formDone, setFormDone] = useState(false);
  const [formError, setFormError] = useState("");

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");

  // AI Appraisal State
  const [aiResult, setAiResult] = useState<EvaluationResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  const handleCreateApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!programName || !syllabus) {
      setFormError("Programme specifications and curriculum breakdown are strictly required.");
      return;
    }

    try {
      setFormError("");
      await onSubmitApplication({
        institutionId: selectedInstId,
        programName,
        level,
        syllabus
      });
      setFormDone(true);
      setProgramName("");
      setSyllabus("");
      
      // Auto switch back to list
      setTimeout(() => {
        setActiveSubTab("list");
        setFormDone(false);
      }, 2000);
    } catch (err: any) {
      setFormError("Failed to submit program: " + err.message);
    }
  };

  const handleRunAiAudit = async (app: AHECApplication) => {
    setAiLoading(true);
    setAiError("");
    setAiResult(null);

    try {
      const response = await fetch("/api/gemini/evaluate-accreditation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          programName: app.programName,
          level: app.level,
          curriculumSyllabus: `Self-appraisal syllabus with initial readiness status: ${app.level} curriculum matching AHEC standards under member nation parameters. Initial Readiness: ${app.readinessScore}%`,
          country: app.country,
          institutionName: app.institutionName
        })
      });

      if (!response.ok) {
        throw new Error("Secret API Key or service communication failed.");
      }

      const result = await response.json();
      if (result.error) {
        throw new Error(result.error);
      }

      setAiResult(result.evaluation);
    } catch (err: any) {
      setAiError(err.message || "An error occurred compiling the AI accreditation review.");
    } finally {
      setAiLoading(false);
    }
  };

  const promoteStage = (app: AHECApplication) => {
    // Stage logic: Initial Screening -> Expert Committee Review -> Site Inspection Visit -> Commission Final Decision -> Accredited
    let nextStage = "";
    let note = "";
    if (app.currentStage === "Initial Screening") {
      nextStage = "Expert Committee Review";
      note = "Document check cleared. Progressing to technical advisory syllabus appraisal.";
    } else if (app.currentStage === "Expert Committee Review") {
      nextStage = "Site Inspection Visit";
      note = "Academic syllabus evaluated score of 85. Site inspection logistics configured.";
    } else if (app.currentStage === "Site Inspection Visit") {
      nextStage = "Commission Final Decision";
      note = "Laboratory facilities and faculty boards analyzed. File submitted for Commissioner signature.";
    } else {
      nextStage = "Accredited & Final Approved";
      note = "Verified successfully. Full regional accreditation granted for standard 6-year period.";
    }
    onPerformSimulatedUpdate(app.id, nextStage, note);
    
    // Refresh the selectedApp pointer in UI
    setTimeout(() => {
      const updated = applications.find(a => a.id === app.id);
      if (updated) setSelectedApp(updated);
    }, 100);
  };

  const filteredApps = applications.filter((app) => 
    app.programName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.institutionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="accreditation-panel">
      {/* Control panel & Navigation */}
      <div className="lg:col-span-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100">
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => { setActiveSubTab("list"); setAiResult(null); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${activeSubTab === "list" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
          >
            Syllabus Audits ({applications.length})
          </button>
          <button 
            onClick={() => { setActiveSubTab("submit"); setAiResult(null); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${activeSubTab === "submit" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
          >
            + Register New Program
          </button>
        </div>

        {activeSubTab === "list" && (
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input 
              type="text"
              placeholder="Filter by country, programme..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 rounded-xl border border-slate-200 text-xs w-full focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-slate-50/50"
            />
          </div>
        )}
      </div>

      {/* Renders dynamic application lists */}
      {activeSubTab === "list" && (
        <>
          <div className="lg:col-span-5 space-y-4">
            <h3 className="font-display font-bold text-slate-800 text-sm italic">Accreditation Queue</h3>
            
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {filteredApps.length === 0 ? (
                <div className="bg-white border border-dashed border-slate-200 p-8 rounded-2xl text-center text-slate-400 text-xs">
                  No active application matching filter criteria.
                </div>
              ) : (
                filteredApps.map((app) => (
                  <div 
                    key={app.id}
                    onClick={() => { setSelectedApp(app); setAiResult(null); }}
                    className={`p-5 rounded-2xl transition-all border cursor-pointer ${selectedApp?.id === app.id ? "bg-amber-50/40 border-amber-300 shadow-xs" : "bg-white border-slate-100 hover:border-slate-300"}`}
                  >
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <span className="text-[10px] text-zinc-400 font-mono tracking-wider">{app.id}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        app.status === "Approved" ? "bg-emerald-100 text-emerald-800" :
                        app.status === "Pending" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                      }`}>
                        {app.currentStage}
                      </span>
                    </div>

                    <h4 className="font-semibold text-slate-800 text-xs line-clamp-2 mb-1">{app.programName}</h4>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1">
                      <span>{app.institutionName}</span> • <span className="italic">{app.country}</span>
                    </p>

                    <div className="flex justify-between items-center mt-4 border-t border-slate-50 pt-3">
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Submitted {app.submissionDate}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-500">Readiness:</span>
                        <span className="text-xs font-bold text-slate-700 font-mono">{app.readinessScore}%</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Inspect View Details */}
          <div className="lg:col-span-7">
            {selectedApp ? (
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-6">
                
                {/* Header Information */}
                <div className="border-b border-slate-100 pb-5">
                  <div className="flex items-center gap-2 text-xs text-amber-700 font-semibold mb-1">
                    <MapPin className="w-3.5 h-3.5" /> AHEC Commission Division: {selectedApp.country}
                  </div>
                  <h2 className="text-xl font-bold font-display text-slate-800 mb-1 leading-snug">
                    {selectedApp.programName}
                  </h2>
                  <p className="text-xs text-slate-500 font-semibold">
                    {selectedApp.institutionName} • Level: {selectedApp.level}
                  </p>
                </div>

                {/* Stepper tracking */}
                <div className="space-y-4">
                  <h3 className="font-display font-semibold text-slate-700 text-xs tracking-wider uppercase">
                    Stage Process (Real-Time Synchronizer Check)
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                    {[
                      { stage: "Initial Screening", label: "Screening" },
                      { stage: "Expert Committee Review", label: "Expert Committee" },
                      { stage: "Site Inspection Visit", label: "Site Inspection" },
                      { stage: "Commission Final Decision", label: "Commission Decree" }
                    ].map((step, idx) => {
                      // Determine status of state step
                      const stages = ["Initial Screening", "Expert Committee Review", "Site Inspection Visit", "Commission Final Decision"];
                      const currentIdx = stages.indexOf(selectedApp.currentStage);
                      const stepIdx = stages.indexOf(step.stage);

                      let stepStatus = "upcoming";
                      if (stepIdx < currentIdx) stepStatus = "completed";
                      else if (stepIdx === currentIdx) {
                        stepStatus = selectedApp.status === "Approved" ? "completed" : "active";
                      }

                      return (
                        <div 
                          key={step.stage}
                          className={`p-3 rounded-xl border flex flex-col justify-between ${
                            stepStatus === "completed" ? "bg-emerald-50/50 border-emerald-200 text-emerald-950" :
                            stepStatus === "active" ? "bg-amber-50/80 border-amber-300 text-amber-900 glow-pill" :
                            "bg-slate-50/50 border-slate-100 text-slate-400"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-mono font-bold">0{idx + 1}</span>
                            {stepStatus === "completed" ? (
                              <CheckCircle className="w-4 h-4 text-emerald-600" />
                            ) : stepStatus === "active" ? (
                              <Hourglass className="w-4 h-4 text-amber-600 animate-spin" style={{ animationDuration: '6s' }} />
                            ) : (
                              <Clock className="w-4 h-4 text-slate-300" />
                            )}
                          </div>
                          <span className="text-[11px] font-bold tracking-tight block sm:truncate">{step.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Audit Checklist and Simulated Controls */}
                <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 space-y-4">
                  <h4 className="font-display font-semibold text-xs text-slate-700 flex items-center gap-1.5 uppercase">
                    <ClipboardList className="w-4 h-4 text-slate-500" /> ASG-QA Evaluation Checklist
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                    <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100">
                      <span className="text-slate-500">1. Faculty Board Ratios:</span>
                      <span className="font-semibold text-slate-700">{selectedApp.criteriaEvaluation.facultyAccreditation}</span>
                    </div>
                    <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100">
                      <span className="text-slate-500">2. Curriculum Standards:</span>
                      <span className="font-semibold text-slate-700">{selectedApp.criteriaEvaluation.curriculumQuality}</span>
                    </div>
                    <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100">
                      <span className="text-slate-500">3. Infrastructure Audit:</span>
                      <span className="font-semibold text-slate-700">{selectedApp.criteriaEvaluation.infrastructureAdequacy}</span>
                    </div>
                    <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100">
                      <span className="text-slate-500">4. Support Logistics:</span>
                      <span className="font-semibold text-slate-700">{selectedApp.criteriaEvaluation.studentSupport}</span>
                    </div>
                  </div>

                  {/* Operational status log note */}
                  <div className="p-3.5 bg-sky-50 text-sky-950 rounded-xl border border-sky-100 text-xs">
                    <strong className="block text-sky-900 mb-0.5">Latest Evaluator Log:</strong>
                    <span>{selectedApp.history.find(h => h.stage === selectedApp.currentStage)?.note || "Awaiting processing queue check."}</span>
                  </div>

                  {/* Simulator controller (Interactive for evaluation) */}
                  {selectedApp.status !== "Approved" && (
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button 
                        onClick={() => promoteStage(selectedApp)}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1"
                      >
                        Advance Audit Stage <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Gemini AI Assistant Section */}
                <div className="border-t border-slate-100 pt-6 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gradient-to-r from-amber-50 to-orange-50/50 p-4 rounded-2xl border border-amber-100">
                    <div className="space-y-1">
                      <h4 className="font-display font-semibold text-xs text-amber-950 flex items-center gap-1.5 uppercase tracking-wide">
                        <Cpu className="w-4 h-4 text-amber-600" /> AHEC Expert Curriculum Appraisal
                      </h4>
                      <p className="text-[11px] text-amber-800">
                        Synthesize & review matching ASG-QA standard specifications instantly with Gemini.
                      </p>
                    </div>
                    
                    <button 
                      onClick={() => handleRunAiAudit(selectedApp)}
                      disabled={aiLoading}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50"
                    >
                      {aiLoading ? "Running Audit..." : "Run AI Curriculum Appraisal"}
                      <Cpu className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {aiError && (
                    <div className="bg-red-50 text-red-950 p-4 rounded-xl text-xs border border-red-100 flex items-start gap-2">
                      <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Appraisal Failure: </strong>
                        <span>{aiError}</span>
                      </div>
                    </div>
                  )}

                  {aiLoading && (
                    <div className="p-8 border border-slate-100 rounded-3xl text-center space-y-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-600 border-t-transparent mx-auto" />
                      <div className="space-y-1">
                        <p className="text-xs text-slate-600 font-semibold animate-pulse">Gemini AI analyzing course descriptors against African QA framework...</p>
                        <p className="text-[10px] text-slate-400">Benchmarking faculty, credits load, syllabus prerequisites, and continental compliance.</p>
                      </div>
                    </div>
                  )}

                  {aiResult && (
                    <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-6 space-y-4">
                      <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                        <div>
                          <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Gemini Advisory Report</span>
                          <h4 className="text-sm font-bold text-slate-800">ASG-QA Pre-Audit Assessment</h4>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-slate-400">Readiness Score</span>
                          <p className="text-lg font-mono font-bold text-amber-700">{aiResult.readinessScore}/100</p>
                        </div>
                      </div>

                      {/* Strengths / Gaps grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 space-y-2">
                          <strong className="text-emerald-900 block font-display">Identified Strengths:</strong>
                          <ul className="list-disc list-inside space-y-1 text-emerald-950">
                            {aiResult.curriculumStrengths.map((str, idx) => (
                              <li key={idx}>{str}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-red-50/50 p-4 rounded-xl border border-red-100 space-y-2">
                          <strong className="text-red-900 block font-display">Improvement Curriclum Gaps:</strong>
                          <ul className="list-disc list-inside space-y-1 text-red-950">
                            {aiResult.curriculumGaps.map((gap, idx) => (
                              <li key={idx}>{gap}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="text-xs bg-white p-4.5 rounded-xl border border-slate-200 space-y-2">
                        <strong className="text-slate-800 font-display block">Actionable Advisory Steps:</strong>
                        <ul className="list-decimal list-inside space-y-1.5 text-slate-600 leading-relaxed">
                          {aiResult.recommendations.map((rec, idx) => (
                            <li key={idx}>{rec}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="text-[11px] text-amber-800 bg-amber-50 p-3 rounded-lg flex items-center gap-1.5 border border-amber-100">
                        <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>This advisory assessment is powered by Gemini and acts as standard guidance prior to peer site audit visits.</span>
                      </div>
                    </div>
                  )}

                </div>

              </div>
            ) : (
              <div className="bg-white border border-slate-100 p-12 rounded-3xl text-center text-slate-400 text-xs">
                Select an application from the queue to run appraisal diagnostics.
              </div>
            )}
          </div>
        </>
      )}

      {/* Renders program registration form */}
      {activeSubTab === "submit" && (
        <div className="lg:col-span-12 max-w-2xl mx-auto w-full bg-white border border-slate-100 rounded-3xl p-8 shadow-xs">
          
          <div className="mb-6 space-y-1">
            <h3 className="font-display font-bold text-lg text-slate-800">Register New Academic Program</h3>
            <p className="text-xs text-slate-500">
              Submit your curriculum syllabus description to trigger real-time ASG-QA tracking and AHEC ledger registration checks.
            </p>
          </div>

          {formDone ? (
            <div className="bg-emerald-50 text-emerald-950 p-6 rounded-2xl border border-emerald-100 text-center space-y-2 py-8">
              <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
              <strong className="text-sm block">Program Registration Succeeded</strong>
              <p className="text-xs">Syllabus queued for administrative review. Re-routing back to appraisal dashboard...</p>
            </div>
          ) : (
            <form onSubmit={handleCreateApp} className="space-y-4">
              {formError && (
                <div className="bg-red-50 text-red-950 p-3 rounded-xl text-xs border border-red-100">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Submitting Institution</label>
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
                  <label className="text-xs font-semibold text-slate-700">Academic Qualification Level</label>
                  <select 
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:outline-hidden"
                  >
                    <option value="Undergraduate">Bachelor / Undergraduate Degree</option>
                    <option value="Postgraduate">M.Sc / Postgraduate Diploma</option>
                    <option value="Doctorate">Ph.D / Doctorate Program</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Programme Name</label>
                <input 
                  type="text"
                  placeholder="e.g. B.Sc. in Climate Resilience Engineering"
                  value={programName}
                  onChange={(e) => setProgramName(e.target.value)}
                  className="w-full p-2.5 focus:outline-hidden rounded-xl border border-slate-200 text-xs focus:border-amber-500 font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 flex justify-between">
                  <span>Syllabus breakdown (Course modules / Faculty resources)</span>
                  <span className="text-[10px] text-amber-700 font-mono">ASG-QA Checklist Target</span>
                </label>
                <textarea 
                  rows={6}
                  placeholder="Detail the curriculum modules, credits allocation, prerequisites, and evaluation methodologies. This descriptor will be reviewed by the AI advisory model."
                  value={syllabus}
                  onChange={(e) => setSyllabus(e.target.value)}
                  className="w-full p-3 focus:outline-hidden rounded-xl border border-slate-200 text-xs focus:border-amber-500 font-mono"
                />
              </div>

              <button 
                type="submit"
                className="w-full mt-2 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold tracking-wide transition-all shadow-xs"
              >
                File Registrar Application & Request Review
              </button>
            </form>
          )}

        </div>
      )}

    </div>
  );
}
