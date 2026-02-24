const fs = require('fs');

const target = 'src/app/dashboard/overview/page.tsx';
let content = fs.readFileSync(target, 'utf8');

// 1. Add Sheet imports
content = content.replace(
  'import { Input } from "@/components/ui/input";',
  'import { Input } from "@/components/ui/input";\nimport { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";'
);

// 2. Extract the right column content into a variable
const rightColumnRegex = /<div className="space-y-4 lg:h-full lg:overflow-y-auto lg:pr-1">([\s\S]*?)<\/div>\s*<\/div>\s*\);\s*}/;
const match = rightColumnRegex.exec(content);
if (!match) throw new Error("Could not find right column");

const innerContent = match[1];

// 3. Define the sidebarContent variable before if (!mounted)
content = content.replace(
  '    if (!mounted) {',
  '    const sidebarContent = (\n        <div className="space-y-4 pb-8 lg:pb-0">\n' + innerContent + '\n        </div>\n    );\n\n    if (!mounted) {'
);

// 4. Update the trigger in CardHeader
content = content.replace(
  '<CardTitle className="text-xl">AI Workspace Live</CardTitle>\n                            <Badge variant="outline" className="border-white/20">\n                                {isListening ? "Listening..." : isSpeaking ? "Speaking..." : "Ready"}\n                            </Badge>',
  `<CardTitle className="text-xl">AI Workspace Live</CardTitle>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="border-white/20">
                                    {isListening ? "Listening..." : isSpeaking ? "Speaking..." : "Ready"}
                                </Badge>
                                <div className="lg:hidden">
                                    <Sheet>
                                        <SheetTrigger asChild>
                                            <Button variant="outline" size="sm" className="h-6 text-xs px-2">Overview</Button>
                                        </SheetTrigger>
                                        <SheetContent side="right" className="w-[85vw] sm:w-[400px] overflow-y-auto pt-10 pb-6 bg-slate-50/50 backdrop-blur-xl">
                                            <SheetHeader className="mb-4 text-left">
                                                <SheetTitle>Workspace Overview</SheetTitle>
                                            </SheetHeader>
                                            {sidebarContent}
                                        </SheetContent>
                                    </Sheet>
                                </div>
                            </div>`
);

// 5. Replace the original right column
content = content.replace(
  match[0],
  `<div className="hidden lg:block lg:h-full lg:overflow-y-auto lg:pr-1">
                {sidebarContent}
            </div>
        </div>
    );
}`
);

fs.writeFileSync(target, content);
console.log("Successfully updated page.tsx");
