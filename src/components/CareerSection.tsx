import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, FileText, Users, Target, ChevronDown } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const CareerSection = () => {
  const careerServices = [
    { icon: FileText, title: "Resume & Portfolio Review", description: "Get expert feedback on your resume and portfolio to stand out to employers." },
    { icon: Users, title: "Interview Preparation", description: "Practice with mock interviews and receive personalized coaching." },
    { icon: Target, title: "Job Matching", description: "Connect with hiring partners actively looking for talented graduates." },
    { icon: Briefcase, title: "Career Mentorship", description: "One-on-one guidance from experienced professionals in your field." },
  ];

  const stats = [
    { value: "300+", label: "Alumni Trained" },
    { value: "40%", label: "Avg. Salary Increase" },
    { value: "20+", label: "Companies Using Skills" },
    { value: "90%", label: "Apply Skills at Work" },
  ];

  const openPositions = [
    { title: "Instructor", description: "Share your expertise by creating and teaching courses", path: "/become-instructor" },
    { title: "Content Reviewer", description: "Review and improve course content quality", path: "/become-instructor" },
    { title: "Course Moderator", description: "Moderate discussions and support students", path: "/become-instructor" },
  ];

  return (
    <section id="career" aria-labelledby="career-heading" className="py-16 md:py-24 bg-muted/40">
      <div className="container px-4">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <p className="text-sm font-semibold text-primary tracking-wider uppercase mb-3">Careers</p>
          <h2 id="career-heading" className="font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4 text-foreground">
            Career Support & Opportunities
          </h2>
          <p className="text-lg text-muted-foreground">We don't just teach you—we help you land your dream job</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-16 max-w-5xl mx-auto" role="list" aria-label="Career statistics">
          {stats.map((stat, index) => (
            <Card key={index} role="listitem" className="text-center border border-border/60 bg-card hover:shadow-lg transition-all animate-fade-in" style={{ animationDelay: `${index * 0.08}s` }}>
              <CardContent className="pt-8 pb-8">
                <div className="font-display text-4xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Services */}
        <div className="grid gap-5 md:grid-cols-2 max-w-4xl mx-auto mb-12">
          {careerServices.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card key={index} className="group border border-border/60 bg-card hover:shadow-xl transition-all duration-300 animate-fade-in" style={{ animationDelay: `${index * 0.08 + 0.3}s` }}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-primary/8 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="font-display text-lg">{service.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-relaxed">{service.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="lg" className="shadow-lg hover:shadow-xl transition-shadow">
                View Open Positions
                <ChevronDown className="ml-2 h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-72">
              {openPositions.map((position, index) => (
                <DropdownMenuItem key={index} asChild className="cursor-pointer">
                  <Link to={position.path} className="flex flex-col items-start py-3">
                    <span className="font-medium">{position.title}</span>
                    <span className="text-xs text-muted-foreground">{position.description}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </section>
  );
};

export default CareerSection;
