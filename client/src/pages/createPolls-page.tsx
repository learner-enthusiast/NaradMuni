import { BuilderPreview } from '../components/builder/builder-preview'
import { PollSettingsForm } from '../components/builder/poll-settings-form'
import { QuestionCard } from '../components/builder/question-card'
import { useCreatePolls } from '../hooks/use-createPolls'
import { useEffect } from 'react'
import { toast } from 'sonner'

export function CreatePolls() {
    const {
        form,
        error,
        saving,
        updateField,
        updateQuestion,
        addQuestion,
        removeQuestion,
        addOption,
        updateOption,
        removeOption,
        submit,
        uploadCoverPhoto,
        deleteCoverPhoto,
    } = useCreatePolls()
    useEffect(() => {
        if (!error) return

        try {
            const parsed: unknown = JSON.parse(error)

            // Zod-style array: [{ message: "..." }, ...]
            if (
                Array.isArray(parsed) &&
                parsed.length > 0 &&
                typeof parsed[0] === 'object' &&
                parsed[0] !== null &&
                'message' in parsed[0] &&
                typeof (parsed[0] as any).message === 'string'
            ) {
                toast.error((parsed[0] as any).message)
                return
            }

            // Generic object: { message: "..." }
            if (
                typeof parsed === 'object' &&
                parsed !== null &&
                'message' in parsed &&
                typeof (parsed as any).message === 'string'
            ) {
                toast.error((parsed as any).message)
                return
            }

            // Fallback if JSON parses but shape isn't what you expect
            toast.error(error)
        } catch {
            // Not JSON, just show the string
            toast.error(error)
        }
    }, [error])

    return (
        <main className="db-root">
            <div className="db-layout">
                <div className="db-page-head">
                    <div>
                        <h1 className="db-title">Build Sabha</h1>
                        <p className="db-desc">
                            Set up questions, response rules, and sharing
                            options for your poll.
                        </p>
                    </div>
                </div>

                <section className="db-grid">
                    <div className="space-y-4">
                        <PollSettingsForm
                            form={form}
                            updateField={updateField}
                            uploadCoverPhoto={uploadCoverPhoto}
                            deleteCoverPhoto={deleteCoverPhoto}
                        />
                        {form.questions.map((question, index) => (
                            <QuestionCard
                                addOption={addOption}
                                canRemove={form.questions.length > 1}
                                key={question.id}
                                question={question}
                                questionIndex={index}
                                removeOption={removeOption}
                                removeQuestion={removeQuestion}
                                updateOption={updateOption}
                                updateQuestion={updateQuestion}
                            />
                        ))}
                    </div>
                    <BuilderPreview
                        form={form}
                        addQuestion={addQuestion}
                        saving={saving}
                        submit={submit}
                        deleteCoverPhoto={deleteCoverPhoto}
                        updateField={updateField}
                    />
                </section>
            </div>
        </main>
    )
}
