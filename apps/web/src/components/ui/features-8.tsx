import { Card, CardContent } from "@/components/ui/card";
import { Shield, Users, Building2, TrendingUp } from "lucide-react";

export function Features() {
  const items = [
    {
      icon: <Shield className="h-5 w-5" />,
      title: "Broker Governance",
      description: "Compliance, risk controls, and deal oversight built into daily workflows.",
      stat: "99.2%",
      label: "SLA compliance",
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: "Agent Productivity",
      description: "Track team velocity, active pipelines, and conversion performance in one view.",
      stat: "3.4x",
      label: "Pipeline velocity",
    },
    {
      icon: <Building2 className="h-5 w-5" />,
      title: "Portfolio Coverage",
      description: "Residential, commercial, rentals, and new development visibility by market.",
      stat: "42",
      label: "Active territories",
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      title: "Growth Intelligence",
      description: "Forecast targets, identify expansion opportunities, and benchmark brokerage performance.",
      stat: "+16.8%",
      label: "YoY growth",
    },
  ];

  return (
    <section className="py-12 md:py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <Card key={item.title} className="border-primary/20 bg-gradient-to-br from-background via-primary/5 to-background/90">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {item.icon}
                  </span>
                  <div className="text-right">
                    <p className="text-xl font-bold">{item.stat}</p>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                  </div>
                </div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
