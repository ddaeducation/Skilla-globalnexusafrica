import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Video, Award, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PathwaysSection = () => {
  const navigate = useNavigate();
  const pathways = [
    {
      title: "Short-Course",
      description: "Self-paced programs that let you go deeper into a focused skill. Earn recognized certificates to boost your profile and prove your expertise.",
      duration: "4–8 weeks (flexible, self-paced)",
      format: "Online with recorded lectures",
      certification: "Global Nexus Institute Short-Course certificate",
      icon: Clock,
      accent: "bg-blue-500",
      route: "Short-Course",
      programs: [],
    },
    {
      title: "Professional",
      description: "A comprehensive, instructor-led program with community and mentorship support. In 3-12 months, you'll master a new career path and open global opportunities.",
      duration: "3-12 months (flexible, self-paced)",
      format: "Live classes + recorded lectures",
      certification: "Global Nexus Institute Professional certificate",
      icon: Video,
      accent: "bg-purple-500",
      route: "Professional",
      programs: [],
    },
    {
      title: "Masterclass",
      description: "Bite-sized sessions on practical topics to give you quick wins in your career. Perfect for busy professionals who want immediate results.",
      duration: "2-7 hours",
      format: "Physical/Online, Live Sessions",
      certification: "Masterclass certification",
      icon: Award,
      accent: "bg-accent",
      route: "masterclass",
      programs: [],
    },
  ];

  return (
    <section id="pathways" aria-labelledby="pathways-heading" className="py-12 sm:py-16 md:py-24 bg-background">
      <div className="container px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center mb-8 sm:mb-12 md:mb-16">
          <p className="text-xs sm:text-sm font-semibold text-primary tracking-wider uppercase mb-2 sm:mb-3">Learning Paths</p>
          <h2 id="pathways-heading" className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3 sm:mb-4 text-foreground">
            A Path for Every Learner
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground">Students! Professionals! Career Switchers!</p>
        </div>

        <div className="grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto" role="list" aria-label="Learning pathways">
          {pathways.map((pathway, index) => {
            const Icon = pathway.icon;
            return (
              <Card
                key={index}
                role="listitem"
                className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl border border-border/60 animate-fade-in bg-card last:sm:col-span-2 last:lg:col-span-1 last:sm:max-w-md last:sm:mx-auto last:lg:max-w-none"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`absolute top-0 left-0 right-0 h-1 ${pathway.accent}`} aria-hidden="true" />
                <CardHeader className="pb-2 sm:pb-3 p-4 sm:p-6">
                  <div className="flex items-center gap-2.5 sm:gap-3 mb-1.5 sm:mb-2">
                    <div className={`p-2 sm:p-2.5 rounded-xl ${pathway.accent} text-primary-foreground shadow-sm`}>
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <CardTitle className="font-display text-lg sm:text-xl">{pathway.title}</CardTitle>
                  </div>
                  <CardDescription className="text-xs sm:text-sm leading-relaxed">{pathway.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 p-4 pt-0 sm:p-6 sm:pt-0">
                  <div className="space-y-2 sm:space-y-2.5">
                    {[
                      { icon: Clock, text: pathway.duration },
                      { icon: Video, text: pathway.format },
                      { icon: Award, text: pathway.certification },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-2 sm:gap-2.5 text-xs sm:text-sm">
                        <item.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mt-0.5 text-muted-foreground/70 flex-shrink-0" />
                        <span className="text-muted-foreground">{item.text}</span>
                      </div>
                    ))}
                  </div>

                  {pathway.programs.length > 0 && (
                    <div className="pt-3 sm:pt-4 border-t border-border/60">
                      <h4 className="text-xs sm:text-sm font-semibold mb-2 sm:mb-3">Available Programs:</h4>
                      <ul className="space-y-1.5 sm:space-y-2">
                        {pathway.programs.map((program, idx) => (
                          <li key={idx} className="text-xs sm:text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>{program}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    size="default"
                    className="w-full mt-3 sm:mt-4 text-sm group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
                    onClick={() => navigate(`/programs/${pathway.route}`)}
                  >
                    Learn More
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
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

export default PathwaysSection;
