import { Card } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import portfolioLakeReflections from "@/assets/portfolio-lake-reflections.png";
import portfolioRightTimeAuto from "@/assets/portfolio-right-time-auto.png";
import portfolioCsCollection from "@/assets/portfolio-cs-collection.png";

const PortfolioShowcase = () => {
  const projects = [
    {
      id: 1,
      title: "Lake Reflections Detailing",
      description: "",
      url: "https://lakereflectionsdetailing.com/",
      image: portfolioLakeReflections
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
      title: "C's Fast Cash Collection Buyouts",
      description: "",
      url: "https://cscollectionbuyouts.com/",
      image: portfolioCsCollection
    }
  ];

  return (
    <section className="py-24 px-4 bg-background relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Websites We've Built
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See how we've helped businesses establish their digital presence with custom-built websites
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {projects.map((project) => (
            <a
              key={project.id}
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/20">
                <div className="aspect-video overflow-hidden bg-muted relative">
                  <img
                    src={project.image}
                    alt={project.title}
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
                    <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  {project.description && (
                    <p className="text-muted-foreground text-sm">
                      {project.description}
                    </p>
                  )}
                </div>
              </Card>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PortfolioShowcase;
