"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ChatbotFab from "@/components/ui/chatbot-fab";
import { DottedSurface } from "@/components/ui/dotted-surface";
import { MOCK_VENDORS } from "@/lib/mock-data";
import { ArrowLeft, Globe, MapPin, ShieldCheck, Star, Wrench } from "lucide-react";

export default function VendorDetailPage() {
  const params = useParams<{ id: string }>();
  const vendor = useMemo(() => MOCK_VENDORS.find((item) => item.id === params.id), [params.id]);

  if (!vendor) {
    return (
      <DottedSurface className="min-h-screen pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto space-y-4">
          <Button variant="outline" asChild>
            <Link href="/explore/vendor">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to vendor marketplace
            </Link>
          </Button>
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">Vendor not found.</CardContent>
          </Card>
        </div>
      </DottedSurface>
    );
  }

  return (
    <DottedSurface className="min-h-screen pt-24 pb-14 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <Button variant="outline" asChild>
          <Link href="/explore/vendor">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to vendor marketplace
          </Link>
        </Button>

        <Card className="overflow-hidden border-border bg-card shadow-sm">
          <CardContent className="p-0">
            <div className="relative h-52 md:h-64">
              <img src={vendor.banner} alt={vendor.company} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/25 to-black/65" />
            </div>

            <div className="px-6 pb-6 -mt-14 relative z-10">
              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
                <div className="flex items-start gap-4">
                  <img src={vendor.avatar} alt={vendor.name} className="h-24 w-24 rounded-2xl border-4 border-background object-cover shadow-lg" />
                  <div>
                    <Badge className="mb-2 bg-card/20 text-foreground border-border/60">{vendor.category}</Badge>
                    <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow">{vendor.company}</h1>
                    <p className="text-white/90">{vendor.name}</p>
                    <p className="mt-2 flex items-center gap-2 text-sm text-white/90">
                      <Star className="h-4 w-4 text-yellow-300 fill-yellow-300" />
                      {vendor.rating.toFixed(1)} rating ({vendor.reviewCount} reviews)
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button>Request Quote</Button>
                  <Button variant="outline">Save</Button>
                  <Button variant="outline">Share</Button>
                </div>
              </div>

              <p className="mt-5 rounded-lg border border-border bg-card/85 backdrop-blur-sm p-4 text-sm text-muted-foreground">
                {vendor.bio}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <InfoStat label="Projects Completed" value={`${vendor.completedProjects}`} />
          <InfoStat label="Response Time" value={`${vendor.responseTimeHours}h`} />
          <InfoStat label="Years in Business" value={`${vendor.yearsInBusiness}`} />
          <InfoStat label="Category" value={vendor.category} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle>Work Portfolio</CardTitle>
              <CardDescription>Recent projects and delivery outcomes.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vendor.portfolio.map((project) => (
                <div key={project.title} className="rounded-xl border border-border bg-muted/40 overflow-hidden">
                  <img src={project.image} alt={project.title} className="h-40 w-full object-cover" />
                  <div className="p-4 space-y-1.5">
                    <p className="font-semibold">{project.title}</p>
                    <p className="text-sm text-muted-foreground">{project.location}</p>
                    <p className="text-sm text-muted-foreground">{project.summary}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle>Business Details</CardTitle>
              <CardDescription>Core capabilities, coverage, certifications, and language support.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <DetailGroup icon={<Wrench className="h-4 w-4" />} title="Specializations" items={vendor.specialties} />
              <DetailGroup icon={<MapPin className="h-4 w-4" />} title="Service Locations" items={vendor.serviceAreas} chip />
              <DetailGroup icon={<ShieldCheck className="h-4 w-4" />} title="Certifications" items={vendor.certifications} />
              <DetailGroup icon={<Globe className="h-4 w-4" />} title="Languages" items={vendor.languages} chip />
            </CardContent>
          </Card>
        </div>

        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Client Reviews</CardTitle>
              <CardDescription>Recent feedback from agents and clients.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button>Contact Vendor</Button>
              <Button variant="outline">Request Availability</Button>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vendor.reviews.map((review) => (
              <div key={`${review.name}-${review.comment}`} className="rounded-xl border border-border bg-muted/40 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">{review.name}</p>
                  <div className="flex items-center gap-1 text-yellow-500">
                    {Array.from({ length: review.rating }).map((_, idx) => (
                      <Star key={idx} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-500" />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{review.role}</p>
                <p className="text-sm mt-2 text-muted-foreground">{review.comment}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <ChatbotFab
        title="Vendor Concierge"
        placeholder={`Ask about ${vendor.company} services, timeline, and availability`}
      />
    </DottedSurface>
  );
}

function InfoStat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="border-border bg-card shadow-sm">
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold mt-1 text-primary">{value}</p>
      </CardContent>
    </Card>
  );
}

function DetailGroup({
  icon,
  title,
  items,
  chip = false,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
  chip?: boolean;
}) {
  return (
    <div>
      <p className="text-sm font-medium mb-2 flex items-center gap-2">
        {icon} {title}
      </p>
      {chip ? (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <Badge key={item} variant="secondary" className="bg-primary/10 border-primary/20 text-primary">
              {item}
            </Badge>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item} className="rounded-lg border border-border bg-muted/40 p-3 text-sm">
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
