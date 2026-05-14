import { SignUpButton } from '@clerk/react'
import {
    Eye,
    Loader2,
    Plus,
    Rocket,
    Send,
    ShieldCheck,
    Sparkles,
    Vote,
    Zap,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SignedInView, SignedOutView } from '../components/auth/auth-views'
import { AuthWall } from '../components/home/auth-wall'
import { EmptyState } from '../components/home/empty-state'
import { PollCard } from '../components/polls/poll-card'
import { getApiError, useApiClient } from '../lib/api'
import { usePollStore } from '../store/poll-store'
import type { PollSummary } from '../types/poll'

/* ─────────────────────────────────────────────
   Sub-components (inline, theme-matched)
───────────────────────────────────────────── */
function ThemeMetric({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode
    label: string
    value: string
}) {
    return (
        <div className="hp-metric">
            <div className="hp-metric-label">
                {icon}
                {label}
            </div>
            <div className="hp-metric-value">{value}</div>
        </div>
    )
}

/* ─────────────────────────────────────────────
   HomePage
───────────────────────────────────────────── */
export function HomePage() {
    const api = useApiClient()
    const navigate = useNavigate()
    const { polls, setPolls, loading, setLoading } = usePollStore()
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [hindiTransalation, setHindiTranslation] = useState(false)
    useEffect(() => {
        const interval = setInterval(() => {
            setHindiTranslation((prev) => !prev)
        }, 5000)

        return () => clearInterval(interval)
    }, [])
    useEffect(() => {
        let active = true
        async function load() {
            setLoading(true)
            try {
                const data = await api.get<{ polls: PollSummary[] }>(
                    '/api/poll'
                )
                if (active) setPolls(data.polls)
            } catch (error) {
                console.warn(getApiError(error, 'Could not load polls'))
                if (active) setPolls([])
            } finally {
                if (active) setLoading(false)
            }
        }
        load()
        return () => {
            active = false
        }
    }, [api, setLoading, setPolls])

    useEffect(() => {
        if (window.location.hash === '#workspace') {
            document
                .getElementById('workspace')
                ?.scrollIntoView({ behavior: 'smooth' })
        }
    }, [])

    const totalResponses = polls.reduce(
        (sum, poll) => sum + poll.analytics.totalResponses,
        0
    )
    const visiblePolls = useMemo(() => {
        const query = search.trim().toLowerCase()
        return polls.filter((poll) => {
            const matchesSearch =
                !query ||
                poll.title.toLowerCase().includes(query) ||
                (poll.description ?? '').toLowerCase().includes(query) ||
                poll.category.toLowerCase().includes(query) ||
                poll.tags.some((tag) => tag.toLowerCase().includes(query))
            const matchesStatus =
                statusFilter === 'all' || poll.status === statusFilter
            return matchesSearch && matchesStatus
        })
    }, [polls, search, statusFilter])

    const scrollToWorkspace = () =>
        document
            .getElementById('workspace')
            ?.scrollIntoView({ behavior: 'smooth' })

    return (
        <main className="hp-root ">
            <div className="hp-layout">
                {/* ── Workspace section ── */}
                <section id="workspace" className="hp-section">
                    <div className="hp-section-header">
                        <div>
                            <p className="hp-section-kicker">
                                <span
                                    className="hp-badge-dot"
                                    style={{
                                        display: 'inline-block',
                                        marginRight: 6,
                                    }}
                                />
                                Sacred space
                            </p>

                            <h2
                                className="hp-section-title"
                                key={
                                    hindiTransalation ? 'hi-title' : 'en-title'
                                }
                            >
                                {hindiTransalation
                                    ? 'नारद सभा'
                                    : 'Narad’s Sabha'}
                            </h2>

                            <p
                                className="hp-section-sub"
                                key={hindiTransalation ? 'hi' : 'en'}
                            >
                                {hindiTransalation
                                    ? 'प्रश्न रचें, साझा करें और दुनिया भर की आवाज़ों को एक ही स्थान पर जोड़ें।'
                                    : 'Create, share, and gather voices from across the world in one place.'}
                            </p>
                        </div>

                        <SignedInView>
                            <button
                                className="hp-btn hp-btn-primary"
                                onClick={() => navigate('/createPolls')}
                                type="button"
                            >
                                <Plus size={14} /> Start a question
                            </button>
                        </SignedInView>
                    </div>

                    <SignedInView>
                        <div className="my-6 grid gap-3 md:grid-cols-[1fr_220px]">
                            <input
                                className="neo-input"
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search questions, stories, categories, or voices"
                                type="search"
                                value={search}
                            />

                            <select
                                className="neo-input"
                                onChange={(event) =>
                                    setStatusFilter(event.target.value)
                                }
                                value={statusFilter}
                            >
                                <option value="all">All conversations</option>
                                <option value="draft">Unfinished</option>
                                <option value="active">Flowing</option>
                                <option value="closed">Completed</option>
                                <option value="expired">Faded</option>
                                <option value="published">
                                    Shared publicly
                                </option>
                            </select>
                        </div>
                    </SignedInView>

                    <SignedOutView>
                        <AuthWall />
                    </SignedOutView>

                    <SignedInView>
                        {loading ? (
                            <div className="hp-panel">
                                <Loader2 size={28} className="hp-spinner" />
                            </div>
                        ) : polls.length === 0 ? (
                            <EmptyState />
                        ) : visiblePolls.length === 0 ? (
                            <div className="hp-panel">
                                <p className="font-black">
                                    No conversations match your search.
                                </p>
                            </div>
                        ) : (
                            <div className="hp-poll-grid">
                                {visiblePolls.map((poll) => (
                                    <PollCard key={poll.id} poll={poll} />
                                ))}
                            </div>
                        )}
                    </SignedInView>
                </section>
                {/* ── Hero ── */}
                <section className="hp-hero">
                    {/* Left column */}
                    <div>
                        <div className="hp-badge">
                            <span className="hp-badge-dot" />
                            {hindiTransalation
                                ? 'जीवंत संवाद · साझा ज्ञान'
                                : 'Living conversations · Shared wisdom'}
                        </div>

                        <h1
                            className="hp-title"
                            key={hindiTransalation ? 'hi' : 'en'}
                        >
                            {hindiTransalation ? (
                                <>
                                    प्रश्नों को{' '}
                                    <span className="hp-title-accent">
                                        संसार भर में पहुँचाते हुए।
                                    </span>
                                </>
                            ) : (
                                <>
                                    Carrying questions{' '}
                                    <span className="hp-title-accent">
                                        across the world.
                                    </span>
                                </>
                            )}
                        </h1>

                        <p className="hp-subtitle">
                            Create conversations, gather perspectives, and watch
                            voices come alive in real time.
                        </p>

                        <div className="hp-btn-row">
                            <SignedInView>
                                <button
                                    className="hp-btn hp-btn-primary"
                                    onClick={() => navigate('/createPolls')}
                                    type="button"
                                >
                                    <Rocket size={15} /> Start a question
                                </button>
                            </SignedInView>

                            <SignedOutView>
                                <SignUpButton mode="modal">
                                    <button
                                        className="hp-btn hp-btn-primary"
                                        type="button"
                                    >
                                        <Rocket size={15} /> Begin the journey
                                        to Eternal Realm
                                    </button>
                                </SignUpButton>
                            </SignedOutView>

                            <button
                                className="hp-btn hp-btn-secondary"
                                onClick={scrollToWorkspace}
                                type="button"
                            >
                                <Eye size={15} /> Enter Your Sabha
                            </button>
                        </div>

                        <div className="hp-strip">
                            <span>
                                <ShieldCheck
                                    size={10}
                                    style={{
                                        display: 'inline',
                                        marginRight: 4,
                                    }}
                                />
                                Protected conversations
                            </span>

                            <span>Realtime insights</span>

                            <span>One voice per traveler</span>
                        </div>
                    </div>

                    {/* Right column — live card */}
                    <div className="hp-card">
                        <div className="hp-card-header">
                            <div>
                                <p className="hp-card-label">Sacred pulse</p>
                                <p
                                    key={hindiTransalation ? 'hi' : 'en'}
                                    className="hp-card-title"
                                >
                                    {hindiTransalation
                                        ? '  स्वर एवं मंथन'
                                        : 'Voices & Perspectives'}
                                </p>
                            </div>

                            <div className="hp-card-icon">
                                <img src="/NARAD.png" alt="naradMuni" />
                            </div>
                        </div>
                        <div className="hp-analytics">
                            <div className="hp-analytics-header">
                                <span className="hp-analytics-title">
                                    Living insights
                                </span>

                                <span className="hp-pill">
                                    <Zap size={10} /> flowing now
                                </span>
                            </div>
                        </div>
                        {[
                            'Future direction',
                            'Sacred identity',
                            'Community pulse',
                        ].map((item, i) => (
                            <div className="hp-bar-row" key={item}>
                                <div className="hp-bar-label">
                                    <span>{item}</span>
                                    <span>{44 - i * 17}%</span>
                                </div>

                                <div className="hp-bar-track">
                                    <div
                                        className="hp-bar-fill"
                                        style={{ width: `${44 - i * 17}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                        <div className="hp-metrics">
                            <ThemeMetric
                                icon={<Vote size={12} />}
                                label="Questions"
                                value={polls.length.toString()}
                            />

                            <ThemeMetric
                                icon={<Send size={12} />}
                                label="Voices"
                                value={totalResponses.toString()}
                            />

                            <ThemeMetric
                                icon={<Sparkles size={12} />}
                                label="Flow"
                                value="Alive"
                            />
                        </div>
                    </div>
                </section>

                {/* ── Footer ── */}
                <footer className="hp-footer">
                    Updates broadcast via Socket.io &nbsp;·&nbsp; Realtime
                    analytics &nbsp;·&nbsp; Clerk auth
                </footer>
            </div>
        </main>
    )
}
