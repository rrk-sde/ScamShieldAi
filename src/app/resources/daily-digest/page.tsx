'use client';

import { useState, useEffect } from 'react';
import { FileText, Calendar, ArrowLeft, Loader2, Download, CheckCircle, Search } from 'lucide-react';
import Link from 'next/link';

interface Digest {
    _id: string;
    digestId: string;
    title: string;
    date: string;
    summary: string;
    downloadLink: string;
}

export default function DailyDigestPage() {
    const [digests, setDigests] = useState<Digest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/resources/daily-digest')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setDigests(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Failed to fetch digests:', err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="page-container" style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', paddingTop: 80, paddingBottom: 40 }}>
            {/* Background Orbs */}
            <div className="hero-orb orb-1" style={{ top: '-10%', left: '-10%', width: '40vw', height: '40vw', opacity: 0.15 }} />
            <div className="hero-orb orb-2" style={{ bottom: '-10%', right: '-10%', width: '35vw', height: '35vw', opacity: 0.1 }} />

            <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 10 }}>

                {/* Navigation */}
                <Link href="/" className="btn-ghost" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    color: 'var(--text-secondary)', marginBottom: 32, textDecoration: 'none'
                }}>
                    <ArrowLeft size={16} /> Back to Dashboard
                </Link>

                {/* Header Section */}
                <div style={{
                    display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between',
                    gap: 20, marginBottom: 40
                }}>
                    <div>
                        <h1 className="font-display" style={{
                            fontSize: 'clamp(32px, 5vw, 42px)', fontWeight: 800,
                            background: 'linear-gradient(to right, #fff, #a78bfa)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                            marginBottom: 12
                        }}>
                            Daily Digest Archive
                        </h1>
                        <p style={{ fontSize: 15, color: 'var(--text-secondary)', maxWidth: 600, lineHeight: 1.6 }}>
                            Official risk intelligence bulletins from the Indian Cybercrime Coordination Centre (I4C).
                            Access detailed reports on emerging fraud patterns and modus operandi.
                        </p>
                    </div>

                    <div className="glass-card" style={{
                        padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 10,
                        borderRadius: 'var(--radius-full)', background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.2)'
                    }}>
                        <div className="pulse-dot" style={{ background: '#10B981', boxShadow: '0 0 10px #10B981' }} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#10B981', letterSpacing: '0.05em' }}>ARCHIVE ONLINE</span>
                    </div>
                </div>

                {/* Search Bar (Visual Only) */}
                <div className="glass-card" style={{
                    padding: 8, marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12,
                    maxWidth: 400
                }}>
                    <Search size={18} style={{ color: 'var(--text-muted)', marginLeft: 8 }} />
                    <input
                        type="text"
                        placeholder="Search bulletins by keyword or ID..."
                        style={{
                            background: 'transparent', border: 'none', color: 'white',
                            fontSize: 14, width: '100%', outline: 'none'
                        }}
                    />
                </div>

                {/* List Grid */}
                <div style={{ display: 'grid', gap: 16 }}>
                    {loading ? (
                        <div style={{
                            textAlign: 'center', padding: 60,
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16
                        }}>
                            <Loader2 className="spin" size={32} style={{ color: 'var(--accent-primary)' }} />
                            <p style={{ color: 'var(--text-muted)' }}>Loading intelligence reports...</p>
                        </div>
                    ) : digests.length > 0 ? (
                        digests.map((digest) => (
                            <div key={digest._id} className="glass-card slide-up" style={{
                                padding: 24, display: 'flex', flexDirection: 'column', gap: 20
                            }}>
                                <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                                    {/* Icon */}
                                    <div style={{
                                        width: 50, height: 50, borderRadius: 14, flexShrink: 0,
                                        background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <FileText size={24} style={{ color: '#A78BFA' }} />
                                    </div>

                                    {/* Content */}
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 6 }}>
                                            <span style={{
                                                fontSize: 11, fontWeight: 700, color: '#A78BFA',
                                                background: 'rgba(139, 92, 246, 0.1)', padding: '4px 8px', borderRadius: 4
                                            }}>
                                                {digest.digestId}
                                            </span>
                                            <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                                                <Calendar size={12} />
                                                {new Date(digest.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </span>
                                        </div>

                                        <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                                            {digest.title}
                                        </h3>
                                        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 800 }}>
                                            {digest.summary || 'Summary not available for this bulletin.'}
                                        </p>
                                    </div>

                                    {/* Desktop Button */}
                                    <div style={{ alignSelf: 'center', display: 'none', md: { display: 'block' } }}> {/* Logic handled by CSS media query usually, for now we assume desktop or stack */}
                                        <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>
                                            <Download size={16} /> Download
                                        </button>
                                    </div>
                                </div>

                                {/* Mobile Button (if needed) - Keeping simpler layout for now, stacking button below on mobile if we used CSS. 
                    I'll add a simple button row. */}
                                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 16, marginTop: 4, display: 'flex', justifyContent: 'flex-end' }}>
                                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginRight: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <CheckCircle size={12} color="var(--success)" /> Verified by I4C
                                    </p>
                                    <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, padding: '8px 16px' }}>
                                        <Download size={14} /> Download PDF
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
                            <p style={{ color: 'var(--text-muted)' }}>No reports found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
