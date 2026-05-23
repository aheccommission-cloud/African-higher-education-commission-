import React, { useState } from "react";
import { 
  HelpCircle, 
  PhoneCall, 
  Mail, 
  MapPin, 
  Clock, 
  CheckCircle, 
  FileCheck2, 
  Sparkles,
  Copy,
  Check
} from "lucide-react";

export default function SupportSection() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText("0970643745");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const faqs = [
    {
      q: "What is the role of the African Higher Education Commission (AHEC)?",
      a: "AHEC provides a continental quality-assurance framework (ASG-QA) to align and streamline accreditation criteria of tertiary programs across member African Union nations. It also operates the regional digital ledger system to verify the legitimacy of university degrees."
    },
    {
      q: "How does Digital Credential Verification seal degrees?",
      a: "When a student graduates from an accredited member state university, the university's registered administrative board signs the diploma parameters, generating a unique SHA-256 cryptographic verification stamp key broadcast across our directory system. Employers can search by student name or stamp ID to verify degree authenticity instantly."
    },
    {
      q: "Who evaluates academic syllabus submissions?",
      a: "Initial assessment utilizes specialized AI assistants trained on ASG-QA policy criteria, followed by a formal evaluation check by the technical advisory board and and on-site auditor peer visits prior to final Commission resolution."
    },
    {
      q: "How can dynamic updates be accelerated?",
      a: "Administrators can check their interactive applications tracking board in real-time, inspect logging details, or run instant curriculum appraisal audits by utilizing the integrated AI analysis tool."
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="technical-support-centre">
      
      {/* Contact Panel Card */}
      <div className="lg:col-span-4 bg-slate-900 text-white p-8 rounded-3xl relative overflow-hidden flex flex-col justify-between shadow-lg min-h-[440px]">
        {/* Decorative elements */}
        <div className="absolute -right-12 -top-12 w-40 h-40 rounded-full bg-amber-600/10 blur-xl" />
        <div className="absolute -left-12 -bottom-12 w-40 h-40 rounded-full bg-emerald-600/10 blur-xl" />

        <div className="relative space-y-5">
          <span className="bg-amber-500/15 text-amber-400 border border-amber-500/20 text-[10px] font-bold tracking-wider uppercase px-3 py-1.5 rounded-full inline-block">
            Support Headquarters
          </span>
          
          <h3 className="text-xl font-bold font-display text-slate-100">
            AHEC Technical Secretariat Helpdesk
          </h3>

          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Need active support setting up registrar admin channels, sealing graduate credentials, or submitting curricula for evaluation? Our specialized technical secretariat is here to help.
          </p>

          <div className="space-y-3 pt-4 border-t border-slate-800 text-xs">
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px]">OPERATIONAL HOURS</span>
                <span className="font-semibold text-slate-200">Monday - Friday, 07:00 - 17:00 UTC</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px]">ELECTRONIC ENQUIRIES</span>
                <span className="font-semibold text-slate-200">technical-support@ahec-portal.org</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-purple-400 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px]">REGIONAL SEAT</span>
                <span className="font-semibold text-slate-200">AHEC Secretariat HQ, Lusaka, Zambia</span>
              </div>
            </div>
          </div>
        </div>

        {/* Highlighted Hotline */}
        <div className="relative mt-8 bg-slate-800/80 border border-slate-700/50 p-5 rounded-2xl space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-zinc-400 uppercase font-mono">Immediate assistance call:</span>
            <span className="bg-emerald-500/20 text-emerald-400 text-[9px] px-1.5 py-0.2 rounded font-bold uppercase">Online Help Desk</span>
          </div>

          <p className="text-2xl font-bold font-mono tracking-tight text-white flex items-center justify-between">
            <span className="flex items-center gap-1.5 align-middle select-all">
              <PhoneCall className="w-5 h-5 text-amber-500" />
              0970643745
            </span>
            <button 
              onClick={handleCopy}
              className="p-1.5 hover:bg-slate-700 transition-colors text-slate-400 hover:text-white rounded-lg"
              title="Copy details"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </p>
          <div className="text-[10px] text-zinc-400">
            *Standard local and regional carrier rates may apply.
          </div>
        </div>

      </div>

      {/* FAQs Panel */}
      <div className="lg:col-span-8 bg-white border border-slate-100 rounded-3xl p-8 shadow-xs space-y-6">
        <div className="space-y-1">
          <h3 className="font-display font-bold text-lg text-slate-800 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-amber-600" /> Frequently Asked Inquiries
          </h3>
          <p className="text-xs text-slate-500">Essential information regarding accreditation, digital ledger security procedures, and institutional policies.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {faqs.map((faq, idx) => (
            <div 
              key={idx}
              className="p-5 rounded-2xl border border-slate-100 hover:border-amber-200 hover:bg-slate-50/50 transition-all space-y-2 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <span className="p-1 px-2.5 bg-amber-50 rounded-lg text-amber-800 text-[10px] font-mono font-bold uppercase">
                  Criterion 0{idx + 1}
                </span>
                <h4 className="font-bold text-slate-800 text-xs leading-snug">{faq.q}</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed font-sans">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Additional support pattern alert details */}
        <div className="bg-amber-50/50 border border-amber-200/50 p-5 rounded-2xl flex items-start gap-3 mt-6">
          <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-950 space-y-1">
            <strong>Need official Commission circulars or policy documentation?</strong>
            <p className="text-slate-600 leading-relaxed">
              For administrative inquiries, formal appeals against peer audit criteria, or to arrange physical advisory seminars, contact Lusaka regional technical desk at <strong className="text-slate-800 font-mono">0970643745</strong> or dispatch formal memorandum to <strong className="text-slate-800 font-mono">technical-support@ahec-portal.org</strong>.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
