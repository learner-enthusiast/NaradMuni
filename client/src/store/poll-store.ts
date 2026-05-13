import { create } from 'zustand'
import type { Analytics, Poll, PollSummary, PublicState } from '../types/poll'

type PollStore = {
    polls: PollSummary[]
    activePoll: Poll | null
    analytics: Analytics | null
    publicPoll: Poll | null
    publicState: PublicState | null
    loading: boolean
    setPolls: (polls: PollSummary[]) => void
    setActive: (poll: Poll | null, analytics?: Analytics | null) => void
    setPublic: (
        poll: Poll | null,
        state: PublicState | null,
        analytics?: Analytics | null
    ) => void
    setAnalytics: (analytics: Analytics | null) => void
    setPollExpired: (pollId: string) => void
    setPollStatus: (pollId: string, status: Poll['status']) => void
    setLoading: (loading: boolean) => void
}

export const usePollStore = create<PollStore>((set) => ({
    polls: [],
    activePoll: null,
    analytics: null,
    publicPoll: null,
    publicState: null,
    loading: false,
    setPolls: (polls) => set({ polls }),
    setActive: (poll, analytics = null) => set({ activePoll: poll, analytics }),
    setPublic: (poll, state, analytics = null) =>
        set({ publicPoll: poll, publicState: state, analytics }),
    setAnalytics: (analytics) => set({ analytics }),
    setPollExpired: (pollId) =>
        set((state) => ({
            activePoll:
                state.activePoll?.id === pollId
                    ? { ...state.activePoll, status: 'expired' }
                    : state.activePoll,
            publicPoll:
                state.publicPoll?.id === pollId
                    ? { ...state.publicPoll, status: 'expired' }
                    : state.publicPoll,
            publicState:
                state.publicPoll?.id === pollId && state.publicState
                    ? {
                          ...state.publicState,
                          expired: true,
                          acceptingResponses: false,
                      }
                    : state.publicState,
        })),
    setPollStatus: (pollId, status) =>
        set((state) => {
            const activePoll =
                state.activePoll?.id === pollId
                    ? { ...state.activePoll, status }
                    : state.activePoll

            const publicPoll =
                state.publicPoll?.id === pollId
                    ? { ...state.publicPoll, status }
                    : state.publicPoll

            const publicState =
                state.publicPoll?.id === pollId && state.publicState
                    ? {
                          ...state.publicState,
                          acceptingResponses:
                              status === 'active' &&
                              state.publicState.expired === false,
                          resultsVisible:
                              status === 'published' ||
                              Boolean(publicPoll?.showLiveResults),
                      }
                    : state.publicState

            return { activePoll, publicPoll, publicState }
        }),
    setLoading: (loading) => set({ loading }),
}))
