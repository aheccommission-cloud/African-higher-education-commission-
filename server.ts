import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK lazily to avoid crashing if API key is not yet set.
// AHEC's Gemini assistant helps evaluate curriculum syllabi against ASG-QA (African Standards & Guidelines for Quality Assurance)
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    aiClient = new GoogleGenAI({
      apiKey: key || "MOCK_KEY", // fallback to prevent initialization crashes matching guidelines
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Memory database for live interaction
let institutions = [
  {
    id: "INST-KE-001",
    name: "University of Nairobi",
    country: "Kenya",
    code: "UON",
    adminEmail: "admin@uonbi.ac.ke",
    contact: "+254 20 491 0000",
    status: "Verified",
    registeredAt: "2024-03-12"
  },
  {
    id: "INST-NG-002",
    name: "University of Ibadan",
    country: "Nigeria",
    code: "UIB",
    adminEmail: "registrar@ui.edu.ng",
    contact: "+234 22 810 3350",
    status: "Verified",
    registeredAt: "2024-05-18"
  },
  {
    id: "INST-GH-003",
    name: "Ashesi University",
    country: "Ghana",
    code: "ASH",
    adminEmail: "academic@ashesi.edu.gh",
    contact: "+233 30 261 0330",
    status: "Verified",
    registeredAt: "2025-01-10"
  },
  {
    id: "INST-UG-004",
    name: "Makerere University",
    country: "Uganda",
    code: "MAK",
    adminEmail: "admin@mak.ac.ug",
    contact: "+256 41 453 0030",
    status: "Verified",
    registeredAt: "2024-09-01"
  }
];

let applications = [
  {
    id: "APP-REG-2026-001",
    institutionId: "INST-KE-001",
    institutionName: "University of Nairobi",
    country: "Kenya",
    programName: "M.Sc. Artificial Intelligence & Academic Systems",
    level: "Postgraduate",
    submissionDate: "2026-04-10",
    currentStage: "Expert Committee Review",
    history: [
      { stage: "Initial Screening", date: "2026-04-12", status: "Completed", note: "Administrative requirements fully met." },
      { stage: "Expert Committee Review", date: "2026-04-20", status: "In Progress", note: "Curriculum matches standard syllabus frameworks. Evaluating faculty list." },
      { stage: "Site Inspection Visit", date: "Pending", status: "Scheduled", note: "Proposed scheduled site visit: July 15, 2026." },
      { stage: "Commission Final Decision", date: "Pending", status: "Upcoming", note: "" }
    ],
    status: "Active",
    readinessScore: 84,
    criteriaEvaluation: {
      facultyAccreditation: "Satisfactory",
      curriculumQuality: "Highly Advised",
      infrastructureAdequacy: "Awaiting Site Visit",
      studentSupport: "Satisfactory"
    }
  },
  {
    id: "APP-REG-2026-002",
    institutionId: "INST-GH-003",
    institutionName: "Ashesi University",
    country: "Ghana",
    programName: "B.Sc. Cybersecurity & Cloud Defense",
    level: "Undergraduate",
    submissionDate: "2026-05-02",
    currentStage: "Initial Screening",
    history: [
      { stage: "Initial Screening", date: "2026-05-04", status: "In Progress", note: "Reviewing legal charters and regional clearance." },
      { stage: "Expert Committee Review", date: "Pending", status: "Upcoming", note: "" },
      { stage: "Site Inspection Visit", date: "Pending", status: "Upcoming", note: "" },
      { stage: "Commission Final Decision", date: "Pending", status: "Upcoming", note: "" }
    ],
    status: "Pending",
    readinessScore: 78,
    criteriaEvaluation: {
      facultyAccreditation: "Under Review",
      curriculumQuality: "Under Review",
      infrastructureAdequacy: "Awaiting Screening",
      studentSupport: "Under Review"
    }
  },
  {
    id: "APP-REG-2026-003",
    institutionId: "INST-UG-004",
    institutionName: "Makerere University",
    country: "Uganda",
    programName: "B.Sc. Regenerative Engineering & Agricultural Systems",
    level: "Undergraduate",
    submissionDate: "2025-11-12",
    currentStage: "Commission Final Decision",
    history: [
      { stage: "Initial Screening", date: "2025-11-20", status: "Completed", note: "Passed initial clearance." },
      { stage: "Expert Committee Review", date: "2025-12-18", status: "Completed", note: "Syllabus commended for high local integration." },
      { stage: "Site Inspection Visit", date: "2026-02-15", status: "Completed", note: "Laboratory and training centers visited. Outstanding student workshops." },
      { stage: "Commission Final Decision", date: "2026-05-10", status: "Completed", note: "Accreditation approved for a period of 6 years (until 2032)." }
    ],
    status: "Approved",
    readinessScore: 96,
    criteriaEvaluation: {
      facultyAccreditation: "Commended",
      curriculumQuality: "Excellent",
      infrastructureAdequacy: "Satisfactory",
      studentSupport: "Excellent"
    }
  }
];

let credentials = [
  {
    id: "AHEC-KE-2025-0941",
    studentName: "Musa Kiprop",
    institutionName: "University of Nairobi",
    degree: "B.Sc. Electrical Engineering",
    graduationYear: 2025,
    country: "Kenya",
    digitalSignature: "SHA256:8fd52f865063eb708f51259fb16843c09f3bfb589b2518e8d8ee46de827caad3",
    status: "Authentic",
    sealedBy: "AHEC Credential Board",
    dateSealed: "2025-12-15"
  },
  {
    id: "AHEC-NG-2024-3382",
    studentName: "Chioma Adeleke",
    institutionName: "University of Ibadan",
    degree: "B.Sc. Computer Science",
    graduationYear: 2024,
    country: "Nigeria",
    digitalSignature: "SHA256:c29a287ee3b4ef84a8616fa2e3bc01bbf86e4e5eef72ef9f83f2d011ff5a1de8",
    status: "Authentic",
    sealedBy: "Western Africa Regional Council",
    dateSealed: "2024-07-20"
  },
  {
    id: "AHEC-GH-2025-0114",
    studentName: "Kwame Boateng",
    institutionName: "Ashesi University",
    degree: "B.Sc. Computer Science",
    graduationYear: 2025,
    country: "Ghana",
    digitalSignature: "SHA256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    status: "Authentic",
    sealedBy: "AHEC Academic Senate",
    dateSealed: "2025-12-19"
  }
];

// Helper to find relative objects
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Get basic portal statistics
app.get("/api/stats", (req, res) => {
  res.json({
    totalInstitutions: institutions.length,
    activeApplications: applications.filter(a => a.status === "Active" || a.status === "Pending").length,
    approvedAccreditations: applications.filter(a => a.status === "Approved").length,
    verifiedCredentials: credentials.length,
    memberNationsCount: 54 // Total African Union member nations
  });
});

// List or register institutions
app.get("/api/institutions", (req, res) => {
  res.json(institutions);
});

app.post("/api/institutions", (req, res) => {
  const { name, country, code, adminEmail, contact } = req.body;
  if (!name || !country || !adminEmail) {
    return res.status(400).json({ error: "Missing required university registration fields." });
  }

  const codeUpper = (code || name.substring(0, 3)).toUpperCase();
  const countryCode = country.substring(0, 2).toUpperCase();
  const newId = `INST-${countryCode}-${String(institutions.length + 1).padStart(3, '0')}`;

  const newInstitution = {
    id: newId,
    name,
    country,
    code: codeUpper,
    adminEmail,
    contact: contact || "+254 00000000",
    status: "Verified",
    registeredAt: new Date().toISOString().split('T')[0]
  };

  institutions.push(newInstitution);
  res.status(201).json(newInstitution);
});

// Get, update, and submit application statuses
app.get("/api/applications", (req, res) => {
  res.json(applications);
});

app.post("/api/applications", (req, res) => {
  const { institutionId, programName, level, curriculumSyllabus } = req.body;
  if (!institutionId || !programName || !level) {
    return res.status(400).json({ error: "Missing program name or level." });
  }

  const inst = institutions.find(i => i.id === institutionId);
  if (!inst) {
    return res.status(404).json({ error: "Institution not registered under AHEC." });
  }

  const originalId = `APP-REG-2026-${String(applications.length + 1).padStart(3, '0')}`;
  const newApp = {
    id: originalId,
    institutionId: inst.id,
    institutionName: inst.name,
    country: inst.country,
    programName,
    level,
    submissionDate: new Date().toISOString().split('T')[0],
    currentStage: "Initial Screening",
    history: [
      { stage: "Initial Screening", date: new Date().toISOString().split('T')[0], status: "In Progress", note: "Syllabus queued for administrative review." },
      { stage: "Expert Committee Review", date: "Pending", status: "Upcoming", note: "" },
      { stage: "Site Inspection Visit", date: "Pending", status: "Upcoming", note: "" },
      { stage: "Commission Final Decision", date: "Pending", status: "Upcoming", note: "" }
    ],
    status: "Pending",
    readinessScore: 60, // base initial score before appraisal
    criteriaEvaluation: {
      facultyAccreditation: "Awaiting Audit",
      curriculumQuality: "Pending Review",
      infrastructureAdequacy: "Pending Inspection",
      studentSupport: "Pending Assessment"
    }
  };

  applications.push(newApp);
  res.status(201).json(newApp);
});

// Simulates checking credential database
app.get("/api/credentials", (req, res) => {
  res.json(credentials);
});

// Search and Verify a credential
app.get("/api/credentials/verify/:query", (req, res) => {
  const query = req.params.query.toLowerCase().trim();
  
  // Search by either ID, Student Name, or Hash
  const match = credentials.find(c => 
    c.id.toLowerCase() === query ||
    c.studentName.toLowerCase().includes(query) ||
    c.digitalSignature.toLowerCase().includes(query)
  );

  if (match) {
    return res.json({ found: true, credential: match });
  }

  return res.json({ found: false, message: "No sealed digital credential found matching query. Please review parameters." });
});

// Register new credential (Digital sealing process)
app.post("/api/credentials", (req, res) => {
  const { studentName, institutionId, degree, graduationYear } = req.body;
  
  if (!studentName || !institutionId || !degree || !graduationYear) {
    return res.status(400).json({ error: "Missing required information for digital credential sealing." });
  }

  const inst = institutions.find(i => i.id === institutionId);
  if (!inst) {
    return res.status(404).json({ error: "Institution not found directory" });
  }

  const countryCode = inst.country.substring(0, 2).toUpperCase();
  const indexStr = String(credentials.length + 1).padStart(4, '0');
  const credId = `AHEC-${countryCode}-${graduationYear}-${indexStr}`;
  
  // Create simulated secure digital signature (SHA-256 looking)
  const seedString = `${studentName}-${inst.name}-${degree}-${graduationYear}-${indexStr}`;
  let hashVal = 0;
  for (let i = 0; i < seedString.length; i++) {
    hashVal = (hashVal << 5) - hashVal + seedString.charCodeAt(i);
    hashVal |= 0;
  }
  const hexHex = Math.abs(hashVal).toString(16).padEnd(8, 'f') + "f82b7c4d" + Math.abs(hashVal * 99).toString(16).substring(0, 16).padEnd(16, 'a');
  const digitalSignature = `SHA256:d8ffae2e${hexHex}`;

  const newCred = {
    id: credId,
    studentName,
    institutionName: inst.name,
    degree,
    graduationYear: parseInt(graduationYear),
    country: inst.country,
    digitalSignature,
    status: "Authentic",
    sealedBy: "AHEC Regional Credential Ledger",
    dateSealed: new Date().toISOString().split('T')[0]
  };

  credentials.push(newCred);
  res.status(201).json(newCred);
});

// Server-Side Gemini endpoint for automated Curriculum & Accrediting appraisal
app.post("/api/gemini/evaluate-accreditation", async (req, res) => {
  const { programName, level, curriculumSyllabus, country, institutionName } = req.body;
  
  if (!programName || !curriculumSyllabus) {
    return res.status(400).json({ error: "Program name and curriculum structure are required for appraisal." });
  }

  try {
    const ai = getGeminiClient();

    // Check if the actual API key is active. If we are using the mock key, return custom, lifelike fallback evaluation
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY") {
      // Return high-quality mock data instantly with a notification about simulated mode
      const simulatedEvaluation = {
        readinessScore: Math.floor(Math.random() * 20) + 75, // 75-95
        facultyEvaluation: "Meets basic ratio of 1:15 Ph.D. leads. Recommendations highlight expansion in cloud infrastructure support.",
        curriculumStrengths: [
          "Robust Alignment with modern African industry targets.",
          "Good logical sequencing across years 1-4 with foundational math prerequisites.",
          "Includes strong ethical frameworks for professional practice."
        ],
        curriculumGaps: [
          "Needs explicit regional context module for pan-African cross-border collaborations.",
          "Insufficient hands-on lab hours specified in third-year components."
        ],
        relevanceRating: "Highly Aligned",
        detailedAppraisal: `### Curriculum Review & Audit Summary (Simulated Mode)
This program **${programName}** submitted by **${institutionName || "Registered Institution"}** of **${country || "Member Nation"}** was audited against the **African Standards and Guidelines for Quality Assurance (ASG-QA)**.

#### Criteria Analysis:
1. **Curriculum Design & Structure:** Highly satisfactory. Key focus areas are well structured.
2. **Pedagogical Alignment:** Very good foundations, although practical components require clear allocation inside laboratory descriptors.
3. **Regional Capacity Support:** Excellent support for cross-nation student transfer standard.

*Note: This is simulated evaluation feedback generated locally by standard heuristics due to unconfigured Gemini credentials.*`,
        recommendations: [
          "Incorporate a focused case study on regional cross-boundary African trade structures or technical systems.",
          "Clarify equipment checklists for practical exercises in course specifications."
        ]
      };
      return res.json({ evaluation: simulatedEvaluation, isSimulated: true });
    }

    const systemPrompt = `You are the Expert Advisory AI for the African Higher Education Commission (AHEC). 
Your objective is to review submitted university course curriculum syllabi and academic proposals against the regional African Standards and Guidelines for Quality Assurance (ASG-QA) framework.
Analyze the curriculum carefully, outputting structural feedback, key strengths, potential gaps, compliance rating, and clear, actionable recommendations.
IMPORTANT: You MUST return a single JSON object matching this structure exactly (do not output any markdown text wrapping, just pure JSON):
{
  "readinessScore": number (0 to 100),
  "facultyEvaluation": "string summarizing evaluation",
  "curriculumStrengths": ["string", "string", ...],
  "curriculumGaps": ["string", "string", ...],
  "relevanceRating": "string (Highly Aligned, Standard Aligned, Action Required, Unsatisfactory)",
  "detailedAppraisal": "markdown string summarizing key evaluation details",
  "recommendations": ["string", "string", ...]
}`;

    const promptText = `Please evaluate the following academic program proposal under the ASG-QA standards:
Institution: ${institutionName || "Unknown Institution"}
Country: ${country || "African Union Nation"}
Program Name: ${programName} (${level || "Bachelor"})
Curriculum Text / Description: ${curriculumSyllabus}

Perform a deep analysis and generate the matching JSON review. Make sure to respond with a VALID JSON matching the required schema exactly.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json"
      }
    });

    const parsedData = JSON.parse(response.text.trim());
    return res.json({ evaluation: parsedData, isSimulated: false });

  } catch (error: any) {
    console.error("Gemini appraisal error:", error);
    res.status(500).json({ error: "Failure during curriculum appraisal generation: " + error.message });
  }
});

// Configure Vite middleware or production build handling
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[AHEC SERVER] Running on port http://localhost:${PORT}`);
  });
}

startServer();
