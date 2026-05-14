import { Eye, Loader2, ShieldCheck } from 'lucide-react'
import type { PollBuilderState } from '../../hooks/use-createPolls'
import { Field } from '../ui/field'
import { Toggle } from '../ui/toggle'
import { useRef, useState } from 'react'

type Props = {
    form: PollBuilderState
    updateField: <Key extends keyof PollBuilderState>(
        key: Key,
        value: PollBuilderState[Key]
    ) => void
    uploadCoverPhoto: (file: File) => Promise<string>
    deleteCoverPhoto: (url: string) => Promise<void>
}

export function PollSettingsForm({
    form,
    updateField,
    uploadCoverPhoto,
    deleteCoverPhoto,
}: Props) {
    const inputRef = useRef<HTMLInputElement | null>(null)
    const [uploading, setUploading] = useState(false)

    const onPickFile = async (file: File) => {
        setUploading(true)
        try {
            const previousUrl = form.coverPhoto
            const url = await uploadCoverPhoto(file)
            updateField('coverPhoto', url)

            // if replacing an existing one, delete old AFTER new succeeds
            if (previousUrl && previousUrl !== url) {
                await deleteCoverPhoto(previousUrl)
            }
        } finally {
            setUploading(false)
            if (inputRef.current) inputRef.current.value = ''
        }
    }

    return (
        <div className="neo-panel grid gap-4 p-5">
            <Field label="Title">
                <input
                    className="neo-input rounded-full"
                    value={form.title}
                    onChange={(event) =>
                        updateField('title', event.target.value)
                    }
                />
            </Field>
            <Field label="Custom URL slug">
                <input
                    className="neo-input"
                    placeholder="product-feedback-2026"
                    value={form.customSlug}
                    onChange={(event) =>
                        updateField('customSlug', event.target.value)
                    }
                />
            </Field>
            <Field label="Description">
                <textarea
                    className="neo-input min-h-24"
                    value={form.description}
                    onChange={(event) =>
                        updateField('description', event.target.value)
                    }
                />
            </Field>

            <div className="grid gap-4 md:grid-cols-3">
                <Field label="Expiry">
                    <input
                        className="neo-input bg-main text-black"
                        type="datetime-local"
                        value={form.expiresAt}
                        onChange={(event) =>
                            updateField('expiresAt', event.target.value)
                        }
                    />
                </Field>
                <Toggle
                    checked={form.isAnonymous}
                    icon={<ShieldCheck />}
                    label="Anonymous responses"
                    onChange={(value) => updateField('isAnonymous', value)}
                />
                <Toggle
                    checked={form.showLiveResults}
                    icon={<Eye />}
                    label="Live public results"
                    onChange={(value) => updateField('showLiveResults', value)}
                />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
                <Field label="Category">
                    <input
                        className="neo-input"
                        value={form.category}
                        onChange={(event) =>
                            updateField('category', event.target.value)
                        }
                    />
                </Field>
                <Field label="Tags">
                    <input
                        className="neo-input"
                        value={form.tags}
                        onChange={(event) =>
                            updateField('tags', event.target.value)
                        }
                    />
                </Field>
                <Field label="Cover photo">
                    <div className="grid gap-2">
                        {!form.coverPhoto ? (
                            <>
                                {!uploading && (
                                    <input
                                        ref={inputRef}
                                        className="neo-input cursor-pointer"
                                        type="file"
                                        accept="image/*"
                                        disabled={uploading}
                                        onChange={(e) => {
                                            const file = e.target.files?.[0]
                                            if (file) onPickFile(file)
                                        }}
                                    />
                                )}

                                {uploading ? (
                                    <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                                        <Loader2 className="size-4 animate-spin" />
                                        Uploading…
                                    </div>
                                ) : null}
                            </>
                        ) : (
                            <div>Image Uploaded</div>
                        )}
                    </div>
                </Field>
            </div>
            <Field label="Completion message">
                <input
                    className="neo-input"
                    value={form.completionMessage}
                    onChange={(event) =>
                        updateField('completionMessage', event.target.value)
                    }
                />
            </Field>
        </div>
    )
}
