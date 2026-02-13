import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MapPin, Phone, Mail, ExternalLink, CheckCircle2 } from "lucide-react";

interface VendorCardProps {
    name: string;
    role: string;
    company: string;
    location: string;
    rating: number;
    reviews: number;
    imageUrl?: string;
    specialties: string[];
    isVerified?: boolean;
}

export function VendorCard({
    name,
    role,
    company,
    location,
    rating,
    reviews,
    imageUrl,
    specialties,
    isVerified = false,
}: VendorCardProps) {
    return (
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm overflow-hidden group hover:border-primary/20 transition-all relative flex flex-col h-full">
            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <CardHeader className="pb-3 flex flex-row items-start gap-4">
                <Avatar className="h-12 w-12 border border-white/10">
                    <AvatarImage src={imageUrl} alt={name} />
                    <AvatarFallback>{name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <CardTitle className="text-base truncate">{name}</CardTitle>
                        {isVerified && (
                            <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" />
                        )}
                    </div>
                    <CardDescription className="truncate">{role} at {company}</CardDescription>
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{location}</span>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded text-yellow-500 font-bold text-xs border border-yellow-500/20">
                        <Star className="h-3 w-3 fill-yellow-500" />
                        {rating.toFixed(1)}
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-1">({reviews} reviews)</span>
                </div>
            </CardHeader>
            <CardContent className="pb-3 flex-1">
                <div className="flex flex-wrap gap-2 mb-4">
                    {specialties.map((specialty, index) => (
                        <Badge key={index} variant="secondary" className="text-[10px] bg-white/5 hover:bg-white/10 text-muted-foreground border-white/5">
                            {specialty}
                        </Badge>
                    ))}
                </div>
            </CardContent>
            <CardFooter className="pt-3 border-t border-white/5 flex gap-2 bg-white/2">
                <Button className="flex-1 h-9 text-xs" variant="outline">
                    View Profile
                </Button>
                <Button className="flex-1 h-9 text-xs gap-2" size="sm">
                    <Mail className="h-3.5 w-3.5" /> Connect
                </Button>
            </CardFooter>
        </Card>
    );
}
