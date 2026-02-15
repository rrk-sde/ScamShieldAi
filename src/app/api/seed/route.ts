import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import DepartmentUser from '@/models/DepartmentUser';
import ScamCase from '@/models/ScamCase';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const { action } = await req.json();

        if (action === 'seed-users') {
            // Seed default department users
            const existingAdmin = await DepartmentUser.findOne({ email: 'admin@cybercell.gov.in' });

            if (!existingAdmin) {
                const users = [
                    {
                        name: 'Inspector Rajesh Kumar',
                        email: 'admin@cybercell.gov.in',
                        password: await bcrypt.hash('admin123', 12),
                        role: 'admin',
                        department: 'Cyber Crime Cell - HQ',
                        badge: 'CC-001',
                    },
                    {
                        name: 'SI Priya Sharma',
                        email: 'priya@cybercell.gov.in',
                        password: await bcrypt.hash('officer123', 12),
                        role: 'officer',
                        department: 'Cyber Crime Cell - Zone 1',
                        badge: 'CC-042',
                    },
                    {
                        name: 'Analyst Vikram Singh',
                        email: 'vikram@cybercell.gov.in',
                        password: await bcrypt.hash('analyst123', 12),
                        role: 'analyst',
                        department: 'Digital Forensics Lab',
                        badge: 'DFL-007',
                    },
                ];

                await DepartmentUser.insertMany(users);
            }

            return NextResponse.json({ success: true, message: 'Users seeded successfully' });
        }

        if (action === 'seed-cases') {
            const existingCases = await ScamCase.countDocuments();

            if (existingCases === 0) {
                const sampleCases = [
                    {
                        caseId: 'SC-2026-A1B2C3',
                        submittedBy: 'Rahul Verma',
                        contactEmail: 'rahul@email.com',
                        contactPhone: '9876543210',
                        messageType: 'whatsapp',
                        originalMessage: 'Dear Sir, This is Inspector Rakesh from CBI Cyber Crime Division. Your Aadhaar card has been used in multiple illegal transactions. A digital arrest warrant has been issued against you. You must immediately transfer ₹50,000 to the following UPI ID to clear your name: cbi.officer@paytm. Failure to comply within 2 hours will result in physical arrest. Your bank accounts will be frozen. Call me at +91-9876543210 immediately.',
                        analysis: {
                            isScam: true,
                            confidence: 96,
                            fraudCategory: 'Digital Arrest Scam',
                            riskLevel: 'critical' as const,
                            financialRisk: 'Direct financial demand of ₹50,000',
                            scamPatterns: [
                                'Government impersonation (CBI)',
                                'Urgency tactics (2 hour deadline)',
                                'Financial demand via UPI',
                                'Threat of arrest',
                                'Aadhaar misuse claim',
                            ],
                            explanation: 'This is a classic Digital Arrest Scam where scammers impersonate law enforcement officials to extort money through fear and urgency.',
                            suggestedReply: 'I am aware this is a scam. CBI does not conduct digital arrests or demand money via UPI. This has been reported to cybercrime.gov.in.',
                            actionSteps: [
                                'Do NOT make any payment',
                                'Report to National Cyber Crime Helpline: 1930',
                                'File complaint at cybercrime.gov.in',
                                'Block the number',
                                'Report the UPI ID to the payment platform',
                            ],
                        },
                        firDraft: 'FIRST INFORMATION REPORT (FIR) - DRAFT\n\nCategory: Digital Arrest Scam\nRisk Level: CRITICAL\n\nDetails: Complainant received a WhatsApp message from someone impersonating a CBI officer demanding ₹50,000 via UPI under threat of digital arrest.\n\nEvidence: WhatsApp message preserved.\n\nAction Required: Trace UPI ID, identify perpetrator, block fraudulent accounts.',
                        status: 'open',
                    },
                    {
                        caseId: 'SC-2026-D4E5F6',
                        submittedBy: 'Sunita Devi',
                        contactEmail: 'sunita@email.com',
                        contactPhone: '8765432109',
                        messageType: 'sms',
                        originalMessage: 'Congratulations! You have won ₹25,00,000 in the KBC Lottery Season 15. To claim your prize, send ₹5,000 processing fee to this account. Bank: SBI, A/C: 123456789, IFSC: SBIN0001234. Limited time offer - respond within 24 hours! Contact: KBC Official +91-7654321098',
                        analysis: {
                            isScam: true,
                            confidence: 94,
                            fraudCategory: 'Lottery/Prize Scam',
                            riskLevel: 'high' as const,
                            financialRisk: 'Processing fee demand of ₹5,000 with potential for escalation',
                            scamPatterns: [
                                'Fake lottery/prize notification',
                                'Advance fee demand',
                                'Urgency with time limit',
                                'Impersonation of TV show',
                                'Bank account details for direct transfer',
                            ],
                            explanation: 'Classic lottery scam impersonating KBC (Kaun Banega Crorepati). Legitimate lotteries never require advance payment.',
                            suggestedReply: 'This is a fraudulent message. KBC does not conduct SMS lotteries. I am reporting this to authorities.',
                            actionSteps: [
                                'Do NOT send any money',
                                'Block the sender',
                                'Report to 1930',
                                'Do not share personal details',
                            ],
                        },
                        firDraft: 'FIRST INFORMATION REPORT (FIR) - DRAFT\n\nCategory: Lottery/Prize Scam\nRisk Level: HIGH\n\nDetails: Complainant received an SMS claiming lottery winnings from KBC with demand for processing fee of ₹5,000.',
                        status: 'under_investigation',
                    },
                    {
                        caseId: 'SC-2026-G7H8I9',
                        submittedBy: 'Amit Patel',
                        contactEmail: 'amit@email.com',
                        contactPhone: '7654321098',
                        messageType: 'email',
                        originalMessage: 'From: security@indiapost-gov.org\nSubject: Parcel Seized - Immediate Action Required\n\nDear Customer,\nYour parcel (Tracking: IP2026789456) has been seized by customs at Mumbai International Airport. The package contains suspicious items and may be linked to drug trafficking.\n\nTo avoid criminal prosecution, you must:\n1. Pay customs clearance fee: ₹15,000\n2. Verify your identity immediately\n\nClick here to make payment: http://bit.ly/3xyzabc\n\nIndian Customs Department\nMumbai Division',
                        analysis: {
                            isScam: true,
                            confidence: 92,
                            fraudCategory: 'Phishing',
                            riskLevel: 'high' as const,
                            financialRisk: 'Payment demand of ₹15,000 plus potential identity theft',
                            scamPatterns: [
                                'Government impersonation (Customs)',
                                'Suspicious domain (not .gov.in)',
                                'Threat of criminal prosecution',
                                'Shortened/suspicious URL',
                                'Demand for payment and personal info',
                            ],
                            explanation: 'Phishing email impersonating Indian Customs. The domain indiapost-gov.org is fake - real government emails use .gov.in domains.',
                            suggestedReply: 'This is a phishing attempt. Official customs communications use .gov.in domains and never demand payment via links.',
                            actionSteps: [
                                'Do NOT click any links',
                                'Do NOT make any payment',
                                'Report to Indian Computer Emergency Response Team (CERT-In)',
                                'Forward email to phishing@cybercrime.gov.in',
                                'Delete the email',
                            ],
                        },
                        firDraft: 'FIRST INFORMATION REPORT (FIR) - DRAFT\n\nCategory: Phishing\nRisk Level: HIGH\n\nDetails: Complainant received phishing email impersonating Indian Customs demanding ₹15,000 and personal information.',
                        status: 'open',
                    },
                    {
                        caseId: 'SC-2026-J1K2L3',
                        submittedBy: 'Deepak Sharma',
                        contactEmail: 'deepak@email.com',
                        contactPhone: '6543210987',
                        messageType: 'whatsapp',
                        originalMessage: 'Hi! I am Shruti from Mumbai. I found your number from a mutual friend. How are you? I work in international crypto trading and make ₹2-3 lakhs daily. Would you like to learn? I can teach you my strategy for free. Just invest ₹10,000 to start and I guarantee 10x returns in one week. Join my VIP group: https://t.me/cryptovip2026. I have proofs of all my earnings!',
                        analysis: {
                            isScam: true,
                            confidence: 89,
                            fraudCategory: 'Investment Scam',
                            riskLevel: 'high' as const,
                            financialRisk: 'Initial ₹10,000 with potential for escalating demands',
                            scamPatterns: [
                                'Unsolicited contact from stranger',
                                'Unrealistic returns promise (10x in one week)',
                                'Cryptocurrency investment lure',
                                'Guaranteed returns claim',
                                'Telegram group redirect',
                                'Social engineering (friendship approach)',
                            ],
                            explanation: 'This is a pig butchering/investment scam. The scammer builds trust before luring victim into fake crypto investments.',
                            suggestedReply: 'I do not engage with unsolicited investment offers. This conversation has been reported.',
                            actionSteps: [
                                'Do NOT invest any money',
                                'Block the number',
                                'Report to 1930',
                                'Do not join any Telegram groups',
                                'Warn contacts about this type of scam',
                            ],
                        },
                        firDraft: 'FIRST INFORMATION REPORT (FIR) - DRAFT\n\nCategory: Investment Scam\nRisk Level: HIGH\n\nDetails: Complainant received unsolicited WhatsApp message with cryptocurrency investment scam offering guaranteed 10x returns.',
                        status: 'resolved',
                    },
                    {
                        caseId: 'SC-2026-M4N5O6',
                        submittedBy: 'Kavita Joshi',
                        contactEmail: 'kavita@email.com',
                        contactPhone: '5432109876',
                        messageType: 'call_transcript',
                        originalMessage: 'Caller: Hello, this is Officer Sharma from RBI. Your bank account number ending in 4567 has been flagged for money laundering. We need to verify your account by transferring all funds to a safe RBI account. Please share your net banking password and OTP. If you do not comply, your account will be permanently seized and you will be arrested within 24 hours. This call is being recorded by the Supreme Court.',
                        analysis: {
                            isScam: true,
                            confidence: 98,
                            fraudCategory: 'Digital Arrest Scam',
                            riskLevel: 'critical' as const,
                            financialRisk: 'Full bank account amount at risk',
                            scamPatterns: [
                                'RBI impersonation',
                                'Money laundering accusation',
                                'Demand for banking credentials (password, OTP)',
                                'Transfer to "safe account" request',
                                'Arrest threat',
                                'Supreme Court intimidation',
                                'Time pressure (24 hours)',
                            ],
                            explanation: 'Extremely dangerous Digital Arrest Scam. RBI NEVER calls individuals, never asks for passwords/OTPs, and never requests fund transfers. Supreme Court does not record calls.',
                            suggestedReply: 'RBI does not make such calls. This is a criminal offense under IT Act. I am filing an FIR.',
                            actionSteps: [
                                'Hang up immediately',
                                'Do NOT share any banking details',
                                'Call your bank immediately to flag the incident',
                                'Report to 1930',
                                'File FIR at cybercrime.gov.in',
                                'Change all banking passwords',
                            ],
                        },
                        firDraft: 'FIRST INFORMATION REPORT (FIR) - DRAFT\n\nCategory: Digital Arrest Scam\nRisk Level: CRITICAL\n\nDetails: Complainant received phone call from person impersonating RBI officer demanding banking credentials and fund transfer under threat of arrest.',
                        status: 'under_investigation',
                    },
                ];

                await ScamCase.insertMany(sampleCases);
            }

            return NextResponse.json({ success: true, message: 'Sample cases seeded successfully' });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Seed API Error:', error);
        return NextResponse.json(
            { error: 'Seeding failed' },
            { status: 500 }
        );
    }
}
