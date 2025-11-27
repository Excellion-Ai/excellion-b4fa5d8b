import { Card } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import portfolioLakeReflections from "@/assets/portfolio-lake-reflections.png";

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
      title: "Project 2",
      description: "Modern design with advanced features and functionality",
      url: "#",
      image: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=800&h=600&fit=crop"
    },
    {
      id: 3,
      title: "Project 3",
      description: "Elegant solution built for business growth",
      url: "#",
      image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&fit=crop"
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
                <div className="aspect-video overflow-hidden bg-muted">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
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
