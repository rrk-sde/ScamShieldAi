# 🛡️ ScamShield AI — Digital Fraud Detection & Response Platform

> **Vibe-A-Thon 2026 Entry** | Built 100% with AI-assisted development  
> Codebucket Solutions Pvt Ltd

---

## 🎯 What is ScamShield AI?

ScamShield AI is an AI-powered platform that detects and analyzes **digital arrest scams**, **cyber fraud**, **phishing**, and other online threats. Users can paste suspicious messages (WhatsApp, email, call transcripts, payment requests) and get instant AI-powered analysis including:

- ⚡ **Real-time scam detection** with confidence scoring
- 🎯 **Fraud category classification** (Digital Arrest, UPI Fraud, Phishing, etc.)
- 📊 **Risk level assessment** (Low → Critical)
- 📝 **Auto-generated FIR drafts** under IT Act sections
- 💬 **Suggested safe replies** for victims
- 🏢 **Department portal** with case management & analytics

---

## 🖥️ Tech Stack

| Component | Technology |
|-----------|-----------|
| **Frontend** | Next.js 16 (React 19), TypeScript |
| **Styling** | TailwindCSS + Custom CSS Design System |
| **Backend** | Next.js API Routes (Node.js) |
| **Database** | MongoDB (Mongoose ODM) |
| **AI Engine** | OpenAI GPT-4o-mini (with fallback pattern matching) |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Auth** | JWT + bcryptjs |

---

## 📁 Project Structure

```
scam-shield/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── analyze/          # AI scam analysis endpoint
│   │   │   ├── analytics/        # Dashboard analytics
│   │   │   ├── auth/
│   │   │   │   ├── login/        # Department login
│   │   │   │   └── register/     # User registration
│   │   │   ├── cases/
│   │   │   │   ├── [id]/         # Individual case CRUD
│   │   │   │   └── route.ts      # Cases listing with filters
│   │   │   └── seed/             # Database seeding
│   │   ├── department/
│   │   │   ├── cases/[id]/       # Case detail view
│   │   │   ├── dashboard/        # Main dashboard
│   │   │   └── login/            # Department login page
│   │   ├── globals.css           # Design system
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # Landing page + analyzer
│   ├── lib/
│   │   ├── ai-engine.ts          # OpenAI integration + fallback
│   │   └── mongodb.ts            # Database connection
│   └── models/
│       ├── DepartmentUser.ts     # Officer/Admin model
│       └── ScamCase.ts           # Scam case model
├── .env.local                    # Environment variables
├── package.json
└── README.md
```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+ installed
- MongoDB installed and running locally (or MongoDB Atlas)
- OpenAI API key (optional — fallback works without it)

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-repo/scam-shield.git
   cd scam-shield
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Edit `.env.local`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/scamshield
   OPENAI_API_KEY=your_openai_api_key_here
   NEXTAUTH_SECRET=scamshield-secret-key-2026-vibethon
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   ```
   http://localhost:3000
   ```

7. **Seed demo data** (optional)
   - Go to `http://localhost:3000/department/login`
   - Click "🌱 Seed Demo Data" button
   - Login with:
     - **Admin**: `admin@cybercell.gov.in` / `admin123`
     - **Officer**: `priya@cybercell.gov.in` / `officer123`
     - **Analyst**: `vikram@cybercell.gov.in` / `analyst123`

---

## 📊 Database Schema

### ScamCase Collection
```json
{
  "caseId": "SC-2026-A1B2C3",
  "submittedBy": "Rahul Verma",
  "contactEmail": "rahul@email.com",
  "contactPhone": "9876543210",
  "messageType": "whatsapp | email | call_transcript | payment_request | sms | other",
  "originalMessage": "Full message text...",
  "analysis": {
    "isScam": true,
    "confidence": 96,
    "fraudCategory": "Digital Arrest Scam",
    "riskLevel": "critical | high | medium | low",
    "financialRisk": "Direct financial demand of ₹50,000",
    "scamPatterns": ["Pattern 1", "Pattern 2"],
    "explanation": "Detailed AI analysis...",
    "suggestedReply": "Safe response message...",
    "actionSteps": ["Step 1", "Step 2"]
  },
  "firDraft": "Auto-generated FIR content...",
  "status": "open | under_investigation | resolved | dismissed",
  "assignedTo": "Officer Name",
  "internalNotes": [
    {
      "note": "Investigation note...",
      "addedBy": "Inspector Name",
      "addedAt": "2026-02-15T10:00:00Z"
    }
  ],
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### DepartmentUser Collection
```json
{
  "name": "Inspector Rajesh Kumar",
  "email": "admin@cybercell.gov.in",
  "password": "bcrypt_hashed_password",
  "role": "officer | admin | analyst",
  "department": "Cyber Crime Cell - HQ",
  "badge": "CC-001",
  "isActive": true
}
```

---

## ✨ Features

### 🔍 For Citizens (Public)
- Paste suspicious messages for instant AI analysis
- Get confidence scores and risk levels
- View detected scam patterns
- Receive safe reply suggestions
- Auto-generated FIR drafts ready for submission
- Links to cybercrime.gov.in and helpline 1930

### 🏢 For Department Officials
- Secure login with role-based access
- **Dashboard Overview**: Total cases, status distribution, detection rate
- **Case Management**: Search, filter, sort, and paginate cases
- **Case Details**: Full analysis, status updates, internal notes
- **Analytics**: Risk trends, category breakdown, confidence metrics
- Interactive charts (bar, pie, line) for data visualization

---

## 🤖 AI Engine

The AI engine uses a **two-tier approach**:

1. **Primary**: OpenAI GPT-4o-mini for advanced NLP analysis
   - Fraud pattern detection
   - Category classification
   - Risk assessment
   - FIR draft generation

2. **Fallback**: Keyword-based pattern matching
   - Works without API key
   - Detects common scam keywords
   - Basic risk scoring
   - Template-based FIR generation

---

## 📸 Screenshots

### Landing Page
- Premium dark theme with glassmorphism
- Feature cards with icons
- Message type selector
- Real-time analysis form

### Analysis Result
- Score cards (confidence, risk, category, status)
- Detected scam patterns with icons
- Recommended actions
- AI analysis report
- FIR draft viewer

### Department Dashboard
- Overview with stat cards
- Interactive charts (Recharts)
- Case management table
- Search, filter, pagination
- Analytics deep dive

### Case Detail
- Full analysis report
- Status management (Open → Under Investigation → Resolved)
- Internal notes system
- Original message viewer
- FIR draft

---

## 🔐 Security

- Passwords hashed with bcrypt (12 rounds)
- JWT-based authentication (24hr expiry)
- Input validation on all API endpoints
- MongoDB injection prevention via Mongoose

---

## 📄 License

Built for Vibe-A-Thon 2026 by Codebucket Solutions Pvt Ltd

---

## 🙏 Acknowledgments

- **AI Provider**: OpenAI GPT-4o-mini
- **Framework**: Next.js by Vercel
- **Icons**: Lucide React
- **Charts**: Recharts
- **Development**: 100% AI-assisted (Vibe Coding)
