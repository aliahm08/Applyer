import { NetworkingAgent } from "@/components/NetworkingAgent"

export default function NetworkingPage() {
    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Post-Application Connect</h1>
                <p className="text-muted-foreground mt-2 text-lg">
                    Our AI scans for high-value connections at companies you&apos;ve applied to.
                </p>
            </div>

            <NetworkingAgent />
        </div>
    )
}
