'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Shield, Search, MessageSquare, Mail, Phone, CreditCard, FileText,
  AlertTriangle, CheckCircle, ArrowRight, ChevronRight, Loader2,
  ShieldCheck, ShieldAlert, Eye, Zap, Lock, Globe, BarChart3,
  Sparkles, Copy, ExternalLink, Send, BookOpen, Monitor,
} from 'lucide-react';

const MESSAGE_TYPES = [
  { key: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, color: '#25D366' },
  { key: 'email', label: 'Email', icon: Mail, color: '#6366F1' },
  { key: 'call_transcript', label: 'Call', icon: Phone, color: '#F59E0B' },
  { key: 'payment_request', label: 'Payment', icon: CreditCard, color: '#EF4444' },
  { key: 'sms', label: 'SMS', icon: MessageSquare, color: '#22D3EE' },
  { key: 'other', label: 'Other', icon: FileText, color: '#8B5CF6' },
];

interface AnalysisResult {
  isScam: boolean;
  confidence: number;
  fraudCategory: string;
  riskLevel: string;
  financialRisk: string;
  scamPatterns: string[];
  explanation: string;
  suggestedReply: string;
  actionSteps: string[];
}

interface CaseResult {
  caseId: string;
  analysis: AnalysisResult;
  firDraft: string;
}

const FEATURES = [
  { icon: Zap, title: 'AI Detection', desc: 'Advanced pattern matching with 7 detection modules', gradient: 'linear-gradient(135deg, #6366F1, #8B5CF6)' },
  { icon: Shield, title: 'FIR Generator', desc: 'Auto-generate legally formatted FIR drafts instantly', gradient: 'linear-gradient(135deg, #22D3EE, #6366F1)' },
  { icon: Eye, title: 'Pattern Analysis', desc: 'Grammar, social engineering & financial fraud detection', gradient: 'linear-gradient(135deg, #F59E0B, #EF4444)' },
  { icon: BarChart3, title: 'Analytics', desc: 'Department dashboard with real-time case intelligence', gradient: 'linear-gradient(135deg, #10B981, #22D3EE)' },
];

// Animated counter hook
function useCounter(target: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

interface NewsItem {
  title: string;
  link: string;
  date: string;
  source: string;
  type: string;
}

export default function HomePage() {
  const [messageType, setMessageType] = useState('whatsapp');
  const [message, setMessage] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CaseResult | null>(null);
  const [error, setError] = useState('');
  const [showFIR, setShowFIR] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const analyzerRef = useRef<HTMLElement>(null);

  const threatsBlocked = useCounter(14832);
  const accuracy = useCounter(97);
  const usersProtected = useCounter(8240);

  const [newsfeed, setNewsfeed] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/news')
      .then(res => res.json())
      .then(data => {
        if (data.success) setNewsfeed(data.news);
        setNewsLoading(false);
      })
      .catch(err => setNewsLoading(false));
  }, []);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !name.trim()) {
      setError('Please enter your name and the suspicious message.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    setShowFIR(false);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message, messageType, submittedBy: name,
          contactEmail: email, contactPhone: phone,
          senderEmail: messageType === 'email' ? senderEmail : '',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResult({ caseId: data.case.caseId, analysis: data.case.analysis, firDraft: data.case.firDraft });
        setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
      } else {
        setError(data.error || 'Analysis failed');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return '#EF4444';
      case 'high': return '#F97316';
      case 'medium': return '#F59E0B';
      default: return '#10B981';
    }
  };

  return (
    <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
      {/* NAVBAR */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(3, 7, 18, 0.8)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-color)',
        padding: '0 16px',
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          height: 60,
        }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{
              width: 34, height: 34, borderRadius: 9,
              background: 'var(--accent-gradient)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Shield size={18} color="white" />
            </div>
            <div>
              <span className="font-display" style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>
                ScamShield
              </span>
              <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--accent-primary)', marginLeft: 3 }}>AI</span>
            </div>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link href="/resources/daily-digest" className="hide-mobile" style={{
              display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500,
              color: 'var(--text-secondary)', textDecoration: 'none', marginRight: 4,
              transition: 'color 0.2s',
            }}>
              <FileText size={14} />
              Daily Digest
            </Link>
            <a href="tel:1930" style={{
              display: 'flex', alignItems: 'center', gap: 5,
              color: 'var(--danger)', fontSize: 12, fontWeight: 600,
              textDecoration: 'none', padding: '5px 10px',
              borderRadius: 'var(--radius-sm)', background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.15)',
            }}>
              <Phone size={13} />
              <span className="hide-mobile">Helpline</span> 1930
            </a>
            <Link href="/department/login" className="btn-secondary" style={{
              display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', fontSize: 12,
            }}>
              <Lock size={13} />
              <span className="hide-mobile">Department</span> Portal
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION — with animated background elements */}
      <section style={{
        position: 'relative', overflow: 'hidden',
        padding: 'clamp(32px, 6vw, 60px) 16px clamp(24px, 4vw, 40px)',
      }}>
        {/* Animated floating orbs */}
        <div className="hero-orb orb-1" />
        <div className="hero-orb orb-2" />
        <div className="hero-orb orb-3" />

        {/* Animated grid lines */}
        <div className="hero-grid" />

        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <div className="hero-grid-layout">
            {/* LEFT SIDEBAR: Live Threats */}
            <div className="desktop-sidebar glass-card slide-right" style={{ padding: 20, height: 'fit-content', alignSelf: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, borderBottom: '1px solid var(--border-color)', paddingBottom: 12 }}>
                <div style={{ position: 'relative' }}>
                  <span className="pulse-dot" style={{ position: 'absolute', top: 0, right: 0 }} />
                  <Globe size={18} style={{ color: 'var(--danger)' }} />
                </div>
                <h3 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Live Threat Feed</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { title: 'Digital Arrest Scam', loc: 'Delhi • 2m ago', icon: ShieldAlert },
                  { title: 'Fake KYC Update', loc: 'Mumbai • 5m ago', icon: AlertTriangle },
                  { title: 'Lottery Fraud SMS', loc: 'Bangalore • 12m ago', icon: MessageSquare },
                  { title: 'Sextortion Call', loc: 'Pune • 18m ago', icon: Phone },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'start', opacity: 0.8 + (i * 0.05) }}>
                    <item.icon size={14} style={{ color: 'var(--text-secondary)', marginTop: 3 }} />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#FCA5A5' }}>{item.title}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{item.loc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CENTER CONTENT */}
            <div className="fade-in" style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto' }}>
              {/* Badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.25)',
                borderRadius: 'var(--radius-full)', padding: '5px 14px',
                marginBottom: 20, fontSize: 12, fontWeight: 600, color: 'var(--text-accent)',
              }}>
                <span className="pulse-dot" />
                AI-Powered Scam Detection Engine
              </div>

              {/* Heading */}
              <h1 className="font-display" style={{
                fontSize: 'clamp(28px, 6vw, 56px)', fontWeight: 900, lineHeight: 1.1,
                marginBottom: 16, letterSpacing: '-0.02em',
              }}>
                Detect Digital Scams{' '}
                <span className="gradient-text">Before They Strike</span>
              </h1>

              {/* Subtitle */}
              <p style={{
                fontSize: 'clamp(14px, 2.2vw, 17px)', color: 'var(--text-secondary)',
                maxWidth: 520, margin: '0 auto 28px', lineHeight: 1.7,
              }}>
                Paste any suspicious message — WhatsApp, email, SMS, or call transcript — and get instant AI analysis with risk scoring and auto-generated FIR drafts.
              </p>

              {/* CTA Button */}
              <button
                className="btn-primary"
                onClick={() => analyzerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                style={{ padding: '14px 32px', fontSize: 15, display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 32 }}
              >
                <Search size={18} />
                Analyze a Message
                <ArrowRight size={16} />
              </button>
            </div>

            {/* RIGHT SIDEBAR: News */}
            <div className="desktop-sidebar glass-card slide-left" style={{ padding: 20, height: 'fit-content', alignSelf: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, borderBottom: '1px solid var(--border-color)', paddingBottom: 12 }}>
                <Zap size={18} style={{ color: 'var(--accent-secondary)' }} />
                <h3 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Cyber News</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {newsLoading ? (
                  <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <Loader2 size={16} className="spin" /> Loading News...
                  </div>
                ) : newsfeed.length > 0 ? (
                  newsfeed.map((news, i) => (
                    <a key={i} href={news.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>
                      <div style={{ padding: 10, background: 'rgba(255,255,255,0.03)', borderRadius: 6, border: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }} className="hover:bg-white/5">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 10, color: 'var(--accent-cyan)', fontWeight: 700 }}>{news.type}</span>
                          <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>{news.date}</span>
                        </div>
                        <div style={{ fontSize: 11, fontWeight: 500, lineHeight: 1.4, color: 'var(--text-primary)' }}>{news.title}</div>
                        <div style={{ fontSize: 9, color: 'var(--text-secondary)', marginTop: 4, textAlign: 'right' }}>{news.source}</div>
                      </div>
                    </a>
                  ))
                ) : (
                  <div style={{ padding: 10, textAlign: 'center', fontSize: 11, color: 'var(--text-muted)' }}>No recent news</div>
                )}
                <a href="https://news.google.com/search?q=cyber+fraud+india" target="_blank" className="btn-ghost" style={{ fontSize: 11, marginTop: 4, justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 4 }}>
                  View All Alerts <ExternalLink size={10} />
                </a>
              </div>
            </div>
          </div>

          {/* LIVE STATS TICKER */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 'clamp(8px, 2vw, 16px)', maxWidth: 560, margin: '0 auto 32px',
          }}>
            {[
              { value: threatsBlocked.toLocaleString(), label: 'Threats Blocked', color: '#EF4444', icon: ShieldAlert },
              { value: `${accuracy}%`, label: 'AI Accuracy', color: '#10B981', icon: CheckCircle },
              { value: usersProtected.toLocaleString(), label: 'Users Protected', color: '#6366F1', icon: Shield },
            ].map((stat) => (
              <div key={stat.label} className="glass-card" style={{
                padding: 'clamp(12px, 2vw, 20px)', textAlign: 'center',
              }}>
                <stat.icon size={18} style={{ color: stat.color, marginBottom: 6 }} />
                <div className="font-display" style={{
                  fontSize: 'clamp(18px, 3vw, 26px)', fontWeight: 800, color: stat.color,
                  lineHeight: 1.2, marginBottom: 2,
                }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: 'clamp(9px, 1.4vw, 11px)', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* FEATURE CARDS */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 'clamp(8px, 1.5vw, 16px)', maxWidth: 800, margin: '0 auto',
          }}>
            {FEATURES.map((feat, i) => (
              <div key={feat.title} className={`glass-card fade-in stagger-${i + 1}`} style={{
                padding: 'clamp(14px, 2vw, 22px) clamp(12px, 1.5vw, 18px)', textAlign: 'left', opacity: 0,
              }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 8, marginBottom: 10,
                  background: feat.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <feat.icon size={17} color="white" />
                </div>
                <h3 style={{ fontSize: 'clamp(12px, 1.6vw, 15px)', fontWeight: 700, marginBottom: 4 }}>{feat.title}</h3>
                <p style={{ fontSize: 'clamp(10px, 1.3vw, 12px)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{feat.desc}</p>
              </div>
            ))}
          </div>

          {/* Scroll indicator */}
          <div className="scroll-indicator" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            marginTop: 32, opacity: 0.5,
          }}>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Scroll to analyze</span>
            <ChevronRight size={16} style={{ color: 'var(--text-muted)', transform: 'rotate(90deg)', animation: 'bounce-down 1.5s ease-in-out infinite' }} />
          </div>
        </div>
      </section>

      {/* ANALYZER SECTION */}
      <section ref={analyzerRef} style={{ maxWidth: 800, margin: '0 auto', padding: '0 16px clamp(40px, 6vw, 80px)', scrollMarginTop: 100 }}>
        <div className="glass-card slide-up" style={{ padding: 'clamp(24px, 4vw, 40px)', boxShadow: 'var(--shadow-glow)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'var(--accent-gradient)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Search size={20} color="white" />
            </div>
            <div>
              <h2 className="font-display" style={{ fontSize: 20, fontWeight: 700 }}>Analyze Message</h2>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Paste the suspicious content below</p>
            </div>
          </div>

          {error && (
            <div style={{
              padding: '12px 16px', background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--radius-md)',
              marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8,
              color: '#FCA5A5', fontSize: 14,
            }}>
              <AlertTriangle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleAnalyze} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Message Type Grid */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 10, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Message Type
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 8 }}>
                {MESSAGE_TYPES.map((mt) => (
                  <button
                    key={mt.key} type="button"
                    onClick={() => setMessageType(mt.key)}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                      padding: '14px 8px', borderRadius: 'var(--radius-md)',
                      border: messageType === mt.key ? `2px solid ${mt.color}` : '1px solid var(--border-color)',
                      background: messageType === mt.key ? `${mt.color}12` : 'transparent',
                      cursor: 'pointer', transition: 'all var(--transition-fast)',
                      fontFamily: 'Inter, sans-serif', color: messageType === mt.key ? mt.color : 'var(--text-secondary)',
                    }}
                  >
                    <mt.icon size={18} />
                    <span style={{ fontSize: 11, fontWeight: 600 }}>{mt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sender Email — only for Email type */}
            {messageType === 'email' && (
              <div className="fade-in">
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 10, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Mail size={14} style={{ color: 'var(--accent-primary)' }} />
                    Sender Email Address <span style={{ color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none' }}>(for accuracy)</span>
                  </span>
                </label>
                <input
                  className="input-field"
                  type="email"
                  placeholder="e.g. no-reply@accounts.google.com or scammer123@gmail.com"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  style={{ fontSize: 14 }}
                />
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6, lineHeight: 1.5 }}>
                  💡 The sender&apos;s email domain helps our AI distinguish genuine notifications from phishing attempts.
                </p>
              </div>
            )}

            {/* Textarea */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 10, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Paste Suspicious Message <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <textarea
                className="input-field"
                placeholder="Paste the suspicious WhatsApp message, email, call transcript, or payment request here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{ minHeight: 160, fontSize: 14 }}
              />
            </div>

            {/* Contact Info */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Your Name <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input className="input-field" placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Email <span style={{ color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none' }}>(Optional)</span>
                </label>
                <input className="input-field" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Phone <span style={{ color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none' }}>(Optional)</span>
                </label>
                <input className="input-field" placeholder="+91-XXXXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>

            {/* Submit */}
            <button className="btn-primary" type="submit" disabled={loading} style={{
              width: '100%', padding: 16, fontSize: 15, display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: 10,
            }}>
              {loading ? (
                <>
                  <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  Analyzing with AI...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Analyze Message
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* ANALYSIS RESULT */}
        {result && (
          <div ref={resultRef} className="fade-in-scale" style={{ marginTop: 32, scrollMarginTop: 100 }}>
            {/* Verdict Banner */}
            <div className="glass-card" style={{
              padding: 'clamp(24px, 4vw, 36px)', marginBottom: 20, textAlign: 'center',
              borderColor: result.analysis.isScam ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)',
              boxShadow: result.analysis.isScam ? '0 0 40px rgba(239, 68, 68, 0.1)' : '0 0 40px rgba(16, 185, 129, 0.1)',
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%', margin: '0 auto 16px',
                background: result.analysis.isScam ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                border: `2px solid ${result.analysis.isScam ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {result.analysis.isScam ? <ShieldAlert size={30} color="#EF4444" /> : <ShieldCheck size={30} color="#10B981" />}
              </div>
              <h2 className="font-display" style={{
                fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 800, marginBottom: 8,
                color: result.analysis.isScam ? '#FCA5A5' : '#6EE7B7',
              }}>
                {result.analysis.isScam ? '⚠️ SCAM DETECTED' : '✅ APPEARS SAFE'}
              </h2>
              <p className="mono" style={{ fontSize: 13, color: 'var(--text-muted)' }}>Case ID: {result.caseId}</p>
            </div>

            {/* Score Cards */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: 12, marginBottom: 20,
            }}>
              <div className="glass-card" style={{ padding: 20, textAlign: 'center' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Confidence</div>
                <div className="font-display" style={{ fontSize: 28, fontWeight: 800, color: getRiskColor(result.analysis.riskLevel) }}>{result.analysis.confidence}%</div>
                <div className="confidence-bar" style={{ marginTop: 8 }}>
                  <div className="confidence-fill" style={{ width: `${result.analysis.confidence}%`, background: getRiskColor(result.analysis.riskLevel) }} />
                </div>
              </div>
              <div className="glass-card" style={{ padding: 20, textAlign: 'center' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Risk Level</div>
                <span className={`risk-${result.analysis.riskLevel}`} style={{
                  display: 'inline-block', padding: '6px 16px', borderRadius: 'var(--radius-full)',
                  fontSize: 14, fontWeight: 700, textTransform: 'uppercase',
                }}>
                  {result.analysis.riskLevel}
                </span>
              </div>
              <div className="glass-card" style={{ padding: 20, textAlign: 'center' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Category</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>{result.analysis.fraudCategory}</div>
              </div>
            </div>

            {/* Patterns & Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 20 }}>
              {/* Detected Patterns */}
              <div className="glass-card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AlertTriangle size={18} style={{ color: 'var(--warning)' }} />
                  Detected Patterns
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {result.analysis.scamPatterns.map((pattern, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'flex-start', gap: 8,
                      padding: '8px 12px', borderRadius: 'var(--radius-sm)',
                      background: 'rgba(99, 102, 241, 0.04)', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5,
                    }}>
                      <span style={{ color: result.analysis.isScam ? 'var(--danger)' : 'var(--success)', marginTop: 2, flexShrink: 0 }}>
                        {result.analysis.isScam ? '⚠' : '✓'}
                      </span>
                      {pattern}
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Actions */}
              <div className="glass-card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle size={18} style={{ color: 'var(--success)' }} />
                  Recommended Actions
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {result.analysis.actionSteps.map((step, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'flex-start', gap: 10,
                      fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5,
                    }}>
                      <span style={{
                        flexShrink: 0, width: 22, height: 22, borderRadius: '50%',
                        background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 700, color: 'var(--accent-primary)', marginTop: 1,
                      }}>{i + 1}</span>
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Analysis */}
            <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={18} style={{ color: 'var(--accent-primary)' }} />
                AI Analysis Report
              </h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8 }}>{result.analysis.explanation}</p>
            </div>

            {/* Financial Risk + Suggested Reply */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 20 }}>
              <div className="glass-card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CreditCard size={16} /> Financial Risk
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{result.analysis.financialRisk}</p>
              </div>
              <div className="glass-card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MessageSquare size={16} /> Suggested Reply
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, fontStyle: 'italic' }}>"{result.analysis.suggestedReply}"</p>
                <button className="btn-ghost" onClick={() => navigator.clipboard.writeText(result.analysis.suggestedReply)} style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Copy size={13} /> Copy Reply
                </button>
              </div>
            </div>

            {/* FIR Draft Toggle */}
            <div className="glass-card" style={{ padding: 24 }}>
              <button
                onClick={() => setShowFIR(!showFIR)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <FileText size={18} style={{ color: 'var(--accent-secondary)' }} />
                  <span style={{ fontSize: 15, fontWeight: 700 }}>Auto-Generated FIR Draft</span>
                </div>
                <ChevronRight size={18} style={{
                  transform: showFIR ? 'rotate(90deg)' : 'rotate(0)',
                  transition: 'transform var(--transition-fast)',
                  color: 'var(--text-muted)',
                }} />
              </button>
              {showFIR && (
                <div className="fade-in" style={{ marginTop: 16 }}>
                  <pre className="mono" style={{
                    background: 'rgba(0, 0, 0, 0.3)', borderRadius: 'var(--radius-md)',
                    padding: 20, fontSize: 12, lineHeight: 1.7, whiteSpace: 'pre-wrap',
                    color: 'var(--text-secondary)', maxHeight: 500, overflow: 'auto',
                    border: '1px solid var(--border-color)',
                  }}>
                    {result.firDraft}
                  </pre>
                  <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                    <button className="btn-secondary" onClick={() => navigator.clipboard.writeText(result.firDraft)} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                      <Copy size={14} /> Copy FIR
                    </button>
                    <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, textDecoration: 'none' }}>
                      <ExternalLink size={14} /> Report at cybercrime.gov.in
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* =============================================
          WHAT IS SCAMSHIELD AI?
          ============================================= */}
      <section style={{
        maxWidth: 900, margin: '0 auto', padding: '0 16px clamp(40px, 6vw, 80px)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 className="font-display" style={{
            fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 800, marginBottom: 16,
          }}>
            What is <span className="gradient-text">ScamShield AI</span>?
          </h2>
          <div style={{ maxWidth: 700, margin: '0 auto' }}>
            <p style={{ fontSize: 'clamp(14px, 1.8vw, 16px)', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 16 }}>
              <strong style={{ color: 'var(--text-primary)' }}>ScamShield AI</strong> is an advanced AI-powered tool that helps you determine whether a message you&apos;ve received — be it a WhatsApp text, email, SMS, call transcript, or payment request — is likely to be a <strong style={{ color: 'var(--danger)' }}>scam or fraud attempt</strong>… before you fall victim to it.
            </p>
            <p style={{ fontSize: 'clamp(14px, 1.8vw, 16px)', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 16 }}>
              Built specifically for Indian users, it uses a multi-layered AI analysis engine with <strong style={{ color: 'var(--text-primary)' }}>7 specialized detection modules</strong> — covering grammar anomalies, social engineering tactics, financial fraud patterns, urgency manipulation, threats &amp; impersonation, job scams, and message metadata analysis — to provide a comprehensive trust score.
            </p>
            <p style={{ fontSize: 'clamp(14px, 1.8vw, 16px)', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              The tool also features a <strong style={{ color: 'var(--text-primary)' }}>legitimacy detection module</strong> that checks for trusted sender domains, standard notification patterns, and non-coercive language to reduce false positives — ensuring real alerts from Google, your bank, or government services aren&apos;t incorrectly flagged.
            </p>
          </div>
        </div>
      </section>

      {/* =============================================
          HOW DOES IT WORK?
          ============================================= */}
      <section style={{
        maxWidth: 900, margin: '0 auto', padding: '0 16px clamp(40px, 6vw, 80px)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 className="font-display" style={{
            fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 800, marginBottom: 12,
          }}>
            How does it <span className="gradient-text-cool">work</span>?
          </h2>
          <p style={{ fontSize: 'clamp(14px, 1.8vw, 16px)', color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto' }}>
            Simply paste the suspicious message, and your results will appear within seconds.
          </p>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 24,
        }}>
          {[
            {
              step: '1',
              title: 'Paste the Message',
              desc: 'Copy the suspicious WhatsApp message, email, SMS, call transcript, or payment request and paste it into the analyzer above.',
              icon: MessageSquare,
              gradient: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            },
            {
              step: '2',
              title: 'AI Analyzes Instantly',
              desc: 'Our 7-module AI engine scans for grammar errors, social engineering, financial fraud, urgency manipulation, threats, and sender domain legitimacy.',
              icon: Zap,
              gradient: 'linear-gradient(135deg, #22D3EE, #6366F1)',
            },
            {
              step: '3',
              title: 'Get Your Report',
              desc: 'Receive a detailed risk score, confidence level, detected scam patterns, recommended actions, a suggested reply, and an auto-generated FIR draft.',
              icon: FileText,
              gradient: 'linear-gradient(135deg, #10B981, #22D3EE)',
            },
          ].map((item, i) => (
            <div key={item.step} className={`glass-card fade-in stagger-${i + 1}`} style={{
              padding: 28, textAlign: 'center', opacity: 0,
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%', margin: '0 auto 16px',
                background: item.gradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, fontWeight: 900, color: 'white',
                fontFamily: "'Space Grotesk', sans-serif",
              }}>
                {item.step}
              </div>
              <div style={{
                width: 36, height: 36, borderRadius: 8, margin: '0 auto 12px',
                background: 'rgba(99, 102, 241, 0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <item.icon size={18} style={{ color: 'var(--accent-primary)' }} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>{item.title}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* =============================================
          WHAT CAN IT DETECT?
          ============================================= */}
      <section style={{
        maxWidth: 900, margin: '0 auto', padding: '0 16px clamp(40px, 6vw, 80px)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 className="font-display" style={{
            fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 800, marginBottom: 12,
          }}>
            What can it <span className="gradient-text-warm">detect</span>?
          </h2>
          <p style={{ fontSize: 'clamp(14px, 1.8vw, 16px)', color: 'var(--text-secondary)', maxWidth: 550, margin: '0 auto' }}>
            ScamShield AI covers the most common types of digital fraud targeting Indian citizens.
          </p>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 14,
        }}>
          {[
            { emoji: '🔒', label: 'Digital Arrest Scams', desc: 'Fake police/CBI calls threatening arrest' },
            { emoji: '🎣', label: 'Phishing Emails', desc: 'Fake login pages & credential theft' },
            { emoji: '💸', label: 'UPI / Payment Fraud', desc: 'Fake payment requests & QR scams' },
            { emoji: '💼', label: 'Job Scams', desc: 'Fake offers demanding upfront fees' },
            { emoji: '🏦', label: 'Banking Fraud', desc: 'KYC update & account freeze threats' },
            { emoji: '🎁', label: 'Lottery / Prize Scams', desc: 'Fake winnings & advance fee traps' },
            { emoji: '❤️', label: 'Romance Scams', desc: 'Emotional manipulation for money' },
            { emoji: '📦', label: 'Customs / Parcel Scams', desc: 'Fake delivery fees & customs duty' },
            { emoji: '🏛️', label: 'Government Impersonation', desc: 'Fake IT notices, RBI, TRAI calls' },
            { emoji: '📱', label: 'Tech Support Scams', desc: 'Remote access & virus scare tactics' },
            { emoji: '💎', label: 'Investment Scams', desc: 'Crypto, forex & Ponzi guarantees' },
            { emoji: '✉️', label: 'SMS Phishing', desc: 'Suspicious links & OTP harvesting' },
          ].map((item) => (
            <div key={item.label} className="glass-card" style={{
              padding: '18px 16px', display: 'flex', flexDirection: 'column', gap: 6,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>{item.emoji}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>{item.label}</span>
              </div>
              <p style={{ fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.4, paddingLeft: 28 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* =============================================
          CYBER AWARENESS
          ============================================= */}
      <section style={{
        maxWidth: 1000, margin: '0 auto 60px', padding: '0 16px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 className="font-display" style={{
            fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 800, marginBottom: 12,
          }}>
            <span className="gradient-text">Awareness</span> Corner
          </h2>
          <p style={{ fontSize: 'clamp(14px, 1.8vw, 16px)', color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto' }}>
            Stay informed and protected with official resources from Indian Cybercrime Coordination Centre (I4C).
          </p>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 20,
        }}>
          {[
            {
              title: 'Citizen Manual',
              desc: 'Comprehensive guide on using the reporting portal and understanding investigation workflows.',
              icon: BookOpen,
              color: '#F59E0B',
              link: 'https://cybercrime.gov.in/Webform/Citizen_Manual.aspx'
            },
            {
              title: 'Cyber Safety Tips',
              desc: 'Best practices to secure your devices, banking details, and social media accounts.',
              icon: ShieldCheck,
              color: '#10B981',
              link: 'https://cybercrime.gov.in/Webform/Crime_OnlineSafetyTips.aspx'
            },
            {
              title: 'Cyber Awareness',
              desc: 'Educational modules on identifying threats like phishing, malware, and social engineering.',
              icon: Monitor,
              color: '#22D3EE',
              link: 'https://cybercrime.gov.in/Webform/CyberAware.aspx'
            },
            {
              title: 'Daily Digest',
              desc: 'Latest modus operandi alerts and fraud trends analyzed by cyber experts. (Internal Archive)',
              icon: FileText,
              color: '#8B5CF6',
              link: '/resources/daily-digest'
            },
          ].map((item, index) => (
            <a key={item.title} href={item.link} target="_blank" rel="noopener noreferrer" className="glass-card hover-lift" style={{
              padding: 24, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center',
              borderTop: `3px solid ${item.color}`, transition: 'transform 0.2s', cursor: 'pointer',
              textDecoration: 'none'
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12, marginBottom: 16,
                background: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <item.icon size={24} style={{ color: item.color }} />
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>{item.title}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, flex: 1, marginBottom: 16 }}>{item.desc}</p>
              <div style={{ fontSize: 12, color: item.color, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                Read More <ArrowRight size={14} />
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* =============================================
          IMPORTANT RESOURCES
          ============================================= */}
      <section style={{
        maxWidth: 1000, margin: '0 auto 80px', padding: '0 16px',
      }}>
        <div style={{
          position: 'relative', padding: 'clamp(32px, 5vw, 60px)',
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(20px)',
          borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)',
          overflow: 'hidden',
        }}>
          {/* Background Glow */}
          <div style={{
            position: 'absolute', top: -100, right: -100, width: 300, height: 300,
            background: 'radial-gradient(circle, rgba(239, 68, 68, 0.15), transparent 70%)',
            filter: 'blur(60px)', pointerEvents: 'none',
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ marginBottom: 40, textAlign: 'center' }}>
              <h2 className="font-display" style={{
                fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 800, marginBottom: 12,
                display: 'inline-flex', alignItems: 'center', gap: 12,
              }}>
                <AlertTriangle size={28} style={{ color: 'var(--danger)' }} />
                Critical Resources
              </h2>
              <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto' }}>
                Victim of cyber fraud? Act immediately using these official channels.
              </p>
            </div>

            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, alignItems: 'stretch'
            }}>
              {/* HELPLINE CARD (Featured) */}
              <div className="glass-card slide-up" style={{
                padding: 32, gridRow: 'span 2',
                background: 'linear-gradient(145deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.02))',
                borderColor: 'rgba(239, 68, 68, 0.25)',
                display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center',
              }}>
                <div style={{
                  width: 80, height: 80, borderRadius: '50%', marginBottom: 24,
                  background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 30px rgba(239, 68, 68, 0.2)',
                }}>
                  <Phone size={36} color="#EF4444" style={{ animation: 'pulse-ring 2s infinite' }} />
                </div>
                <h3 style={{ fontSize: 24, fontWeight: 800, color: '#EF4444', marginBottom: 8 }}>Helpline 1930</h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 24 }}>
                  Dial 1930 immediately if you have lost money to cyber fraud. The "Golden Hour" reporting can help freeze funds.
                </p>
                <a href="tel:1930" className="btn-primary" style={{
                  background: 'var(--danger)', width: '100%', justifyContent: 'center', padding: '16px',
                  boxShadow: '0 8px 20px rgba(239, 68, 68, 0.3)', textDecoration: 'none'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Phone size={18} /> Call Now
                  </div>
                </a>
              </div>

              {/* RIGHT COLUMN */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* PORTAL CARD */}
                <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" className="glass-card" style={{
                  padding: 24, textDecoration: 'none', display: 'flex', gap: 20, alignItems: 'center', flex: 1,
                  borderColor: 'rgba(99, 102, 241, 0.2)', transition: 'transform 0.2s', cursor: 'pointer'
                }}>
                  <div style={{
                    minWidth: 56, height: 56, borderRadius: 12,
                    background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Globe size={24} color="#6366F1" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                      cybercrime.gov.in <ExternalLink size={12} color="var(--text-muted)" />
                    </h4>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      Official portal to file online FIRs for all digital crimes.
                    </p>
                  </div>
                </a>

                {/* SAFETY TIPS CARD */}
                <div className="glass-card" style={{
                  padding: 24, display: 'flex', gap: 20, alignItems: 'center', flex: 1,
                  borderColor: 'rgba(16, 185, 129, 0.2)',
                }}>
                  <div style={{
                    minWidth: 56, height: 56, borderRadius: 12,
                    background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <ShieldCheck size={24} color="#10B981" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                      Prevention Tips
                    </h4>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      Never share OTPs. No official asks for money via video call.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        borderTop: '1px solid var(--border-color)',
        padding: '24px 16px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 24, marginBottom: 16 }}>
            <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Globe size={14} /> cybercrime.gov.in
            </a>
            <a href="tel:1930" style={{ color: 'var(--danger)', fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
              <Phone size={14} /> Helpline: 1930
            </a>
            <Link href="/department/login" style={{ color: 'var(--text-secondary)', fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Lock size={14} /> Department Portal
            </Link>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            © 2026 ScamShield AI — Built for Vibe-A-Thon by Codebucket Solutions Pvt Ltd
          </p>
        </div>
      </footer>
    </div>
  );
}
