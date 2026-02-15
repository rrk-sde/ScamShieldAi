import OpenAI from 'openai';

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Clients
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

// Helper to get completion from either provider
async function getCompletion(prompt: string, jsonMode: boolean = false, systemPrompt: string = ''): Promise<string> {
    // 1. Try Gemini (Priority: Free/Fast)
    if (genAI) {
        try {
            const model = genAI.getGenerativeModel({
                model: "gemini-1.5-flash",
                generationConfig: { responseMimeType: jsonMode ? "application/json" : "text/plain" }
            });

            const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
            const result = await model.generateContent(fullPrompt);
            return result.response.text();
        } catch (error) {
            console.error("Gemini Error (Falling back if possible):", error);
        }
    }

    // 2. Try OpenAI
    if (openai) {
        const messages: any[] = [];
        if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
        messages.push({ role: 'user', content: prompt });

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: messages,
            response_format: jsonMode ? { type: "json_object" } : undefined,
            temperature: 0.3,
        });
        return response.choices[0]?.message?.content || '';
    }

    throw new Error("No valid AI API Key configured. Set GEMINI_API_KEY or OPENAI_API_KEY in .env.local");
}

export interface ScamAnalysisResult {
    isScam: boolean;
    confidence: number;
    fraudCategory: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    financialRisk: string;
    scamPatterns: string[];
    explanation: string;
    suggestedReply: string;
    actionSteps: string[];
}

export async function analyzeScam(
    message: string,
    messageType: string,
    senderEmail: string = ''
): Promise<ScamAnalysisResult> {
    const senderContext = senderEmail ? `\nSENDER EMAIL: ${senderEmail}\n(Analyze the sender domain for legitimacy — official domains like @accounts.google.com are legitimate, random Gmail/Yahoo addresses impersonating companies are suspicious)` : '';
    const prompt = `You are an expert AI cybercrime analyst specializing in digital fraud detection in India. Analyze the following ${messageType} message for potential scam/fraud indicators.${senderContext}

MESSAGE TO ANALYZE:
"""
${message}
"""

Provide your analysis in the following JSON format ONLY (no other text):
{
  "isScam": true/false,
  "confidence": <number 0-100>,
  "fraudCategory": "<category like: Digital Arrest Scam, UPI Fraud, Phishing, Investment Scam, Lottery/Prize Scam, Impersonation, Romance Scam, Job Scam, Loan Scam, Tech Support Scam, Social Engineering, Sextortion, Advance Fee Fraud, Money Mule, Identity Theft, Other>",
  "riskLevel": "<low/medium/high/critical>",
  "financialRisk": "<estimated financial exposure description>",
  "scamPatterns": ["<pattern1>", "<pattern2>", ...],
  "explanation": "<detailed explanation of why this is/isn't a scam>",
  "suggestedReply": "<safe reply the victim can send back>",
  "actionSteps": ["<step1>", "<step2>", ...]
}

Be thorough in identifying:
- Urgency tactics and pressure
- Authority impersonation (police, CBI, RBI, courts, government officials)
- Financial pressure or money demands
- Personal information requests (Aadhaar, PAN, OTP, bank details)
- Suspicious links/phone numbers
- Emotional manipulation and fear tactics
- Too-good-to-be-true offers
- Grammar/spelling errors as fraud indicators
- Unsolicited contact from strangers
- Social engineering patterns (building trust, romance baiting)
- Messages from unknown numbers/emails claiming to be someone
- Broken English or translated messages typical of scam operations
- Requests to move to different platforms (WhatsApp, Telegram)`;

    try {
        const content = await getCompletion(prompt, true, 'You are a cybercrime analysis AI. Always respond with valid JSON only.');

        // const content = response.choices[0]?.message?.content || '{}'; // Removed direct OpenAI call
        const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        return JSON.parse(cleanedContent) as ScamAnalysisResult;
    } catch (error) {
        console.error('AI Analysis Error:', error);
        return fallbackAnalysis(message, messageType, senderEmail);
    }
}

export async function generateFIRDraft(
    analysis: ScamAnalysisResult,
    originalMessage: string,
    messageType: string,
    submitterName: string
): Promise<string> {
    const prompt = `Generate a professional FIR (First Information Report) draft for the Indian Cyber Crime Cell based on the following scam analysis.

SCAM DETAILS:
- Message Type: ${messageType}
- Fraud Category: ${analysis.fraudCategory}
- Risk Level: ${analysis.riskLevel}
- Confidence: ${analysis.confidence}%
- Financial Risk: ${analysis.financialRisk}
- Scam Patterns Detected: ${analysis.scamPatterns.join(', ')}

ORIGINAL MESSAGE:
"""
${originalMessage}
"""

ANALYSIS:
${analysis.explanation}

Generate a complete FIR draft in the following format:

FIRST INFORMATION REPORT (FIR)
Under Section 66C/66D of Information Technology Act, 2000
& Relevant Sections of Indian Penal Code

1. COMPLAINANT DETAILS:
   Name: ${submitterName}
   (Other details to be filled by complainant)

2. DATE & TIME OF INCIDENT:
   (To be filled)

3. NATURE OF COMPLAINT:
   [Auto-generate based on analysis]

4. DETAILED DESCRIPTION OF INCIDENT:
   [Auto-generate comprehensive description]

5. EVIDENCE PRESERVED:
   [List evidence types]

6. SUSPECT DETAILS (if available):
   [Extract from message]

7. FINANCIAL LOSS (if any):
   [Based on analysis]

8. ACTION REQUESTED:
   [Recommend specific actions]

9. DECLARATION:
   I hereby declare that the information given above is true and correct to the best of my knowledge.

Make it professional, thorough, and legally appropriate for Indian cyber crime jurisdiction.`;

    try {
        return await getCompletion(prompt, false, 'You are a legal document drafting AI specializing in Indian cyber crime FIRs.');

        // return response.choices[0]?.message?.content || 'FIR draft generation failed.';
    } catch (error) {
        console.error('FIR Generation Error:', error);
        return generateFallbackFIR(analysis, originalMessage, messageType, submitterName);
    }
}

// ============================================================
// COMPREHENSIVE FALLBACK ANALYSIS ENGINE
// Designed to handle 2M+ users without AI API dependency
// ============================================================

// --- Grammar & Language Error Detection ---
function detectGrammarErrors(message: string): { score: number; patterns: string[] } {
    let score = 0;
    const patterns: string[] = [];

    // Common grammar mistakes scammers make
    const grammarPatterns: { regex: RegExp; desc: string; weight: number }[] = [
        // Missing verb "to be" — "I m", "u r", "we r"
        { regex: /\bi\s+m\b/i, desc: 'Broken English: "I m" instead of "I am"', weight: 12 },
        { regex: /\bu\s+r\b/i, desc: 'Internet slang used in formal context: "u r"', weight: 10 },
        { regex: /\bwe\s+r\b/i, desc: 'Poor grammar: "we r" instead of "we are"', weight: 10 },
        // Wrong articles — "a engineer", "a honest", "a urgent"
        { regex: /\ba\s+[aeiou]\w+/i, desc: 'Incorrect article usage (e.g., "a" before vowel sound)', weight: 8 },
        // "ur" instead of "your/you're"
        { regex: /\bur\b/i, desc: 'SMS language in formal message: "ur"', weight: 8 },
        // "pls" or "plz"
        { regex: /\b(pls|plz|plzz)\b/i, desc: 'Informal abbreviation: "pls/plz"', weight: 6 },
        // "kindly do the needful" — classic Indian scam English
        { regex: /kindly\s+do\s+the\s+needful/i, desc: 'Formal scripted phrase: "kindly do the needful"', weight: 10 },
        // "itself" misuse: "today itself"
        { regex: /today\s+itself/i, desc: 'Unnatural phrasing: "today itself"', weight: 8 },
        // "same" misuse: "please share same", "revert same"
        { regex: /\b(share|send|revert)\s+same\b/i, desc: 'Unnatural phrasing: "(share/send/revert) same"', weight: 6 },
        // "revert back"
        { regex: /revert\s+back/i, desc: 'Redundant phrasing: "revert back"', weight: 5 },
        // Subject-verb disagreement
        { regex: /\b(he|she|it)\s+(are|were|have)\b/i, desc: 'Subject-verb disagreement detected', weight: 10 },
        { regex: /\b(they|we|you)\s+(is|was|has)\b/i, desc: 'Subject-verb disagreement detected', weight: 10 },
        { regex: /\bi\s+(is|has|was)\b/i, desc: 'Subject-verb disagreement: "I is/has/was"', weight: 12 },
        // Double spaces or excessive punctuation
        { regex: /[!]{3,}/i, desc: 'Excessive exclamation marks (!!!) — typical of scam urgency', weight: 7 },
        { regex: /[?]{3,}/i, desc: 'Excessive question marks (???) — pressure tactic', weight: 5 },
        // ALL CAPS phrases
        { regex: /[A-Z\s]{15,}/, desc: 'Excessive use of CAPS — shouting/urgency tactic', weight: 8 },
        // Missing apostrophes: "dont", "cant", "wont", "doesnt"
        { regex: /\b(dont|cant|wont|doesnt|didnt|isnt|wasnt|hasnt|havent|shouldnt|wouldnt|couldnt)\b/i, desc: 'Missing apostrophes in contractions (dont, cant)', weight: 6 },
        // "your" vs "you're" confusion (contextual clue)
        { regex: /your\s+(welcome|right|wrong|the\s+best|a\s+winner)/i, desc: 'Common grammar mistake: "your" instead of "you\'re"', weight: 7 },
        // "there" vs "their" confusion
        { regex: /there\s+(account|money|bank|number)/i, desc: 'Common grammar mistake: "there" instead of "their"', weight: 7 },
        // Repeated words
        { regex: /\b(\w+)\s+\1\b/i, desc: 'Repeated word detected — may indicate poor composition', weight: 4 },
        // Very short sentences with demands
        { regex: /^.{5,20}$/m, desc: 'Very short message — potential social probing', weight: 3 },
        // Broken sentence starters: "am" as first word, "is" as first word
        { regex: /^(am|is|are|has|have|was)\s/im, desc: 'Sentence starts with auxiliary verb — unnatural phrasing', weight: 6 },
        // "myself" introduction — "myself Rajesh" (common in Indian scams)
        { regex: /\bmyself\s+[A-Z]/i, desc: 'Indian English pattern: "myself [Name]" introduction', weight: 8 },
        // Number/letter substitution: "0" for "O", "1" for "l" in URLs
        { regex: /[a-z]0[a-z]/i, desc: 'Suspicious character substitution (0 for O)', weight: 5 },
    ];

    for (const gp of grammarPatterns) {
        if (gp.regex.test(message)) {
            score += gp.weight;
            patterns.push(gp.desc);
        }
    }

    // Check overall readability — count ratio of errors to message length
    const words = message.split(/\s+/).length;
    if (words > 3 && words < 8 && patterns.length > 0) {
        score += 5; // Short message with grammar issues is more suspicious
    }

    return { score, patterns };
}

// --- Social Engineering Detection ---
function detectSocialEngineering(message: string): { score: number; patterns: string[] } {
    let score = 0;
    const patterns: string[] = [];
    const lowerMsg = message.toLowerCase();

    const socialPatterns: { test: (msg: string) => boolean; desc: string; weight: number }[] = [
        // Unsolicited contact / stranger reach-out
        { test: (m) => /\b(hi|hello|hey)\s*(dear|friend|sir|madam|bro|buddy|sweetie|handsome|beautiful)\b/i.test(m), desc: 'Unsolicited greeting to stranger — classic social engineering opener', weight: 15 },
        { test: (m) => /\bwant\s+to\s+(talk|chat|speak|connect|be\s+friends?)\b/i.test(m), desc: 'Stranger initiating conversation — social engineering', weight: 12 },
        { test: (m) => /\b(i\s+am|i'm|im)\s+a?\s*(girl|boy|woman|man|lady|engineer|doctor|model|nurse|soldier|military)\b/i.test(m), desc: 'Unsolicited self-introduction with profession/gender — trust building', weight: 14 },
        { test: (m) => /\bI\s+m\s+a?\s*\w+/i.test(m), desc: 'Broken self-introduction ("I m a...") — common in scam openers', weight: 14 },
        { test: (m) => /\bfrom\s+(usa|uk|london|dubai|canada|australia|germany|us|united\s+states|united\s+kingdom)\b/i.test(m), desc: 'Claims foreign location — common in romance/advance fee scams', weight: 10 },
        { test: (m) => /\b(lonely|alone|need\s+someone|looking\s+for\s+(love|friendship|partner|companion))\b/i.test(m), desc: 'Emotional manipulation — romance scam indicator', weight: 18 },
        { test: (m) => /\b(whatsapp|telegram|signal|hangout|google\s*chat|viber|wechat)\b/i.test(m), desc: 'Requesting move to different messaging platform', weight: 12 },
        { test: (m) => /\b(add\s+me|message\s+me|call\s+me|contact\s+me|dm\s+me|ping\s+me)\b/i.test(m), desc: 'Requesting direct private contact', weight: 10 },
        { test: (m) => /\b(trust\s+me|believe\s+me|i\s+promise|i\s+swear|honest(ly)?|genuinely?)\b/i.test(m), desc: 'Trust-building language — overemphasis on honesty', weight: 8 },
        { test: (m) => /\b(got\s+your\s+(number|contact|profile)|found\s+you|saw\s+your\s+(profile|photo|picture))\b/i.test(m), desc: 'Claims to have found victim\'s contact — unsolicited reach-out', weight: 14 },
        { test: (m) => /\b(wrong\s+number|sorry\s+wrong|oops\s+wrong)\b/i.test(m), desc: '"Wrong number" tactic — deliberate social engineering opener', weight: 15 },
        { test: (m) => /\b(investment\s+opportunity|business\s+(proposal|opportunity|partner)|earn\s+from\s+home)\b/i.test(m), desc: 'Unsolicited business/investment proposal', weight: 16 },
        { test: (m) => /\b(part\s*time|work\s*from\s*home|earn\s+\d|daily\s+(income|earning|profit)|₹\s*\d{4,})\b/i.test(m), desc: 'Work-from-home / easy earning scam indicators', weight: 14 },
        { test: (m) => /\b(i\s+need\s+your\s+help|please\s+help\s+me|can\s+you\s+help)\b/i.test(m), desc: 'Emotional appeal for help — manipulation tactic', weight: 8 },
        { test: (m) => /\b(send\s+me\s+your\s+(photo|pic|picture|selfie|image))\b/i.test(m), desc: 'Requesting personal photos — sextortion setup', weight: 16 },
        { test: (m) => /\b(video\s+call|nude|intimate|private\s+photos?|expose|leak)\b/i.test(m), desc: 'Sextortion indicators detected', weight: 20 },
    ];

    for (const sp of socialPatterns) {
        if (sp.test(lowerMsg)) {
            score += sp.weight;
            patterns.push(sp.desc);
        }
    }

    return { score, patterns };
}

// --- Threat & Authority Detection ---
function detectThreatsAndAuthority(message: string): { score: number; patterns: string[] } {
    let score = 0;
    const patterns: string[] = [];
    const lowerMsg = message.toLowerCase();

    const threatPatterns: { keywords: string[]; desc: string; weight: number }[] = [
        { keywords: ['digital arrest', 'e-arrest', 'online arrest', 'cyber arrest'], desc: 'Digital arrest scam — fake arrest threats', weight: 25 },
        { keywords: ['arrest warrant', 'non-bailable warrant', 'warrant issued'], desc: 'Fake warrant threats', weight: 22 },
        { keywords: ['money laundering', 'hawala', 'terror funding', 'narcotics'], desc: 'False accusations of serious crimes', weight: 22 },
        { keywords: ['cbi', 'central bureau', 'enforcement directorate', 'ed notice'], desc: 'Impersonation of central investigation agency', weight: 22 },
        { keywords: ['rbi', 'reserve bank', 'sebi'], desc: 'Impersonation of financial regulator', weight: 20 },
        { keywords: ['income tax', 'it department', 'tax notice', 'gst notice'], desc: 'Impersonation of tax authority', weight: 18 },
        { keywords: ['police', 'crime branch', 'cyber cell', 'cyber police'], desc: 'Police impersonation detected', weight: 20 },
        { keywords: ['court order', 'summons', 'legal notice', 'contempt of court'], desc: 'Fake legal documents/notices', weight: 18 },
        { keywords: ['your account', 'account blocked', 'account suspended', 'account freeze', 'frozen'], desc: 'Account freeze/block threats', weight: 16 },
        { keywords: ['aadhaar', 'aadhaar linked', 'aadhaar misuse'], desc: 'Aadhaar-related scam (ID theft)', weight: 16 },
        { keywords: ['fir registered', 'fir filed', 'complaint registered'], desc: 'Fake FIR/complaint registration threats', weight: 18 },
        { keywords: ['customs', 'parcel seized', 'courier seized', 'drugs found', 'contraband'], desc: 'Fake customs/parcel seizure scam', weight: 20 },
        { keywords: ['your name', 'your pan', 'your aadhaar', 'your number', 'has been used', 'was used'], desc: 'Claims victim\'s identity was used in crimes', weight: 16 },
        { keywords: ['jail', 'imprisonment', 'prison', 'lock up', 'behind bars'], desc: 'Imprisonment threats — intimidation tactic', weight: 20 },
    ];

    for (const tp of threatPatterns) {
        if (tp.keywords.some(kw => lowerMsg.includes(kw))) {
            score += tp.weight;
            patterns.push(tp.desc);
        }
    }

    return { score, patterns };
}

// --- Financial Scam Detection ---
function detectFinancialScam(message: string): { score: number; patterns: string[] } {
    let score = 0;
    const patterns: string[] = [];
    const lowerMsg = message.toLowerCase();

    const financialPatterns: { keywords: string[]; desc: string; weight: number }[] = [
        { keywords: ['send money', 'transfer money', 'send amount', 'deposit money'], desc: 'Direct money transfer request', weight: 20 },
        { keywords: ['upi', 'google pay', 'gpay', 'phonepe', 'paytm', 'bhim'], desc: 'UPI payment request — verify legitimacy', weight: 10 },
        { keywords: ['processing fee', 'registration fee', 'verification fee', 'advance fee', 'token amount'], desc: 'Advance fee demand — classic fraud indicator', weight: 18 },
        { keywords: ['otp', 'one time password', 'verification code', 'security code'], desc: 'OTP/verification code request — NEVER share', weight: 22 },
        { keywords: ['credit card', 'debit card', 'card number', 'cvv', 'expiry date'], desc: 'Card details requested — phishing attempt', weight: 22 },
        { keywords: ['bank account', 'account number', 'ifsc', 'bank details', 'account details'], desc: 'Bank account details requested', weight: 18 },
        { keywords: ['pin', 'atm pin', 'mpin', 'net banking password'], desc: 'Banking PIN/password requested', weight: 22 },
        { keywords: ['kyc', 'kyc update', 'kyc expired', 'pan link'], desc: 'Fake KYC update scam', weight: 16 },
        { keywords: ['lottery', 'prize', 'winner', 'won', 'congratulations you', 'selected'], desc: 'Lottery/prize scam — unsolicited winnings', weight: 18 },
        { keywords: ['guaranteed return', 'double money', 'triple money', 'risk free', '100% profit'], desc: 'Investment scam — unrealistic returns promised', weight: 20 },
        { keywords: ['loan approved', 'pre-approved loan', 'instant loan', 'loan offer'], desc: 'Fake loan offer scam', weight: 14 },
        { keywords: ['insurance claim', 'refund', 'cashback', 'compensation'], desc: 'Fake refund/compensation scam', weight: 12 },
        { keywords: ['crypto', 'bitcoin', 'trading', 'forex', 'binary option'], desc: 'Crypto/forex investment scam indicators', weight: 14 },
        { keywords: ['click here', 'click below', 'click this link', 'click the link'], desc: 'Suspicious link click request', weight: 14 },
    ];

    for (const fp of financialPatterns) {
        if (fp.keywords.some(kw => lowerMsg.includes(kw))) {
            score += fp.weight;
            patterns.push(fp.desc);
        }
    }

    // Detect monetary amounts
    const moneyRegex = /₹\s*[\d,]+|rs\.?\s*[\d,]+|\d+\s*(?:lakh|crore|thousand|hundred|rupees?)/gi;
    if (moneyRegex.test(message)) {
        score += 8;
        patterns.push('Specific monetary amounts mentioned — financial bait or demand');
    }

    // Detect phone numbers in message body
    const phoneRegex = /(?:\+91|0)?[\s-]?[6-9]\d{9}/g;
    if (phoneRegex.test(message)) {
        score += 6;
        patterns.push('Phone number embedded in message — possible scam contact number');
    }

    // Detect URLs/links
    const urlRegex = /https?:\/\/[^\s]+|www\.[^\s]+|bit\.ly|tinyurl|goo\.gl/gi;
    if (urlRegex.test(message)) {
        score += 10;
        patterns.push('URLs/links detected — verify before clicking');
    }

    return { score, patterns };
}

// --- Urgency & Pressure Detection ---
function detectUrgency(message: string): { score: number; patterns: string[] } {
    let score = 0;
    const patterns: string[] = [];
    const lowerMsg = message.toLowerCase();

    const urgencyPatterns: { regex: RegExp; desc: string; weight: number }[] = [
        { regex: /\b(immediately|right\s+now|right\s+away|asap|as\s+soon\s+as\s+possible)\b/i, desc: 'Urgency pressure: demands immediate action', weight: 12 },
        { regex: /\b(within\s+\d+\s*(hours?|minutes?|mins?))\b/i, desc: 'Time-bound pressure with specific deadline', weight: 14 },
        { regex: /\b(today\s+only|limited\s+time|offer\s+expires?|last\s+chance|final\s+warning)\b/i, desc: 'Artificial scarcity / deadline pressure', weight: 14 },
        { regex: /\b(act\s+now|do\s+it\s+now|respond\s+now|hurry|don'?t\s+delay)\b/i, desc: 'Action pressure detected', weight: 10 },
        { regex: /\b(or\s+else|otherwise|failing\s+which|if\s+not|consequences)\b/i, desc: 'Implicit threats for non-compliance', weight: 12 },
        { regex: /\b(do\s+not\s+(tell|inform|share|discuss)|keep\s+(it\s+)?secret|confidential|don'?t\s+tell\s+anyone)\b/i, desc: 'Secrecy demand — classic scam isolation tactic', weight: 18 },
        { regex: /\b(this\s+is\s+(very\s+)?urgent|matter\s+is\s+urgent|emergency|serious\s+matter)\b/i, desc: 'Urgency framing to prevent rational thinking', weight: 12 },
        { regex: /\b(verify|confirm|validate|authenticate)\s+(your|the)\s+(identity|details|information|account)/i, desc: 'Verification pressure — fishing for personal data', weight: 14 },
    ];

    for (const up of urgencyPatterns) {
        if (up.regex.test(lowerMsg)) {
            score += up.weight;
            patterns.push(up.desc);
        }
    }

    return { score, patterns };
}

// --- Job Scam Detection ---
function detectJobScam(message: string): { score: number; patterns: string[] } {
    let score = 0;
    const patterns: string[] = [];
    const lowerMsg = message.toLowerCase();

    const jobPatterns: { keywords: string[]; desc: string; weight: number }[] = [
        { keywords: ['earn from home', 'work from home job', 'part time job', 'part time work', 'home based job'], desc: 'Work-from-home job offer — common scam category', weight: 14 },
        { keywords: ['earn daily', 'daily income', 'daily earning', 'per day income'], desc: '"Daily income" promise — unrealistic job scam', weight: 16 },
        { keywords: ['like and subscribe', 'rate and review', 'review product', 'youtube likes'], desc: 'Task-based scam (like/review/subscribe for money)', weight: 18 },
        { keywords: ['no experience needed', 'no qualification', 'anyone can do', 'simple task'], desc: '"No experience needed" lure — too good to be true', weight: 12 },
        { keywords: ['hiring now', 'vacancy', 'recruitment', 'job offer', 'offer letter'], desc: 'Unsolicited job offer — verify authenticity', weight: 8 },
        { keywords: ['amazon', 'flipkart', 'meesho', 'data entry'], desc: 'Brand-name associated task scam', weight: 10 },
        { keywords: ['joining fee', 'registration amount', 'refundable deposit'], desc: 'Job that asks for money upfront — definite scam', weight: 20 },
    ];

    for (const jp of jobPatterns) {
        if (jp.keywords.some(kw => lowerMsg.includes(kw))) {
            score += jp.weight;
            patterns.push(jp.desc);
        }
    }

    return { score, patterns };
}

// --- Message Anomaly Detection ---
function detectMessageAnomalies(message: string, messageType: string): { score: number; patterns: string[] } {
    let score = 0;
    const patterns: string[] = [];

    // Very short unsolicited message from unknown sender
    const wordCount = message.trim().split(/\s+/).length;
    if (wordCount <= 10 && wordCount >= 3) {
        // Short messages from strangers are suspicious
        const hasGreeting = /\b(hi|hello|hey|good\s+(morning|evening|afternoon|night))\b/i.test(message);
        const hasIntro = /\b(i\s+(am|m)|my\s+name|myself)\b/i.test(message);
        if (hasGreeting || hasIntro) {
            score += 10;
            patterns.push('Short unsolicited message with stranger introduction — probing contact');
        }
    }

    // Check for mixed languages (English + Hindi transliteration) — common in Indian scams
    const hindiTransliteration = /\b(karo|kijiye|bhejo|jaldi|paisa|paise|rupay|dedo|batao|bhai|behen|sir\s*ji|madam\s*ji|sahab|achha|theek|haan|nahi|kya|kaise|aapka|tumhara|hamara|yahan|wahan)\b/i;
    if (hindiTransliteration.test(message) && /[a-z]/i.test(message)) {
        score += 5;
        patterns.push('Mixed Hindi-English transliteration — common in local scam operations');
    }

    // Detect unusual formatting
    if (/[A-Z]{2}[a-z]+[A-Z]/.test(message)) {
        score += 4;
        patterns.push('Unusual text capitalization patterns');
    }

    // Detect multiple phone numbers
    const phoneMatches = message.match(/(?:\+91|0)?[\s-]?[6-9]\d{9}/g);
    if (phoneMatches && phoneMatches.length >= 2) {
        score += 8;
        patterns.push('Multiple phone numbers in message — suspicious contact details');
    }

    // Detect email addresses in body
    const emailMatches = message.match(/[\w.-]+@[\w.-]+\.\w+/g);
    if (emailMatches && emailMatches.length >= 1) {
        score += 5;
        patterns.push('Email address embedded in message body');
    }

    // WhatsApp-specific patterns
    if (messageType === 'whatsapp') {
        if (/\+\d{10,}/g.test(message)) {
            score += 6;
            patterns.push('International phone number format in WhatsApp message');
        }
    }

    // Check for emojis often used in scam messages
    const scamEmojis = /[💰💵💸🤑🎰🎯🏆🎁🔒⚠️🚨❗‼️💯✅🔥]/g;
    const emojiCount = (message.match(scamEmojis) || []).length;
    if (emojiCount >= 3) {
        score += 6;
        patterns.push('Excessive attention-grabbing emojis — marketing/scam tactic');
    }

    return { score, patterns };
}


// --- Legitimacy Detection (reduces false positives) ---
function detectLegitimacy(message: string, senderEmail: string = ''): { score: number; patterns: string[] } {
    let score = 0;
    const patterns: string[] = [];
    const lowerMsg = message.toLowerCase();
    const lowerSender = senderEmail.toLowerCase();
    const senderDomain = lowerSender.includes('@') ? lowerSender.split('@')[1] : '';

    // Known legitimate domain patterns in message body
    const trustedDomains = [
        'google.com', 'accounts.google.com', 'myaccount.google.com',
        'microsoft.com', 'apple.com', 'icloud.com',
        'amazon.in', 'amazon.com', 'flipkart.com',
        'sbi.co.in', 'hdfcbank.com', 'icicibank.com', 'axisbank.com', 'kotak.com',
        'paytm.com', 'phonepe.com',
        'github.com', 'linkedin.com', 'facebook.com', 'instagram.com',
        'gov.in', 'nic.in', 'india.gov.in',
        'irctc.co.in', 'npci.org.in',
    ];

    for (const domain of trustedDomains) {
        if (lowerMsg.includes(domain) || senderDomain === domain || senderDomain.endsWith('.' + domain)) {
            score += 15;
            patterns.push(`Legitimate domain reference: ${domain}`);
        }
    }

    // --- SENDER EMAIL DOMAIN ANALYSIS ---
    if (senderEmail) {
        // Trusted sender domains get a big boost
        const trustedSenderDomains = [
            'google.com', 'accounts.google.com', 'youtube.com',
            'microsoft.com', 'outlook.com', 'live.com',
            'apple.com', 'icloud.com',
            'amazon.com', 'amazon.in', 'flipkart.com',
            'sbi.co.in', 'hdfcbank.com', 'icicibank.com', 'axisbank.com',
            'paytm.com', 'phonepe.com', 'razorpay.com',
            'github.com', 'linkedin.com', 'facebook.com', 'instagram.com', 'meta.com',
            'gov.in', 'nic.in', 'irctc.co.in',
        ];
        const isTrustedSender = trustedSenderDomains.some(d => senderDomain === d || senderDomain.endsWith('.' + d));
        if (isTrustedSender) {
            score += 25;
            patterns.push(`Verified sender domain: ${senderDomain} (official)`);
        }

        // Suspicious sender indicators
        const freeEmailProviders = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'rediffmail.com', 'protonmail.com', 'mail.com', 'yandex.com'];
        const isFreeEmail = freeEmailProviders.includes(senderDomain);

        // Check for typo-squatting (e.g., go0gle.com, amaz0n.com)
        const typoSquatPatterns = /^(go+gle|g00gle|amaz[o0]n|faceb[o0]+k|micr[o0]s[o0]ft|app[l1]e|payp[a@]l|hdfc[b8]ank|ic[i1]c[i1]|sbi[0o])/;
        if (typoSquatPatterns.test(senderDomain)) {
            score -= 30;
            patterns.push(`⚠ Typo-squatting domain detected: ${senderDomain} (impersonating trusted brand)`);
        }

        // Random-looking domains (scam indicator)
        const randomDomainPattern = /^[a-z]{2,4}\d{2,}\./;
        if (randomDomainPattern.test(senderDomain)) {
            score -= 15;
            patterns.push(`Suspicious random domain: ${senderDomain}`);
        }

        // Free email claiming to be an official organization
        if (isFreeEmail && /\b(bank|sbi|rbi|police|irs|customs|government|ministry|court|tribunal)\b/i.test(message)) {
            score -= 20;
            patterns.push(`⚠ Free email (${senderDomain}) claiming to be an official organization — likely phishing`);
        }
    }

    // Standard security notification language (non-coercive)
    const legitPhrases: { regex: RegExp; weight: number; desc: string }[] = [
        { regex: /if this was you,?\s*(you\s+)?(don'?t|do\s+not)\s+need\s+to\s+do\s+anything/i, weight: 20, desc: 'Non-coercive language: "if this was you, don\'t need to do anything"' },
        { regex: /we noticed a new sign.?in/i, weight: 18, desc: 'Standard security notification: new sign-in alert' },
        { regex: /we'?ll help you secure your account/i, weight: 15, desc: 'Helpful security guidance, not coercive' },
        { regex: /this is an? automated (message|notification|email|alert)/i, weight: 12, desc: 'Standard automated notification' },
        { regex: /do not reply to this (email|message)/i, weight: 10, desc: 'Standard no-reply notification' },
        { regex: /you (received|are receiving) this (email|message|notification) (because|to let you know)/i, weight: 12, desc: 'Standard footer explanation' },
        { regex: /check (activity|your activity|recent activity)/i, weight: 10, desc: 'Standard activity review prompt' },
        { regex: /security alert/i, weight: 8, desc: 'Standard security alert subject' },
        { regex: /new (sign.?in|login|device|session) (on|from|detected)/i, weight: 14, desc: 'Standard sign-in notification pattern' },
        { regex: /no-reply@/i, weight: 8, desc: 'Official no-reply sender address' },
        { regex: /you can also (see|view|check|review)/i, weight: 8, desc: 'Non-threatening optional action' },
        { regex: /unsubscribe|manage (your )?(notifications|preferences|settings)/i, weight: 8, desc: 'Standard unsubscribe/settings link (legitimate)' },
        { regex: /terms of service|privacy policy|©\s*\d{4}/i, weight: 10, desc: 'Legal footer present (legitimate email structure)' },
        { regex: /order\s*(#|number|id)\s*[\w-]+/i, weight: 10, desc: 'Standard order confirmation pattern' },
        { regex: /your (order|delivery|shipment|package) (has been|is|was)/i, weight: 10, desc: 'Standard delivery/order notification' },
        { regex: /\btransaction\s+(id|ref|reference)\b/i, weight: 8, desc: 'Standard transaction reference' },
    ];

    for (const lp of legitPhrases) {
        if (lp.regex.test(message)) {
            score += lp.weight;
            patterns.push(lp.desc);
        }
    }

    // Professional email structure signals
    // Has proper greeting + body + footer structure
    const hasProperStructure = (
        /\b(dear|hi|hello)\s+(customer|user|member|valued)/i.test(lowerMsg) ||
        /\b(team|support|service)\b/i.test(lowerMsg)
    ) && lowerMsg.length > 100;
    if (hasProperStructure) {
        score += 5;
        patterns.push('Professional email structure detected');
    }

    // No financial demands — legitimate emails don't ask for money
    const noMoneyDemand = !/\b(send|transfer|pay|deposit)\s+(money|amount|rs|₹|\d+)/i.test(lowerMsg);
    const noOTPRequest = !/\b(share|send|enter|provide)\s+(your\s+)?(otp|pin|password|cvv)/i.test(lowerMsg);
    if (noMoneyDemand && noOTPRequest && score > 0) {
        score += 10;
        patterns.push('No financial demands or credential requests (legitimate indicator)');
    }

    return { score, patterns };
}


// ============================================================
// MAIN FALLBACK ANALYSIS — Orchestrates all detectors
// ============================================================
function fallbackAnalysis(message: string, messageType: string, senderEmail: string = ''): ScamAnalysisResult {
    const grammar = detectGrammarErrors(message);
    const social = detectSocialEngineering(message);
    const threats = detectThreatsAndAuthority(message);
    const financial = detectFinancialScam(message);
    const urgency = detectUrgency(message);
    const jobScam = detectJobScam(message);
    const anomalies = detectMessageAnomalies(message, messageType);
    const legitimacy = detectLegitimacy(message, senderEmail);

    // Combine all scam patterns
    const allPatterns = [
        ...grammar.patterns,
        ...social.patterns,
        ...threats.patterns,
        ...financial.patterns,
        ...urgency.patterns,
        ...jobScam.patterns,
        ...anomalies.patterns,
    ];

    // Calculate raw scam score
    let rawScore = grammar.score + social.score + threats.score + financial.score +
        urgency.score + jobScam.score + anomalies.score;

    // Boost score if multiple categories triggered (cross-validation)
    const categoriesTriggered = [
        grammar.score > 0,
        social.score > 0,
        threats.score > 0,
        financial.score > 0,
        urgency.score > 0,
        jobScam.score > 0,
        anomalies.score > 0,
    ].filter(Boolean).length;

    if (categoriesTriggered >= 3) {
        rawScore = Math.round(rawScore * 1.2); // 20% boost for multi-category hits
        allPatterns.push(`Multiple scam indicator categories detected (${categoriesTriggered}/7) — high correlation`);
    }

    // --- LEGITIMACY COUNTERBALANCE ---
    // If strong legitimacy signals exist, drastically reduce scam score
    if (legitimacy.score > 0) {
        rawScore = Math.max(rawScore - legitimacy.score, 0);
        if (legitimacy.score >= 30) {
            // Strong legitimacy — override to safe
            rawScore = Math.min(rawScore, 10);
            allPatterns.length = 0; // Clear scam patterns
            allPatterns.push(...legitimacy.patterns);
        }
    }

    // Normalize confidence to 0-100
    const confidence = Math.min(Math.max(rawScore, 0), 100);

    // Determine if scam — lower threshold for better detection
    const isScam = confidence >= 15;

    // Risk level with better thresholds
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (confidence >= 75) riskLevel = 'critical';
    else if (confidence >= 50) riskLevel = 'high';
    else if (confidence >= 25) riskLevel = 'medium';
    else if (confidence >= 15) riskLevel = 'low';

    // Smart fraud category classification based on highest scoring category
    const categoryScores: { category: string; score: number }[] = [
        { category: 'Digital Arrest Scam', score: threats.score },
        { category: 'Social Engineering', score: social.score },
        { category: 'Financial Fraud', score: financial.score },
        { category: 'Job/Task Scam', score: jobScam.score },
        { category: 'Urgency/Pressure Scam', score: urgency.score },
    ];

    // More specific sub-categories
    const lowerMsg = message.toLowerCase();
    if (lowerMsg.match(/\b(lonely|love|relationship|heart|dating|marry|partner)\b/)) {
        categoryScores.push({ category: 'Romance Scam', score: social.score + 10 });
    }
    if (lowerMsg.match(/\b(lottery|prize|winner|won|congratulations)\b/)) {
        categoryScores.push({ category: 'Lottery/Prize Scam', score: financial.score + 10 });
    }
    if (lowerMsg.match(/\b(invest|stock|trading|return|profit|mutual\s+fund)\b/)) {
        categoryScores.push({ category: 'Investment Scam', score: financial.score + 10 });
    }
    if (lowerMsg.match(/\b(loan|emi|credit|pre.?approved)\b/)) {
        categoryScores.push({ category: 'Loan Scam', score: financial.score + 10 });
    }
    if (lowerMsg.match(/\b(kyc|verify|update|expire|link\s+pan|link\s+aadhaar)\b/)) {
        categoryScores.push({ category: 'Phishing / KYC Scam', score: financial.score + 10 });
    }
    if (lowerMsg.match(/\b(nude|video\s+call|intimate|expose|leak|private\s+photo)\b/)) {
        categoryScores.push({ category: 'Sextortion', score: social.score + 15 });
    }
    if (lowerMsg.match(/\b(customs|parcel|courier|seized|drugs)\b/)) {
        categoryScores.push({ category: 'Customs/Parcel Scam', score: threats.score + 10 });
    }
    if (lowerMsg.match(/\b(tech\s+support|microsoft|windows|virus|malware|remote\s+access)\b/)) {
        categoryScores.push({ category: 'Tech Support Scam', score: financial.score + 10 });
    }

    categoryScores.sort((a, b) => b.score - a.score);
    let fraudCategory = 'General Suspicious Communication';
    if (categoryScores[0] && categoryScores[0].score > 0) {
        fraudCategory = categoryScores[0].category;
    }

    // special case: if only grammar flagged it
    if (grammar.score > 0 && social.score === 0 && threats.score === 0 && financial.score === 0 && urgency.score === 0 && jobScam.score === 0) {
        fraudCategory = 'Suspicious Communication (Language Anomalies)';
    }

    // special case: if legitimacy signals overrode the scam detection
    if (legitimacy.score >= 30 && !isScam) {
        fraudCategory = 'Legitimate Notification';
    }

    // Build explanation
    let explanation = '';
    if (legitimacy.score >= 30 && !isScam) {
        explanation = `This ${messageType.replace('_', ' ')} message appears to be a legitimate notification. Our analysis detected ${legitimacy.patterns.length} legitimacy signal(s) including official domain references, standard notification language, and non-coercive tone. The message does not request sensitive information or financial payments. This appears safe, but always verify by logging in directly to the official website rather than clicking links in emails.`;
    } else if (isScam) {
        explanation = `This ${messageType.replace('_', ' ')} message shows ${allPatterns.length} suspicious indicator(s) across ${categoriesTriggered} detection categor${categoriesTriggered === 1 ? 'y' : 'ies'}. `;
        if (grammar.score > 0) explanation += `Language analysis reveals grammar/spelling errors commonly associated with scam operations. `;
        if (social.score > 0) explanation += `Social engineering patterns suggest attempts to build false trust or manipulate the recipient. `;
        if (threats.score > 0) explanation += `Authority impersonation and/or threat-based manipulation detected. `;
        if (financial.score > 0) explanation += `Financial fraud indicators including money demands or sensitive data requests found. `;
        if (urgency.score > 0) explanation += `Urgency and time-pressure tactics designed to prevent rational decision-making detected. `;
        if (jobScam.score > 0) explanation += `Job/task scam indicators with promises of easy income detected. `;
        explanation += `Overall scam confidence: ${confidence}%. Exercise extreme caution.`;
    } else {
        explanation = `This ${messageType.replace('_', ' ')} message does not show strong indicators of fraud based on our pattern analysis. However, always exercise caution with unsolicited communications. If you feel something is off, trust your instincts and verify through official channels.`;
    }

    // Financial risk assessment
    let financialRisk = 'No immediate financial risk detected';
    if (financial.score > 15) financialRisk = 'High financial risk — direct monetary demands or sensitive data requests detected';
    else if (financial.score > 5) financialRisk = 'Moderate financial risk — financial elements present in communication';
    else if (social.score > 10) financialRisk = 'Potential future financial risk — social engineering may lead to financial exploitation';
    else if (threats.score > 10) financialRisk = 'Intimidation-based financial risk — threats may lead to panic-driven payments';

    return {
        isScam,
        confidence,
        fraudCategory,
        riskLevel,
        financialRisk,
        scamPatterns: allPatterns.length > 0 ? allPatterns : ['No clear scam patterns detected — message appears benign'],
        explanation,
        suggestedReply: isScam
            ? 'I am aware this is a potential scam attempt. I will not share any personal information. I have reported this to the Cyber Crime Cell. Do not contact me again.'
            : 'Thank you for your message. I will verify this through official channels before taking any action.',
        actionSteps: isScam
            ? [
                'Do NOT respond to the sender',
                'Do NOT share any personal information, OTP, or banking details',
                'Do NOT click any links or download attachments',
                'Block the sender immediately',
                'Take screenshots of the entire conversation as evidence',
                'Report to Cyber Crime helpline: 1930',
                'File an online complaint at cybercrime.gov.in',
                'If any financial details were shared, contact your bank immediately',
                'Inform family members to prevent further contact attempts',
            ]
            : [
                'Verify sender identity through official channels',
                'Do not share sensitive information with unknown contacts',
                'If suspicious, report at cybercrime.gov.in',
                'Trust your instincts — if something feels wrong, it probably is',
            ],
    };
}

function generateFallbackFIR(
    analysis: ScamAnalysisResult,
    originalMessage: string,
    messageType: string,
    submitterName: string
): string {
    const date = new Date().toLocaleDateString('en-IN');

    return `
FIRST INFORMATION REPORT (FIR) - DRAFT
═══════════════════════════════════════════════════
Under Section 66C/66D of Information Technology Act, 2000
& Relevant Sections of Bharatiya Nyaya Sanhita (BNS)

1. COMPLAINANT DETAILS:
   Name: ${submitterName}
   Date of Report: ${date}
   (Additional details to be filled by complainant)

2. NATURE OF COMPLAINT:
   Category: ${analysis.fraudCategory}
   Communication Medium: ${messageType.replace('_', ' ').toUpperCase()}
   Risk Level: ${analysis.riskLevel.toUpperCase()}
   AI Confidence Score: ${analysis.confidence}%

3. DETAILED DESCRIPTION:
   The complainant received a suspicious ${messageType.replace('_', ' ')} communication
   identified as a potential ${analysis.fraudCategory}.
   
   Suspicious Patterns Detected:
${analysis.scamPatterns.map((p, i) => `   ${i + 1}. ${p}`).join('\n')}

4. ORIGINAL MESSAGE (EVIDENCE):
   """
   ${originalMessage.substring(0, 500)}${originalMessage.length > 500 ? '...' : ''}
   """

5. FINANCIAL RISK ASSESSMENT:
   ${analysis.financialRisk}

6. RECOMMENDED ACTIONS:
${analysis.actionSteps.map((s, i) => `   ${i + 1}. ${s}`).join('\n')}

7. DECLARATION:
   I hereby declare that the information given above is true and correct
   to the best of my knowledge and belief.

   Signature: _______________
   Date: ${date}
   Place: _______________

═══════════════════════════════════════════════════
Note: This is an AI-generated draft FIR. Please review and modify
as needed before submission to the nearest Cyber Crime Police Station.
Report online at: https://cybercrime.gov.in
Helpline: 1930
═══════════════════════════════════════════════════
  `.trim();
}
