import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface AgentBadgeProps {
    name: string;
    image?: string;
    role?: string;
}

export function AgentBadge({ name, image, role = "Agent" }: AgentBadgeProps) {
    return (
        <div className="flex items-center gap-2 p-1 pr-3 rounded-full bg-white/5 border border-white/10 w-fit">
            <Avatar className="h-6 w-6">
                <AvatarImage src={image} alt={name} />
                <AvatarFallback>{name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
                <span className="text-xs font-medium leading-none">{name}</span>
                <span className="text-[10px] text-muted-foreground leading-none">{role}</span>
            </div>
        </div>
    );
}
