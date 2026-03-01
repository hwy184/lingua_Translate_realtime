// src/App.tsx
import "./App.css";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { LangBar } from "./components/langBar";
import { TextInOut } from "./components/textInOut";
import { AppProviders } from "./providers/appProvider";
import AuthTestPage from "./pages/AuthTestPage";

function HomePage() {
    return (
        <div className="min-h-screen p-5 bg-white border-8 border-black">
            <AppProviders>
                <div className="flex flex-col h-full">
                    {/* Link test auth */}
                    <div className="mb-2 text-right">
                        <Link to="/auth-test" className="text-sm text-blue-600 underline hover:text-blue-800">
                            🔐 Auth Test Page
                        </Link>
                    </div>

                    {/* KHUNG 1: LANG BAR */}
                    <div className="p-2 border-b-4 border-orange-400">
                        <LangBar />
                    </div>

                    {/* KHUNG 2: NỘI DUNG CHÍNH (TextInOut) */}
                    <div className="p-2 border-b-4 border-orange-400">
                        <TextInOut />
                    </div>
                </div>
            </AppProviders>
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/auth-test" element={<AuthTestPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
