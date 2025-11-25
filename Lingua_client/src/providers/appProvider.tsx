import type { ReactNode } from "react";
import { LanguageProvider } from "./LanguageProvider";
import { TanstackProvider } from "./tanStackProvider";
import { SocketProvider } from "./socketProvider";

export function AppProviders({ children }: { children: ReactNode }) {
    return (
        <TanstackProvider>
            <SocketProvider>
                <LanguageProvider>{children}</LanguageProvider>
            </SocketProvider>
        </TanstackProvider>
    );
}
