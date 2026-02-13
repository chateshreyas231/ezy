import { Button } from "@/components/ui/button";

export default function ButtonDemoPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900 gap-12 p-8 dark">
            <div className="flex flex-col items-center gap-6">
                <h1 className="text-3xl font-bold text-white mb-4">Standard Buttons (Replaced Liquid)</h1>
                <div className="relative h-[200px] w-full max-w-[800px] flex items-center justify-center border border-white/10 rounded-xl bg-black/20">
                    <Button size="lg">
                        Liquid Glass (Replaced)
                    </Button>
                </div>
                <div className="flex gap-4 flex-wrap justify-center">
                    <Button size="default">Default</Button>
                    <Button size="lg" variant="secondary">Secondary</Button>
                    <Button size="sm" variant="outline">Outline</Button>
                </div>
            </div>

            <div className="flex flex-col items-center gap-6">
                <h1 className="text-3xl font-bold text-white mb-4">Standard Buttons (Replaced Metal)</h1>
                <div className="flex gap-6 flex-wrap justify-center">
                    <Button variant="secondary">Default Metal</Button>
                    <Button variant="default">Primary Metal</Button>
                    <Button variant="secondary" className="border-yellow-500 text-yellow-500 hover:text-yellow-400">Gold Metal</Button>
                    <Button variant="secondary" className="border-orange-700 text-orange-700 hover:text-orange-600">Bronze Metal</Button>
                    <Button className="bg-green-600 hover:bg-green-700 text-white">Success Metal</Button>
                    <Button variant="destructive">Error Metal</Button>
                </div>
            </div>
        </div>
    )
}
