'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Lock, Mail, Eye, EyeOff, Loader2, AlertTriangle, ArrowLeft, UserCheck, Copy, CheckCheck } from 'lucide-react';

const DEMO_CREDENTIALS = [
    { role: 'Admin', email: 'admin@cybercell.gov.in', password: 'admin123', color: '#EF4444', icon: '🔴' },
    { role: 'Officer', email: 'priya@cybercell.gov.in', password: 'officer123', color: '#F59E0B', icon: '🟡' },
    { role: 'Analyst', email: 'vikram@cybercell.gov.in', password: 'analyst123', color: '#22C55E', icon: '🟢' },
];

export default function DepartmentLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [seeding, setSeeding] = useState(false);
    const [seedSuccess, setSeedSuccess] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Please enter email and password.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem('scamshield_token', data.token);
                localStorage.setItem('scamshield_user', JSON.stringify(data.user));
                router.push('/department/dashboard');
            } else {
                setError(data.error || 'Login failed');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const seedDatabase = async () => {
        setSeeding(true);
        setSeedSuccess(false);
        try {
            await fetch('/api/seed', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'seed-users' }),
            });
            await fetch('/api/seed', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'seed-cases' }),
            });
            setError('');
            setSeedSuccess(true);
        } catch {
            setError('Failed to seed database');
        } finally {
            setSeeding(false);
        }
    };

    const fillCredentials = (index: number) => {
        const cred = DEMO_CREDENTIALS[index];
        setEmail(cred.email);
        setPassword(cred.password);
        setCopiedIndex(index);
        setError('');
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <div style={{ maxWidth: 480, width: '100%' }}>
                <Link href="/" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)',
                    fontSize: 14, textDecoration: 'none', marginBottom: 32, transition: 'color var(--transition-fast)',
                }}>
                    <ArrowLeft size={16} />
                    Back to Home
                </Link>

                <div className="glass-card fade-in" style={{ padding: 48 }}>
                    <div style={{ textAlign: 'center', marginBottom: 36 }}>
                        <div style={{
                            width: 72, height: 72, borderRadius: '50%', margin: '0 auto 20px',
                            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.15))',
                            border: '2px solid rgba(99, 102, 241, 0.3)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Lock size={32} style={{ color: 'var(--accent-primary)' }} />
                        </div>
                        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }} className="gradient-text">
                            Department Portal
                        </h1>
                        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                            Cyber Crime Cell — Authorized Access Only
                        </p>
                    </div>

                    {error && (
                        <div style={{
                            padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-md)',
                            marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8,
                            color: '#FCA5A5', fontSize: 14,
                        }}>
                            <AlertTriangle size={16} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>
                                OFFICIAL EMAIL
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    className="input-field"
                                    type="email"
                                    placeholder="officer@cybercell.gov.in"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    style={{ paddingLeft: 42 }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>
                                PASSWORD
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    className="input-field"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    style={{ paddingLeft: 42, paddingRight: 42 }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                                    }}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            className="btn-primary"
                            type="submit"
                            disabled={loading}
                            style={{ width: '100%', padding: 14, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 }}
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                                    Authenticating...
                                </>
                            ) : (
                                <>
                                    <Shield size={18} />
                                    Access Dashboard
                                </>
                            )}
                        </button>
                    </form>

                    {/* Demo Credentials Section */}
                    <div style={{ marginTop: 28, paddingTop: 24, borderTop: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                            <p style={{
                                fontSize: 12, color: 'var(--text-muted)', fontWeight: 600,
                                textTransform: 'uppercase', letterSpacing: '0.05em',
                                display: 'flex', alignItems: 'center', gap: 6,
                            }}>
                                <UserCheck size={14} style={{ color: 'var(--accent-primary)' }} />
                                Quick Login — Click to fill
                            </p>
                            <button
                                onClick={seedDatabase}
                                disabled={seeding}
                                style={{
                                    background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)',
                                    padding: '5px 12px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                                    color: 'var(--accent-secondary)', fontSize: 11, fontWeight: 500, fontFamily: 'Inter, sans-serif',
                                    display: 'flex', alignItems: 'center', gap: 4,
                                }}
                            >
                                {seeding ? (
                                    <>
                                        <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
                                        Seeding...
                                    </>
                                ) : seedSuccess ? (
                                    <>
                                        <CheckCheck size={12} style={{ color: 'var(--success)' }} />
                                        Seeded ✓
                                    </>
                                ) : (
                                    '🌱 Seed Demo Data'
                                )}
                            </button>
                        </div>

                        {/* Credential Cards */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {DEMO_CREDENTIALS.map((cred, index) => (
                                <button
                                    key={cred.role}
                                    type="button"
                                    onClick={() => fillCredentials(index)}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '12px 16px', borderRadius: 10,
                                        background: copiedIndex === index
                                            ? 'rgba(34, 197, 94, 0.08)'
                                            : 'rgba(99, 102, 241, 0.04)',
                                        border: copiedIndex === index
                                            ? '1px solid rgba(34, 197, 94, 0.3)'
                                            : '1px solid rgba(99, 102, 241, 0.1)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        fontFamily: 'Inter, sans-serif',
                                        width: '100%',
                                        textAlign: 'left',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (copiedIndex !== index) {
                                            e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                                            e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.25)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (copiedIndex !== index) {
                                            e.currentTarget.style.background = 'rgba(99, 102, 241, 0.04)';
                                            e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.1)';
                                        }
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{
                                            width: 32, height: 32, borderRadius: 8,
                                            background: `${cred.color}18`,
                                            border: `1px solid ${cred.color}40`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 14,
                                        }}>
                                            {cred.icon}
                                        </div>
                                        <div>
                                            <div style={{
                                                fontSize: 13, fontWeight: 600,
                                                color: copiedIndex === index ? 'var(--success)' : 'var(--text-primary)',
                                                marginBottom: 2,
                                            }}>
                                                {cred.role}
                                            </div>
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
                                                {cred.email} / {cred.password}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: 4,
                                        fontSize: 11, fontWeight: 500,
                                        color: copiedIndex === index ? 'var(--success)' : 'var(--text-muted)',
                                    }}>
                                        {copiedIndex === index ? (
                                            <>
                                                <CheckCheck size={14} />
                                                Filled!
                                            </>
                                        ) : (
                                            <>
                                                <Copy size={14} />
                                                Use
                                            </>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
