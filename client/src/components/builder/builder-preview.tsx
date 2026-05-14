import { Clock, Loader2, Plus, Radio, UserCheck, X } from 'lucide-react'
import type { PollBuilderState } from '../../hooks/use-createPolls'
import { formatDate } from '../../lib/poll-utils'
import { PreviewRow } from '../ui/preview-row'
import { useRef, useState } from 'react'
type Props = {
    form: PollBuilderState
    addQuestion: () => void
    saving: boolean
    submit: () => void
    deleteCoverPhoto: (url: string) => Promise<void>
    updateField: <Key extends keyof PollBuilderState>(
        key: Key,
        value: PollBuilderState[Key]
    ) => void
}
export function BuilderPreview({
    form,
    addQuestion,
    saving,
    submit,
    deleteCoverPhoto,
    updateField,
}: Props) {
    const inputRef = useRef<HTMLInputElement | null>(null)
    const [removing, setRemoving] = useState(false)
    const onRemove = async () => {
        if (!form.coverPhoto) return
        setRemoving(true)
        try {
            await deleteCoverPhoto(form.coverPhoto)
            updateField('coverPhoto', null)
            if (inputRef.current) inputRef.current.value = ''
        } finally {
            setRemoving(false)
        }
    }
    return (
        <aside className="builder-preview lg:sticky lg:top-24 lg:self-start">
            <div className="premium-analytics-card p-5">
                <div className="mb-5 flex items-center gap-2 text-main">
                    <img src="/KARTAL.png" className="size-5" />
                    <span className="font-black uppercase tracking-[0.16em]">
                        Preview
                    </span>
                </div>
                <h2 className="text-3xl font-black tracking-tight">
                    {form.title || 'Untitled poll'}
                </h2>
                <p className="mt-3 font-semibold leading-7 text-muted-foreground">
                    {form.description}
                </p>
                <div className="mt-5 space-y-3">
                    <PreviewRow
                        icon={<Clock />}
                        label="Expiry"
                        value={
                            form.expiresAt
                                ? formatDate(
                                      new Date(form.expiresAt).toISOString()
                                  )
                                : 'No expiry'
                        }
                    />
                    <PreviewRow
                        icon={<UserCheck />}
                        label="Mode"
                        value={form.isAnonymous ? 'Anonymous' : 'Authenticated'}
                    />
                    <PreviewRow
                        icon={<Radio />}
                        label="Questions"
                        value={form.questions.length.toString()}
                    />
                </div>
            </div>
            <div className="w-full flex justify-center mt-2">
                <button
                    className="neo-button bg-black text-main"
                    type="button"
                    onClick={addQuestion}
                >
                    <Plus className="size-4" /> Add question
                </button>
                <button
                    className="neo-button bg-main"
                    disabled={saving}
                    onClick={submit}
                    type="button"
                >
                    {saving ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : null}
                    {saving ? 'Publishing...' : 'Create Sabha'}
                </button>
            </div>
            {form.coverPhoto && (
                <div className="relative w-full overflow-hidden rounded-md border-2 border-black mt-5">
                    <img
                        src={form.coverPhoto}
                        alt="Cover photo preview"
                        className="h-48 w-full object-cover"
                    />
                    <button
                        type="button"
                        disabled={removing}
                        onClick={() => void onRemove()}
                        className="btn-remove"
                    >
                        {removing ? (
                            <Loader2 className="size-3 animate-spin" />
                        ) : (
                            <X className="size-3" />
                        )}
                        {removing ? 'Removing…' : 'Remove'}
                    </button>
                </div>
            )}
        </aside>
    )
}
