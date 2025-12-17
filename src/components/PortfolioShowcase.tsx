import { Card } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import portfolioLakeReflections from "@/assets/portfolio-lake-reflections.png";
import portfolioRightTimeAuto from "@/assets/portfolio-right-time-auto.png";
import portfolioCsCollection from "@/assets/portfolio-cs-collection.png";

const PortfolioShowcase = () => {
  const projects = [
    {
      id: 1,
      title: "C's Fast Cash Collection Buyouts",
      description: "",
      url: "https://cscollectionbuyouts.com/",
      image: portfolioCsCollection
    },
    {
      id: 2,
      title: "Right Time Auto",
      description: "",
      url: "https://righttimeauto.com/",
      image: portfolioRightTimeAuto
    },
    {
      id: 3,
      title: "Lake Reflections Detailing",
      description: "",
      url: "https://lakereflectionsdetailing.com/",
      image: portfolioLakeReflections
    }
  ];

  return (
    <section id="portfolio-showcase" className="py-24 px-4 bg-background relative" aria-labelledby="portfolio-heading">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-16">
          <h2 id="portfolio-heading" className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Websites We've Built
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Take a look at real websites we've designed and launched for small businesses. Each build is tailored to the brand, goals, and budget.
          </p>
        </header>

        <ul className="grid grid-cols-1 md:grid-cols-3 gap-8 list-none p-0" role="list">
          {projects.map((project) => (
            <li key={project.id}>
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
                aria-label={`View ${project.title} website (opens in new tab)`}
              >
                <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/20">
                  <div className="aspect-video overflow-hidden bg-muted relative">
                    <img
                      src={project.image}
                      alt={`Screenshot of ${project.title} website homepage`}
                      loading="lazy"
                      decoding="async"
                      width="800"
                      height="450"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      style={{ 
                        objectPosition: 'left center',
                        transform: 'scale(1.02)',
                        marginLeft: '-1%'
                      }}
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                        {project.title}
                      </h3>
                      <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" aria-hidden="true" />
                    </div>
                    {project.description && (
                      <p className="text-muted-foreground text-sm">
                        {project.description}
                      </p>
                    )}
                  </div>
                </Card>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default PortfolioShowcase;
