import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Code, Database, Briefcase, Palette, TrendingUp, ArrowRight, Cpu } from "lucide-react";
import { Link } from "react-router-dom";

const SchoolsSection = () => {
  const schools = [
    { name: "Data Engineering", slug: "engineering", description: "Master software development, cloud computing, and cybersecurity", icon: Code, accent: "bg-blue-500" },
    { name: "Data & Analytics", slug: "data", description: "Learn data science, analytics, and machine learning", icon: Database, accent: "bg-emerald-500" },
    { name: "Business Studies", slug: "business", description: "Develop skills in management, sales, and entrepreneurship", icon: Briefcase, accent: "bg-purple-500" },
    { name: "Product & Innovation", slug: "product", description: "Drive innovation through product strategy and design thinking", icon: TrendingUp, accent: "bg-orange-500" },
    { name: "Digital & Creative Media", slug: "creative-economy", description: "Master digital storytelling, media production, and creative technologies", icon: Palette, accent: "bg-rose-500" },
    { name: "Languages & Comms", slug: "computing", description: "Build fluency in languages, professional communication, and cross-cultural skills", icon: Cpu, accent: "bg-indigo-500" },
  ];

  return (
    <section id="schools" aria-labelledby="schools-heading" className="py-16 md:py-24 bg-muted/40">
      <div className="container px-4">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <p className="text-sm font-semibold text-primary tracking-wider uppercase mb-3">Departments</p>
          <h2 id="schools-heading" className="font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4 text-foreground">
            Our Schools
          </h2>
          <p className="text-lg text-muted-foreground">
            We ensure that Africans interested in exploring various occupations can readily access the resources they need
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto" role="list" aria-label="Available schools">
          {schools.map((school, index) => {
            const Icon = school.icon;
            return (
              <Card
                key={index}
                role="listitem"
                className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl border border-border/60 animate-fade-in bg-card"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <CardHeader className="pb-2">
                  <div className={`inline-flex p-3 rounded-xl ${school.accent} text-primary-foreground mb-4 w-fit shadow-sm`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="font-display text-xl mb-1">{school.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-5 leading-relaxed">{school.description}</p>
                  <Button variant="ghost" className="group/btn p-0 h-auto font-semibold text-primary hover:text-primary/80" asChild>
                    <Link to={`/schools/${school.slug}`}>
                      Explore Courses
                      <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SchoolsSection;
