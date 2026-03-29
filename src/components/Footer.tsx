import { Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";
import { Link } from "react-router-dom";
import gniLogo from "@/assets/gni-logo.png";

const Footer = () => {
  const schoolsCol1 = ["Data Engineering", "Product & Innovation", "Data & Analytics"];
  const schoolsCol2 = ["Business Studies", "Digital & Creative Media", "Languages & Comms"];
  const companyLinks = ["About Us", "Career"];
  const resourcesLinks = ["FAQs", "Scholarship", "Terms of Service"];
  const socialLinks = [
    { Icon: Facebook, href: "https://www.facebook.com/p/Global-Nexus-Institute-61560364154598/", label: "Facebook" },
    { Icon: Twitter, href: "https://x.com/GlobalNexusInt", label: "Twitter" },
    { Icon: Instagram, href: "https://www.instagram.com/globalnexusinstitute/", label: "Instagram" },
    { Icon: Linkedin, href: "https://www.linkedin.com/company/global-nexus-institute/?viewAsMember=true", label: "LinkedIn" },
    { Icon: Youtube, href: "https://www.youtube.com/@Global_Nexus_Institute", label: "YouTube" },
  ];

  return (
    <footer className="bg-foreground text-background" role="contentinfo">
      <div className="container px-4 py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="mb-5">
              <img src={gniLogo} alt="Global Nexus Institute" className="h-14 w-auto bg-background rounded-xl p-2" />
            </div>
            <p className="text-sm font-medium text-background/80 mb-5">Learn. Build. Get Hired.</p>
            <div className="flex gap-3" role="list" aria-label="Social media links">
              {socialLinks.map(({ Icon, href, label }, index) => (
                <a
                  key={index}
                  href={href}
                  className="p-2 rounded-lg bg-background/10 text-background/70 hover:bg-background/20 hover:text-background transition-all"
                  aria-label={`Visit our ${label} page`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Schools */}
          <div className="lg:col-span-2">
            <h4 className="font-display font-semibold mb-4 text-background">Schools</h4>
            <div className="grid grid-cols-2 gap-x-8">
              <ul className="space-y-2.5">
                {schoolsCol1.map((link, i) => (
                  <li key={i}>
                    <a href="#" className="text-sm text-background/60 hover:text-background transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
              <ul className="space-y-2.5">
                {schoolsCol2.map((link, i) => (
                  <li key={i}>
                    <a href="#" className="text-sm text-background/60 hover:text-background transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-display font-semibold mb-4 text-background">Company</h4>
            <ul className="space-y-2.5">
              {companyLinks.map((link, i) => (
                <li key={i}>
                  <a href="#" className="text-sm text-background/60 hover:text-background transition-colors">{link}</a>
                </li>
              ))}
              <li>
                <Link to="/collaborate" className="text-sm text-background/60 hover:text-background transition-colors">Collaborate with us</Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-display font-semibold mb-4 text-background">Resources</h4>
            <ul className="space-y-2.5">
              {resourcesLinks.map((link, i) => (
                <li key={i}>
                  <a href="#" className="text-sm text-background/60 hover:text-background transition-colors">{link}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-background/10">
          <p className="text-center text-sm text-background/50">© 2026 Global Nexus Institute. All rights reserved. / info@globalnexus.africa</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
