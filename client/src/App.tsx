import { Route, Routes } from 'react-router-dom'
import { AdminRoute } from './components/auth/admin-route'
import { ProtectedRoute } from './components/auth/protected-route'
import { Header } from './components/layout/header'
import { AdminPage } from './pages/admin-page'

import { DashboardPage } from './pages/dashboard-page'
import { HomePage } from './pages/home-page'
import { PublicPollPage } from './pages/public-poll-page'
import { CreatePolls } from './pages/createPolls-page'
import { Toaster } from 'sonner'

function App() {
    return (
        <div className="app-shell text-foreground">
            <Header />
            <Toaster />
            <Routes>
                <Route element={<HomePage />} path="/" />
                <Route
                    element={
                        <ProtectedRoute>
                            <CreatePolls />
                        </ProtectedRoute>
                    }
                    path="/createPolls"
                />
                <Route
                    element={
                        <ProtectedRoute>
                            <DashboardPage />
                        </ProtectedRoute>
                    }
                    path="/dashboard/:pollId"
                />
                <Route
                    element={
                        <AdminRoute>
                            <AdminPage />
                        </AdminRoute>
                    }
                    path="/admin"
                />
                <Route element={<PublicPollPage />} path="/p/:slug" />
            </Routes>
        </div>
    )
}

export default App
