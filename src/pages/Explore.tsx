import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Location } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { PanoramaViewer } from "@/components/PanoramaViewer";
import { Compass, ImageOff } from "lucide-react";

const DEMO_PANO = "https://pannellum.org/images/cerro-toco-0.jpg";

const Explore = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [active, setActive] = useState<Location | null>(null);

  useEffect(() => {
    supabase.from("locations").select("*").order("name").then(({ data }) => {
      if (data) {
        setLocations(data as Location[]);
        if (data[0]) setActive(data[0] as Location);
      }
    });
  }, []);

  const panoramaUrl = active?.panorama_url || DEMO_PANO;

  return (
    <div className="container py-8 grid gap-6 lg:grid-cols-[300px_1fr]">
      <div className="space-y-2">
        <h2 className="font-semibold mb-3 flex items-center gap-2">
          <Compass className="h-4 w-4 text-primary" /> Locations
        </h2>
        <div className="space-y-2 max-h-[calc(100vh-14rem)] overflow-auto pr-1">
          {locations.map((l) => (
            <button
              key={l.id}
              onClick={() => setActive(l)}
              className={`w-full text-left rounded-lg border p-3 transition-all ${
                active?.id === l.id ? "border-primary bg-primary/5 shadow-card" : "border-border hover:border-primary/50"
              }`}
            >
              <div className="font-medium text-sm">{l.name}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                {l.panorama_url ? "360° available" : <><ImageOff className="h-3 w-3" /> demo view</>}
              </div>
            </button>
          ))}
        </div>
      </div>

      <Card className="overflow-hidden p-0 h-[calc(100vh-12rem)]">
        {active && (
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-lg">{active.name}</h3>
              {active.description && <p className="text-sm text-muted-foreground">{active.description}</p>}
            </div>
            <div className="flex-1 p-3">
              <PanoramaViewer imageUrl={panoramaUrl} title={active.name} />
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Explore;