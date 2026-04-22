import { Link } from "react-router-dom";
import { Compass, MapPin, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const features = [
  { icon: MessageCircle, title: "Smart Chatbot", desc: "Ask 'where is the library?' and get instant answers with map locations." },
  { icon: MapPin, title: "Interactive Map", desc: "Browse the entire JIIT campus, search any location and get shortest paths." },
  { icon: Compass, title: "360° Tours", desc: "Step inside locations virtually with immersive panoramic views." },
  { icon: ShieldCheck, title: "Admin Panel", desc: "Manage all locations, upload 360° images, and update campus data." },
];

const Home = () => (
  <div>
    <section className="container py-16 md:py-24 text-center animate-fade-in">
      <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground mb-6 shadow-card">
        <Sparkles className="h-4 w-4 text-primary" />
        Smart Campus Navigation
      </div>
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-3xl mx-auto">
        Explore <span className="bg-gradient-primary bg-clip-text text-transparent">JIIT campus</span> like never before
      </h1>
      <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
        Find any building, get walking directions, chat with our assistant, and take immersive 360° virtual tours.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button asChild size="lg" className="bg-gradient-primary shadow-elegant">
          <Link to="/map">Open Campus Map</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link to="/chatbot">Ask the Assistant</Link>
        </Button>
      </div>
    </section>

    <section className="container pb-20 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {features.map((f) => (
        <Card key={f.title} className="p-6 shadow-card hover:shadow-elegant transition-all hover:-translate-y-1">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground mb-4">
            <f.icon className="h-5 w-5" />
          </div>
          <h3 className="font-semibold mb-1">{f.title}</h3>
          <p className="text-sm text-muted-foreground">{f.desc}</p>
        </Card>
      ))}
    </section>
  </div>
);

export default Home;