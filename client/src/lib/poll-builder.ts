import { newQuestion } from './poll-utils'
import type { BuilderQuestion } from '../types/poll'

export type PollBuilderState = {
    title: string
    customSlug: string
    description: string
    category: string
    tags: string
    coverPhoto: string | null

    expiresAt: string
    isAnonymous: boolean
    showLiveResults: boolean
    completionMessage: string
    questions: BuilderQuestion[]
}

function createStarterQuestion(): BuilderQuestion {
    return {
        ...newQuestion(),
        question: 'Which thought resonates with your voice the most?',
        options: [
            {
                id: crypto.randomUUID(),
                label: 'Meaningful conversations',
            },
            {
                id: crypto.randomUUID(),
                label: 'Shared wisdom and insights',
            },
            {
                id: crypto.randomUUID(),
                label: 'A stronger community connection',
            },
        ],
    }
}

export function createInitialPollBuilderState(): PollBuilderState {
    return {
        title: 'Narad Sabha',
        customSlug: '',
        description:
            'Gather thoughts, perspectives, and voices from across the world.',
        category: 'Conversation',
        tags: 'wisdom, voices, community',
        coverPhoto: null,
        expiresAt: '',
        isAnonymous: true,
        showLiveResults: true,
        completionMessage:
            'Your voice has joined the Sabha. Thank you for sharing your thoughts.',
        questions: [createStarterQuestion()],
    }
}

export function toCreatePollPayload(form: PollBuilderState) {
    return {
        title: form.title,
        customSlug: form.customSlug || undefined,
        description: form.description,
        category: form.category,
        coverPhoto: form.coverPhoto,
        tags: form.tags
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean),

        completionMessage: form.completionMessage,
        expiresAt: form.expiresAt
            ? new Date(form.expiresAt).toISOString()
            : null,
        isAnonymous: form.isAnonymous,
        showLiveResults: form.showLiveResults,
        questions: form.questions.map((question) => ({
            question: question.question,
            isMandatory: question.isMandatory,
            options: question.options.filter((option) => option.label.trim()),
        })),
    }
}
