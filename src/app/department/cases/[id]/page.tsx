'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Shield, ArrowLeft, AlertTriangle, CheckCircle2, XCircle, Bot,
    FileText, Send, Clock, User, MessageSquare, Loader2,
    Eye, EyeOff, StickyNote, Save,
} from 'lucide-react';

interface InternalNote {
    note: string;
    addedBy: string;
    addedAt: string;
}

interface ScamCaseDetail {
    _id: string;
    caseId: string;
    submittedBy: string;
    contactEmail: string;
    contactPhone: string;
    messageType: string;
    originalMessage: string;
    analysis: {
        isScam: boolean;
        confidence: number;
        fraudCategory: string;
        riskLevel: string;
        financialRisk: string;
        scamPatterns: string[];
        explanation: string;
        suggestedReply: string;
        actionSteps: string[];
    };
    firDraft: string;
    status: string;
    assignedTo: string;
    internalNotes: InternalNote[];
    createdAt: string;
    updatedAt: string;
}

const RISK_COLORS: Record<string, string> = {
    critical: '#EF4444',
    high: '#F97316',
    medium: '#EAB308',
    low: '#22C55E',
};

const STATUS_OPTIONS = [
    { value: 'open', label: 'Open', color: '#3B82F6' },
    { value: 'under_investigation', label: 'Under Investigation', color: '#F59E0B' },
    { value: 'resolved', label: 'Resolved', color: '#10B981' },
    { value: 'dismissed', label: 'Dismissed', color: '#6B7280' },
];

export default function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [caseData, setCaseData] = useState<ScamCaseDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [showFIR, setShowFIR] = useState(false);
    const [showOriginal, setShowOriginal] = useState(false);
    const [newNote, setNewNote] = useState('');
    const [updating, setUpdating] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('scamshield_token');
        if (!token) {
            router.push('/department/login');
            return;
        }
        fetchCase();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, router]);

    const fetchCase = async () => {
        try {
            const res = await fetch(`/api/cases/${id}`);
            const data = await res.json();
            if (data.case) {
                setCaseData(data.case);
                setSelectedStatus(data.case.status);
            }
        } catch (error) {
            console.error('Failed to fetch case:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateCase = async (updates: Record<string, string>) => {
        setUpdating(true);
        try {
            const res = await fetch(`/api/cases/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });
            const data = await res.json();
            if (data.case) {
                setCaseData(data.case);
            }
        } catch (error) {
            console.error('Failed to update case:', error);
        } finally {
            setUpdating(false);
        }
    };

    const handleStatusChange = (newStatus: string) => {
        setSelectedStatus(newStatus);
        updateCase({ status: newStatus });
    };

    const handleAddNote = () => {
        if (!newNote.trim()) return;
        const user = JSON.parse(localStorage.getItem('scamshield_user') || '{}');
        updateCase({
            internalNote: newNote,
            noteAddedBy: user.name || 'Unknown Officer',
        });
        setNewNote('');
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 size={48} style={{ color: 'var(--accent-primary)', animation: 'spin 1s linear infinite' }} />
            </div>
        );
    }

    if (!caseData) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
                <XCircle size={48} style={{ color: 'var(--danger)' }} />
                <h2>Case Not Found</h2>
                <Link href="/department/dashboard" className="btn-primary" style={{ textDecoration: 'none' }}>
                    Back to Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh' }}>
            {/* Top Bar */}
            <nav style={{
                padding: '12px 24px', borderBottom: '1px solid var(--border-color)',
                background: 'rgba(10, 14, 26, 0.95)', backdropFilter: 'blur(20px)',
                position: 'sticky', top: 0, zIndex: 100,
            }}>
                <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <Link href="/department/dashboard" style={{
                            display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)',
                            textDecoration: 'none', fontSize: 14,
                        }}>
                            <ArrowLeft size={18} />
                            Dashboard
                        </Link>
                        <div style={{ height: 24, width: 1, background: 'var(--border-color)' }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Shield size={20} style={{ color: 'var(--accent-primary)' }} />
                            <span className="mono" style={{ fontWeight: 700, fontSize: 16 }}>{caseData.caseId}</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span className={`risk-${caseData.analysis.riskLevel}`} style={{
                            padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, textTransform: 'uppercase',
                        }}>
                            {caseData.analysis.riskLevel} RISK
                        </span>
                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                            {caseData.analysis.confidence}% confidence
                        </span>
                    </div>
                </div>
            </nav>

            <div className="page-container fade-in" style={{ maxWidth: 1400 }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
                    <div>
                        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
                            {caseData.analysis.fraudCategory}
                        </h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: 'var(--text-secondary)', fontSize: 14 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <User size={14} />
                                {caseData.submittedBy}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <MessageSquare size={14} />
                                {caseData.messageType.replace('_', ' ')}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Clock size={14} />
                                {new Date(caseData.createdAt).toLocaleString('en-IN')}
                            </span>
                        </div>
                    </div>

                    {/* Status Control */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>STATUS:</span>
                        <div style={{ display: 'flex', gap: 6 }}>
                            {STATUS_OPTIONS.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => handleStatusChange(opt.value)}
                                    disabled={updating}
                                    style={{
                                        padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                                        border: `1px solid ${selectedStatus === opt.value ? opt.color : 'var(--border-color)'}`,
                                        background: selectedStatus === opt.value ? `${opt.color}22` : 'transparent',
                                        color: selectedStatus === opt.value ? opt.color : 'var(--text-muted)',
                                        cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                                        transition: 'all var(--transition-fast)',
                                    }}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
                    {/* Left Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        {/* Score Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                            <div className="glass-card stat-card" style={{ textAlign: 'center' }}>
                                <div className="stat-label">Risk Level</div>
                                <div style={{ marginTop: 8 }}>
                                    <span className={`risk-${caseData.analysis.riskLevel}`} style={{
                                        padding: '8px 20px', borderRadius: 8, fontWeight: 700, fontSize: 18, textTransform: 'uppercase',
                                    }}>
                                        {caseData.analysis.riskLevel}
                                    </span>
                                </div>
                            </div>
                            <div className="glass-card stat-card" style={{ textAlign: 'center' }}>
                                <div className="stat-label">AI Confidence</div>
                                <div className="stat-value" style={{ color: RISK_COLORS[caseData.analysis.riskLevel] }}>
                                    {caseData.analysis.confidence}%
                                </div>
                                <div className="confidence-bar" style={{ marginTop: 8 }}>
                                    <div className="confidence-fill" style={{
                                        width: `${caseData.analysis.confidence}%`,
                                        background: RISK_COLORS[caseData.analysis.riskLevel],
                                    }} />
                                </div>
                            </div>
                            <div className="glass-card stat-card" style={{ textAlign: 'center' }}>
                                <div className="stat-label">Scam Detected</div>
                                <div style={{ marginTop: 8 }}>
                                    {caseData.analysis.isScam ? (
                                        <AlertTriangle size={32} style={{ color: 'var(--danger)' }} />
                                    ) : (
                                        <CheckCircle2 size={32} style={{ color: 'var(--success)' }} />
                                    )}
                                </div>
                                <div style={{ fontSize: 14, fontWeight: 600, color: caseData.analysis.isScam ? 'var(--danger)' : 'var(--success)', marginTop: 4 }}>
                                    {caseData.analysis.isScam ? 'YES - SCAM' : 'NO SCAM'}
                                </div>
                            </div>
                        </div>

                        {/* AI Analysis */}
                        <div className="glass-card" style={{ padding: 28 }}>
                            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Bot size={20} style={{ color: 'var(--accent-primary)' }} />
                                AI Analysis Report
                            </h3>
                            <p style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--text-secondary)' }}>
                                {caseData.analysis.explanation}
                            </p>
                        </div>

                        {/* Scam Patterns */}
                        <div className="glass-card" style={{ padding: 28 }}>
                            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <AlertTriangle size={20} style={{ color: 'var(--warning)' }} />
                                Detected Patterns
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {caseData.analysis.scamPatterns.map((pattern, i) => (
                                    <div key={i} style={{
                                        display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px',
                                        background: 'rgba(239, 68, 68, 0.08)', borderRadius: 8, fontSize: 14,
                                        border: '1px solid rgba(239, 68, 68, 0.15)',
                                    }}>
                                        <XCircle size={16} style={{ color: 'var(--danger)', flexShrink: 0, marginTop: 2 }} />
                                        <span>{pattern}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Action Steps */}
                        <div className="glass-card" style={{ padding: 28 }}>
                            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <CheckCircle2 size={20} style={{ color: 'var(--success)' }} />
                                Recommended Actions
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {caseData.analysis.actionSteps.map((step, i) => (
                                    <div key={i} style={{
                                        display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px',
                                        background: 'rgba(16, 185, 129, 0.08)', borderRadius: 8, fontSize: 14,
                                        border: '1px solid rgba(16, 185, 129, 0.15)',
                                    }}>
                                        <div style={{
                                            width: 22, height: 22, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                            fontSize: 12, fontWeight: 700, color: 'var(--success)',
                                        }}>
                                            {i + 1}
                                        </div>
                                        <span>{step}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Original Message */}
                        <div className="glass-card" style={{ padding: 28 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <h3 style={{ fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <MessageSquare size={20} style={{ color: 'var(--accent-primary)' }} />
                                    Original Message
                                </h3>
                                <button
                                    onClick={() => setShowOriginal(!showOriginal)}
                                    className="btn-secondary"
                                    style={{ padding: '6px 14px', fontSize: 12 }}
                                >
                                    {showOriginal ? <EyeOff size={14} style={{ marginRight: 4, display: 'inline' }} /> : <Eye size={14} style={{ marginRight: 4, display: 'inline' }} />}
                                    {showOriginal ? 'Hide' : 'Show'}
                                </button>
                            </div>
                            {showOriginal && (
                                <pre style={{
                                    background: 'rgba(0,0,0,0.3)', padding: 20, borderRadius: 12, fontSize: 13,
                                    fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.7, color: 'var(--text-secondary)',
                                    whiteSpace: 'pre-wrap', wordWrap: 'break-word',
                                    border: '1px solid var(--border-color)',
                                }}>
                                    {caseData.originalMessage}
                                </pre>
                            )}
                        </div>

                        {/* FIR Draft */}
                        <div className="glass-card" style={{ padding: 28 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <h3 style={{ fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <FileText size={20} style={{ color: 'var(--accent-primary)' }} />
                                    FIR Draft
                                </h3>
                                <button
                                    onClick={() => setShowFIR(!showFIR)}
                                    className="btn-secondary"
                                    style={{ padding: '6px 14px', fontSize: 12 }}
                                >
                                    {showFIR ? 'Collapse' : 'Expand'}
                                </button>
                            </div>
                            {showFIR && (
                                <pre style={{
                                    background: 'rgba(0,0,0,0.3)', padding: 20, borderRadius: 12, fontSize: 13,
                                    fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.7, color: 'var(--text-secondary)',
                                    whiteSpace: 'pre-wrap', wordWrap: 'break-word', maxHeight: 500, overflowY: 'auto',
                                    border: '1px solid var(--border-color)',
                                }}>
                                    {caseData.firDraft}
                                </pre>
                            )}
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        {/* Case Info */}
                        <div className="glass-card" style={{ padding: 24 }}>
                            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>📋 Case Information</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                {[
                                    { label: 'Case ID', value: caseData.caseId },
                                    { label: 'Submitted By', value: caseData.submittedBy },
                                    { label: 'Contact Email', value: caseData.contactEmail || 'N/A' },
                                    { label: 'Contact Phone', value: caseData.contactPhone || 'N/A' },
                                    { label: 'Message Type', value: caseData.messageType.replace('_', ' ').toUpperCase() },
                                    { label: 'Filed On', value: new Date(caseData.createdAt).toLocaleString('en-IN') },
                                    { label: 'Last Updated', value: new Date(caseData.updatedAt).toLocaleString('en-IN') },
                                ].map((item, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid rgba(99, 102, 241, 0.08)' }}>
                                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{item.label}</span>
                                        <span style={{ fontSize: 13, fontWeight: 600, textAlign: 'right', maxWidth: '60%', wordBreak: 'break-all' }}>{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Financial Risk */}
                        <div className="glass-card" style={{ padding: 24 }}>
                            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: 'var(--warning)' }}>
                                💰 Financial Risk
                            </h3>
                            <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                                {caseData.analysis.financialRisk}
                            </p>
                        </div>

                        {/* Suggested Reply */}
                        <div className="glass-card" style={{ padding: 24 }}>
                            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Send size={16} style={{ color: 'var(--info)' }} />
                                Safe Reply
                            </h3>
                            <div style={{
                                padding: 16, background: 'rgba(59, 130, 246, 0.08)', borderRadius: 8,
                                border: '1px solid rgba(59, 130, 246, 0.15)', fontSize: 13,
                                lineHeight: 1.7, color: 'var(--text-secondary)', fontStyle: 'italic',
                            }}>
                                &quot;{caseData.analysis.suggestedReply}&quot;
                            </div>
                        </div>

                        {/* Internal Notes */}
                        <div className="glass-card" style={{ padding: 24 }}>
                            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <StickyNote size={18} style={{ color: 'var(--accent-primary)' }} />
                                Internal Notes
                            </h3>

                            {/* Existing Notes */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                                {caseData.internalNotes.length === 0 ? (
                                    <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: 16 }}>
                                        No notes yet
                                    </p>
                                ) : (
                                    caseData.internalNotes.map((note, i) => (
                                        <div key={i} style={{
                                            padding: 12, background: 'rgba(99, 102, 241, 0.05)', borderRadius: 8,
                                            border: '1px solid rgba(99, 102, 241, 0.1)',
                                        }}>
                                            <p style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 8 }}>{note.note}</p>
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                                                <span>{note.addedBy}</span>
                                                <span>{new Date(note.addedAt).toLocaleString('en-IN')}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Add Note */}
                            <div style={{ display: 'flex', gap: 8 }}>
                                <textarea
                                    className="input-field"
                                    placeholder="Add internal note..."
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                    style={{ minHeight: 60, fontSize: 13 }}
                                />
                            </div>
                            <button
                                onClick={handleAddNote}
                                disabled={!newNote.trim() || updating}
                                className="btn-primary"
                                style={{ width: '100%', padding: 10, fontSize: 13, marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                            >
                                <Save size={14} />
                                {updating ? 'Saving...' : 'Add Note'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
