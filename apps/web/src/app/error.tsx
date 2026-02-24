"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Global Web App Error:", error);
    }, [error]);

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-background px-4">
            <div className="flex max-w-md flex-col items-center space-y-6 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100/10 border border-red-500/20">
                    <AlertCircle className="h-10 w-10 text-red-500" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">Something went wrong</h1>
                    <p className="text-sm text-muted-foreground">
                        An unexpected error occurred. You can try recovering the view or return to safety.
                    </p>
                </div>
                <div className="flex space-x-4">
                    <Button onClick={reset} variant="default">
                        Try again
                    </Button>
                    <Button variant="outline" onClick={() => window.location.href = '/'}>
                        Go home
                    </Button>
                </div>
            </div>
        </div>
    );
}
