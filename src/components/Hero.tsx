import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import student1 from "@/assets/student-1.jpg";
import student2 from "@/assets/student-2.jpg";
import student3 from "@/assets/student-3.jpg";
import student4 from "@/assets/student-4.jpg";
import student5 from "@/assets/student-5.jpg";
import student6 from "@/assets/student-6.jpg";
import rtbLogo from "@/assets/rtb-logo.png";
import ioaLogo from "@/assets/institute-of-analytics.png";

const Hero = () => {
  const navigate = useNavigate();

  const students = [
    { src: student1, alt: "Students learning in a modern workspace" },
    { src: student2, alt: "Professional mentorship session" },
    { src: student3, alt: "Group collaboration workshop" },
    { src: student4, alt: "Team working on a project together" },
    { src: student5, alt: "Students discussing ideas at Global Nexus Institute" },
    { src: student6, alt: "Diverse group of learners collaborating" },
  ];

  return (
    <section className="relative min-h-[90vh] overflow-hidden" aria-labelledby="main-heading" role="banner">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent/80" />
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:48px_48px]" />
      {/* Radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-accent/20 rounded-full blur-[120px]" />

      <div className="container relative z-10 px-4 py-20 md:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 backdrop-blur-sm px-4 py-1.5 text-sm text-primary-foreground/90 mb-8 animate-fade-in">
            <Sparkles className="h-4 w-4" />
            Africa's Premier Online Learning Platform
          </div>

          <h1 className="mb-6 font-display text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-primary-foreground animate-fade-in" id="main-heading" style={{ animationDelay: "0.05s" }}>
            Master and Monetize Skills.
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-primary-foreground/85 sm:text-xl animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Learn Job-Ready Skills. Monetize Your Professional Experience. Join thousands of Africans building careers that matter.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: "0.15s" }}>
            <Button
              size="lg"
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 text-base font-semibold px-8 py-6 h-auto shadow-xl hover:shadow-2xl transition-all hover:scale-105"
              onClick={() => navigate("/programs")}
            >
              Explore Programs
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 text-base font-semibold px-8 py-6 h-auto backdrop-blur-sm"
              onClick={() => navigate("/become-instructor")}
            >
              Create & Sell Course
            </Button>
          </div>
        </div>

        {/* Student image grid */}
        <div className="mt-20 md:mt-28" aria-label="Our students" role="region">
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-6" role="list" aria-label="Student photos">
              {students.map((student, index) => (
                <div
                  key={index}
                  role="listitem"
                  className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-primary-foreground/10 backdrop-blur-sm animate-fade-in ring-1 ring-primary-foreground/10"
                  style={{ animationDelay: `${0.2 + index * 0.08}s` }}
                >
                  <img src={student.src} alt={student.alt} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Accreditation badges */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-10 border-t border-primary-foreground/15 pt-12" role="region" aria-label="Accreditation partners">
          {[
            { logo: rtbLogo, alt: "Rwanda TVET Board logo", title: "Accredited by RTB", sub: "Rwanda TVET Board" },
            { logo: ioaLogo, alt: "Institute of Analytics logo", title: "Endorsed by Institute of Analytics", sub: "Professional Recognition" },
          ].map((badge, i) => (
            <div key={i} className="flex items-center gap-4 text-sm text-primary-foreground/80">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-foreground p-2 shadow-lg">
                <img src={badge.logo} alt={badge.alt} className="h-full w-full object-contain" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-primary-foreground">{badge.title}</div>
                <div className="text-xs text-primary-foreground/70">{badge.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
