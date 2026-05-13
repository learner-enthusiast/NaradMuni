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
    } = useCreatePolls()
    useEffect(() => {
        if (!error) return

        let parsedError = error

        if (typeof error === 'string') {
            try {
                parsedError = JSON.parse(error)
            } catch {
                toast.error(error)
                return
            }
        }

        if (Array.isArray(parsedError)) {
            toast.error(parsedError[0].message)

            return
        }

        toast.error(parsedError?.message || 'Something went wrong')
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
                    />
                </section>
            </div>
        </main>
    )
}
