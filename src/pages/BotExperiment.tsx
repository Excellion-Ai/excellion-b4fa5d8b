import { Helmet } from "react-helmet-async";

const BotExperiment = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">Bot Experiment</h1>
        <p className="text-muted-foreground">This is the bot experiment page.</p>
      </div>
    </div>
  );
};

export default BotExperiment;
