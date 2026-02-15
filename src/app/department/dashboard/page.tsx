'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Shield, BarChart3, FileText, Search, Filter, ChevronLeft, ChevronRight,
    LogOut, User, AlertTriangle, ShieldCheck, ShieldAlert, Clock, CheckCircle,
    TrendingUp, Activity, PieChart, Eye, RefreshCw,
    XCircle, Loader2,
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart as RechartsPieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts';

interface DepartmentUser {
    id: string;
    name: string;
    email: string;
    role: string;
    department: string;
    badge: string;
}

interface ScamCaseRow {
    _id: string;
    caseId: string;
    submittedBy: string;
    senderEmail?: string;
    messageType: string;
    analysis: {
        isScam: boolean;
        confidence: number;
        fraudCategory: string;
        riskLevel: string;
    };
    status: string;
    createdAt: string;
}

interface Analytics {
    overview: {
        totalCases: number;
        openCases: number;
        investigatingCases: number;
        resolvedCases: number;
        dismissedCases: number;
        avgConfidence: number;
        scamDetectionRate: number;
    };
    riskDistribution: { name: string; value: number }[];
    categoryDistribution: { name: string; value: number }[];
    recentCases: ScamCaseRow[];
    monthlyTrend: { date: string; cases: number; avgConfidence: number }[];
}

const RISK_COLORS: Record<string, string> = {
    critical: '#EF4444',
    high: '#F97316',
    medium: '#EAB308',
    low: '#22C55E',
};

const STATUS_LABELS: Record<string, string> = {
    open: 'Open',
    under_investigation: 'Under Investigation',
    resolved: 'Resolved',
    dismissed: 'Dismissed',
};

const PIE_COLORS = ['#6366F1', '#8B5CF6', '#A78BFA', '#C4B5FD', '#E9D5FF', '#F59E0B', '#10B981', '#EF4444', '#3B82F6', '#EC4899'];

export default function DepartmentDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<DepartmentUser | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'cases' | 'analytics'>('overview');
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [cases, setCases] = useState<ScamCaseRow[]>([]);
    const [totalCases, setTotalCases] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [riskFilter, setRiskFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [casesLoading, setCasesLoading] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('scamshield_user');
        const token = localStorage.getItem('scamshield_token');

        if (!storedUser || !token) {
            router.push('/department/login');
            return;
        }

        setUser(JSON.parse(storedUser));
        fetchAnalytics();
    }, [router]);

    const fetchAnalytics = async () => {
        try {
            const res = await fetch('/api/analytics');
            const data = await res.json();
            setAnalytics(data);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCases = useCallback(async () => {
        setCasesLoading(true);
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: '10',
                ...(statusFilter !== 'all' && { status: statusFilter }),
                ...(riskFilter !== 'all' && { riskLevel: riskFilter }),
                ...(searchQuery && { search: searchQuery }),
            });

            const res = await fetch(`/api/cases?${params}`);
            const data = await res.json();
            setCases(data.cases || []);
            setTotalCases(data.total || 0);
            setTotalPages(data.totalPages || 1);
        } catch (error) {
            console.error('Failed to fetch cases:', error);
        } finally {
            setCasesLoading(false);
        }
    }, [currentPage, statusFilter, riskFilter, searchQuery]);

    useEffect(() => {
        if (activeTab === 'cases') {
            fetchCases();
        }
    }, [activeTab, fetchCases]);

    const handleLogout = () => {
        localStorage.removeItem('scamshield_token');
        localStorage.removeItem('scamshield_user');
        router.push('/department/login');
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <Loader2 size={48} style={{ color: 'var(--accent-primary)', animation: 'spin 1s linear infinite', marginBottom: 16 }} />
                    <p style={{ color: 'var(--text-secondary)' }}>Loading Dashboard...</p>
                </div>
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
                <div style={{ maxWidth: 1600, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
                            <Shield size={28} className="shield-glow" style={{ color: 'var(--accent-primary)' }} />
                            <span style={{ fontSize: 18, fontWeight: 800 }} className="gradient-text">ScamShield</span>
                        </Link>
                        <div style={{ height: 24, width: 1, background: 'var(--border-color)' }} />
                        <div style={{ display: 'flex', gap: 4 }}>
                            {(['overview', 'cases', 'analytics'] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`tab-item ${activeTab === tab ? 'active' : ''}`}
                                >
                                    {tab === 'overview' && <BarChart3 size={16} style={{ marginRight: 6, display: 'inline', verticalAlign: 'text-bottom' }} />}
                                    {tab === 'cases' && <FileText size={16} style={{ marginRight: 6, display: 'inline', verticalAlign: 'text-bottom' }} />}
                                    {tab === 'analytics' && <PieChart size={16} style={{ marginRight: 6, display: 'inline', verticalAlign: 'text-bottom' }} />}
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        {user && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: '50%', background: 'var(--accent-gradient)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <User size={18} style={{ color: 'white' }} />
                                </div>
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 600 }}>{user.name}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user.department}</div>
                                </div>
                            </div>
                        )}
                        <button onClick={handleLogout} style={{
                            background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
                            padding: '8px 16px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                            color: '#FCA5A5', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6,
                            fontFamily: 'Inter, sans-serif',
                        }}>
                            <LogOut size={14} />
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            <div className="page-container" style={{ maxWidth: 1600 }}>
                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && analytics && (
                    <div className="fade-in">
                        <div style={{ marginBottom: 32 }}>
                            <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Dashboard Overview</h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Real-time scam detection analytics and case management</p>
                        </div>

                        {/* Stat Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 32 }}>
                            <div className="glass-card stat-card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div className="stat-label">Total Cases</div>
                                    <Activity size={20} style={{ color: 'var(--accent-primary)' }} />
                                </div>
                                <div className="stat-value gradient-text">{analytics.overview.totalCases}</div>
                            </div>
                            <div className="glass-card stat-card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div className="stat-label">Open Cases</div>
                                    <AlertTriangle size={20} style={{ color: 'var(--info)' }} />
                                </div>
                                <div className="stat-value" style={{ color: 'var(--info)' }}>{analytics.overview.openCases}</div>
                            </div>
                            <div className="glass-card stat-card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div className="stat-label">Investigating</div>
                                    <Clock size={20} style={{ color: 'var(--warning)' }} />
                                </div>
                                <div className="stat-value" style={{ color: 'var(--warning)' }}>{analytics.overview.investigatingCases}</div>
                            </div>
                            <div className="glass-card stat-card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div className="stat-label">Resolved</div>
                                    <CheckCircle size={20} style={{ color: 'var(--success)' }} />
                                </div>
                                <div className="stat-value" style={{ color: 'var(--success)' }}>{analytics.overview.resolvedCases}</div>
                            </div>
                            <div className="glass-card stat-card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div className="stat-label">Detection Rate</div>
                                    <ShieldCheck size={20} style={{ color: 'var(--accent-secondary)' }} />
                                </div>
                                <div className="stat-value" style={{ color: 'var(--accent-secondary)' }}>
                                    {analytics.overview.scamDetectionRate.toFixed(0)}%
                                </div>
                            </div>
                        </div>

                        {/* Charts Row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
                            {/* Daily Trend */}
                            <div className="glass-card" style={{ padding: 28 }}>
                                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <TrendingUp size={20} style={{ color: 'var(--accent-primary)' }} />
                                    Case Filing Trend
                                </h3>
                                <ResponsiveContainer width="100%" height={280}>
                                    <BarChart data={analytics.monthlyTrend}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(99, 102, 241, 0.1)" />
                                        <XAxis dataKey="date" tick={{ fill: '#CBD5E1', fontSize: 11 }} />
                                        <YAxis tick={{ fill: '#CBD5E1', fontSize: 11 }} />
                                        <Tooltip
                                            contentStyle={{
                                                background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                                                borderRadius: 8, color: 'var(--text-primary)',
                                            }}
                                        />
                                        <Bar dataKey="cases" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
                                        <defs>
                                            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#6366F1" stopOpacity={0.9} />
                                                <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.5} />
                                            </linearGradient>
                                        </defs>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Risk Distribution Pie */}
                            <div className="glass-card" style={{ padding: 28 }}>
                                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <PieChart size={20} style={{ color: 'var(--accent-primary)' }} />
                                    Risk Distribution
                                </h3>
                                <ResponsiveContainer width="100%" height={280}>
                                    <RechartsPieChart>
                                        <Pie
                                            data={analytics.riskDistribution}
                                            cx="50%" cy="45%"
                                            outerRadius={90} innerRadius={50}
                                            paddingAngle={4}
                                            dataKey="value"
                                        >
                                            {analytics.riskDistribution.map((entry, idx) => (
                                                <Cell key={idx} fill={RISK_COLORS[entry.name] || PIE_COLORS[idx % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-primary)' }} />
                                        <Legend
                                            wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }}
                                            formatter={(value: string) => <span style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{value}</span>}
                                        />
                                    </RechartsPieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Category Distribution + Recent Cases */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                            <div className="glass-card" style={{ padding: 28 }}>
                                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <BarChart3 size={20} style={{ color: 'var(--accent-primary)' }} />
                                    Scam Categories
                                </h3>
                                <ResponsiveContainer width="100%" height={280}>
                                    <BarChart data={analytics.categoryDistribution} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(99, 102, 241, 0.1)" />
                                        <XAxis type="number" tick={{ fill: '#CBD5E1', fontSize: 11 }} />
                                        <YAxis dataKey="name" type="category" width={160} tick={{ fill: '#E2E8F0', fontSize: 11, fontWeight: 500 }} />
                                        <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-primary)' }} />
                                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                            {analytics.categoryDistribution.map((_, idx) => (
                                                <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="glass-card" style={{ padding: 28 }}>
                                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Clock size={20} style={{ color: 'var(--accent-primary)' }} />
                                    Recent Cases
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {analytics.recentCases.length === 0 ? (
                                        <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', padding: 40 }}>No cases yet</p>
                                    ) : (
                                        analytics.recentCases.map((c: ScamCaseRow) => (
                                            <Link
                                                key={c._id}
                                                href={`/department/cases/${c._id}`}
                                                style={{
                                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                    padding: '12px 16px', background: 'rgba(99, 102, 241, 0.05)',
                                                    borderRadius: 8, border: '1px solid rgba(99, 102, 241, 0.1)',
                                                    textDecoration: 'none', transition: 'all var(--transition-fast)',
                                                }}
                                            >
                                                <div>
                                                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }} className="mono">
                                                        {c.caseId}
                                                    </div>
                                                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', opacity: 0.85 }}>
                                                        {c.analysis.fraudCategory} • {c.senderEmail || c.submittedBy}
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <span className={`risk-${c.analysis.riskLevel}`} style={{ padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>
                                                        {c.analysis.riskLevel}
                                                    </span>
                                                </div>
                                            </Link>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* CASES TAB */}
                {activeTab === 'cases' && (
                    <div className="fade-in">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <div>
                                <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Case Management</h2>
                                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{totalCases} total cases</p>
                            </div>
                            <button onClick={fetchCases} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px' }}>
                                <RefreshCw size={16} />
                                Refresh
                            </button>
                        </div>

                        {/* Filters */}
                        <div className="glass-card" style={{ padding: 20, marginBottom: 24, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
                                <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    className="input-field"
                                    type="text"
                                    placeholder="Search cases by ID, name, or category..."
                                    value={searchQuery}
                                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                    style={{ paddingLeft: 36 }}
                                />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Filter size={16} style={{ color: 'var(--text-muted)' }} />
                                <select
                                    className="input-field"
                                    value={statusFilter}
                                    onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                                    style={{ width: 180 }}
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="open">Open</option>
                                    <option value="under_investigation">Under Investigation</option>
                                    <option value="resolved">Resolved</option>
                                    <option value="dismissed">Dismissed</option>
                                </select>
                            </div>
                            <select
                                className="input-field"
                                value={riskFilter}
                                onChange={(e) => { setRiskFilter(e.target.value); setCurrentPage(1); }}
                                style={{ width: 160 }}
                            >
                                <option value="all">All Risk Levels</option>
                                <option value="critical">Critical</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </select>
                        </div>

                        {/* Cases Table */}
                        <div className="glass-card" style={{ overflow: 'hidden' }}>
                            {casesLoading ? (
                                <div style={{ padding: 60, textAlign: 'center' }}>
                                    <Loader2 size={32} style={{ color: 'var(--accent-primary)', animation: 'spin 1s linear infinite' }} />
                                </div>
                            ) : cases.length === 0 ? (
                                <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
                                    <XCircle size={48} style={{ marginBottom: 12, opacity: 0.5 }} />
                                    <p>No cases found</p>
                                </div>
                            ) : (
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Assessment</th>
                                            <th>Case ID</th>
                                            <th>Sender / Source</th>
                                            <th>Submitted By</th>
                                            <th>Category</th>
                                            <th>Risk</th>
                                            <th>Confidence</th>
                                            <th>Status</th>
                                            <th>Date</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cases.map((c) => (
                                            <tr key={c._id}>
                                                <td>
                                                    {c.analysis.isScam ? (
                                                        <div title="High Risk / Scam" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--danger)', fontWeight: 600, fontSize: 12 }}>
                                                            <ShieldAlert size={16} />
                                                            <span className="hide-mobile">Scam</span>
                                                        </div>
                                                    ) : (
                                                        <div title="Safe / Verified" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--success)', fontWeight: 600, fontSize: 12 }}>
                                                            <ShieldCheck size={16} />
                                                            <span className="hide-mobile">Safe</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="mono" style={{ fontWeight: 600, fontSize: 13 }}>{c.caseId}</td>
                                                <td style={{ fontSize: 13 }}>
                                                    {c.senderEmail ? (
                                                        <span style={{ fontFamily: 'monospace', color: 'var(--text-primary)' }}>{c.senderEmail}</span>
                                                    ) : (
                                                        <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>-</span>
                                                    )}
                                                </td>
                                                <td>{c.submittedBy}</td>
                                                <td style={{ fontSize: 13 }}>{c.analysis.fraudCategory}</td>
                                                <td>
                                                    <span className={`risk-${c.analysis.riskLevel}`} style={{ padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>
                                                        {c.analysis.riskLevel}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <div className="confidence-bar" style={{ width: 60, height: 6 }}>
                                                            <div className="confidence-fill" style={{ width: `${c.analysis.confidence}%`, background: RISK_COLORS[c.analysis.riskLevel] || 'var(--accent-primary)' }} />
                                                        </div>
                                                        <span style={{ fontSize: 12, fontWeight: 600 }}>{c.analysis.confidence}%</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`status-${c.status}`} style={{ padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
                                                        {STATUS_LABELS[c.status] || c.status}
                                                    </span>
                                                </td>
                                                <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                                                    {new Date(c.createdAt).toLocaleDateString('en-IN')}
                                                </td>
                                                <td>
                                                    <Link
                                                        href={`/department/cases/${c._id}`}
                                                        style={{
                                                            display: 'inline-flex', alignItems: 'center', gap: 4,
                                                            color: 'var(--accent-secondary)', fontSize: 13, fontWeight: 500,
                                                            textDecoration: 'none',
                                                        }}
                                                    >
                                                        <Eye size={14} />
                                                        View
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div style={{
                                    padding: '16px 24px', borderTop: '1px solid var(--border-color)',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                }}>
                                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button
                                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                            disabled={currentPage === 1}
                                            className="btn-secondary"
                                            style={{ padding: '6px 12px', fontSize: 13 }}
                                        >
                                            <ChevronLeft size={16} />
                                        </button>
                                        <button
                                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                            disabled={currentPage === totalPages}
                                            className="btn-secondary"
                                            style={{ padding: '6px 12px', fontSize: 13 }}
                                        >
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ANALYTICS TAB */}
                {activeTab === 'analytics' && analytics && (
                    <div className="fade-in">
                        <div style={{ marginBottom: 32 }}>
                            <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Analytics & Insights</h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Comprehensive scam trends and intelligence</p>
                        </div>

                        {/* Key Metrics */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
                            <div className="glass-card stat-card">
                                <div className="stat-label">Avg Confidence Score</div>
                                <div className="stat-value gradient-text">{analytics.overview.avgConfidence.toFixed(1)}%</div>
                                <div className="confidence-bar" style={{ marginTop: 8 }}>
                                    <div className="confidence-fill" style={{ width: `${analytics.overview.avgConfidence}%`, background: 'var(--accent-gradient)' }} />
                                </div>
                            </div>
                            <div className="glass-card stat-card">
                                <div className="stat-label">Scam Detection Rate</div>
                                <div className="stat-value" style={{ color: 'var(--danger)' }}>{analytics.overview.scamDetectionRate.toFixed(0)}%</div>
                            </div>
                            <div className="glass-card stat-card">
                                <div className="stat-label">Cases Under Investigation</div>
                                <div className="stat-value" style={{ color: 'var(--warning)' }}>{analytics.overview.investigatingCases}</div>
                            </div>
                            <div className="glass-card stat-card">
                                <div className="stat-label">Resolution Rate</div>
                                <div className="stat-value" style={{ color: 'var(--success)' }}>
                                    {analytics.overview.totalCases > 0
                                        ? ((analytics.overview.resolvedCases / analytics.overview.totalCases) * 100).toFixed(0)
                                        : 0}%
                                </div>
                            </div>
                        </div>

                        {/* Confidence Trend Line Chart */}
                        <div className="glass-card" style={{ padding: 28, marginBottom: 24 }}>
                            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <TrendingUp size={20} style={{ color: 'var(--accent-primary)' }} />
                                Confidence Score Trend
                            </h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={analytics.monthlyTrend}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(99, 102, 241, 0.1)" />
                                    <XAxis dataKey="date" tick={{ fill: '#CBD5E1', fontSize: 11 }} />
                                    <YAxis tick={{ fill: '#CBD5E1', fontSize: 11 }} domain={[0, 100]} />
                                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-primary)' }} />
                                    <Line type="monotone" dataKey="avgConfidence" stroke="#6366F1" strokeWidth={3} dot={{ fill: '#6366F1', r: 5 }} activeDot={{ r: 7 }} />
                                    <Line type="monotone" dataKey="cases" stroke="#F59E0B" strokeWidth={2} dot={{ fill: '#F59E0B', r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Category Deep Dive */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                            <div className="glass-card" style={{ padding: 28 }}>
                                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>📊 Fraud Category Breakdown</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <RechartsPieChart>
                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                        <Pie data={analytics.categoryDistribution} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={(props: any) => `${props.name || ''} (${((props.percent || 0) * 100).toFixed(0)}%)`}>
                                            {analytics.categoryDistribution.map((_, idx) => (
                                                <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-primary)' }} />
                                    </RechartsPieChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="glass-card" style={{ padding: 28 }}>
                                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>🛡️ Platform Intelligence</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '16px 0' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(99, 102, 241, 0.1)' }}>
                                        <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Total Messages Analyzed</span>
                                        <span style={{ fontWeight: 700, fontSize: 16 }}>{analytics.overview.totalCases}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(99, 102, 241, 0.1)' }}>
                                        <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Scams Identified</span>
                                        <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--danger)' }}>
                                            {Math.round(analytics.overview.totalCases * analytics.overview.scamDetectionRate / 100)}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(99, 102, 241, 0.1)' }}>
                                        <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>FIR Drafts Generated</span>
                                        <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--accent-secondary)' }}>{analytics.overview.totalCases}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(99, 102, 241, 0.1)' }}>
                                        <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Avg Analysis Confidence</span>
                                        <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--success)' }}>{analytics.overview.avgConfidence.toFixed(1)}%</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
                                        <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Active Categories</span>
                                        <span style={{ fontWeight: 700, fontSize: 16 }}>{analytics.categoryDistribution.length}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
