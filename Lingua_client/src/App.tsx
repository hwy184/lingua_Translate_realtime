// src/App.tsx
import "./App.css";
import { LangBar } from "./components/langBar";
import { TextInOut } from "./components/textInOut";
import { AppProviders } from "./providers/appProvider";

function App() {
    return (
        // Khung ngoài cùng: toàn màn hình, padding viền đen (tạo cảm giác đường viền đen)
        <div className="min-h-screen p-5 bg-white border-8 border-black">
            <AppProviders>

                {/* Khung chứa LangBar và Nội dung Chính */}
                <div className="flex flex-col h-full">

                    {/* KHUNG 1: LANG BAR */}
                    {/* Bao quanh LangBar bằng đường viền cam */}
                    <div className="p-2 border-b-4 border-orange-400">
                        <LangBar />
                    </div>

                    {/* KHUNG 2: NỘI DUNG CHÍNH (TextInOut) */}
                    {/* Bao quanh TextInOut bằng đường viền cam */}
                    <div className="p-2 border-b-4 border-orange-400">
                        <TextInOut />
                    </div>
                </div>

            </AppProviders>
        </div>
    );
}

export default App;