import { Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function EmptyState() {
    const navigate = useNavigate()

    return (
        <div className="neo-panel grid min-h-72 place-items-center p-8 text-center">
            <div className="max-w-md">
                <img
                    src="/KARTAL.png"
                    className="mx-auto mb-4 size-12 text-main"
                />
                <h3 className="text-3xl font-black tracking-tight">
                    No Sabha's yet
                </h3>
                <p className="mt-2 font-semibold leading-7 text-muted-foreground">
                    Craft a Sabha of questions, invite perspectives, and gather
                    voices from across the world within moments.
                </p>
                <button
                    className="neo-button mx-auto mt-5 bg-main"
                    onClick={() => navigate('/createPolls')}
                    type="button"
                >
                    <Plus className="size-4" /> Create first Sabha
                </button>
            </div>
        </div>
    )
}
