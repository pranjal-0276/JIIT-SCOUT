import { useEffect, useMemo, useState } from "react";
import { CampusMap } from "@/components/CampusMap";
import { supabase } from "@/integrations/supabase/client";
import type { Location } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navigation, Search } from "lucide-react";

function haversine(a: Location, b: Location) {
  const R = 6371000;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

function bearing(a: Location, b: Location) {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const toDeg = (x: number) => (x * 180) / Math.PI;
  const dLon = toRad(b.longitude - a.longitude);
  const y = Math.sin(dLon) * Math.cos(toRad(b.latitude));
  const x =
    Math.cos(toRad(a.latitude)) * Math.sin(toRad(b.latitude)) -
    Math.sin(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.cos(dLon);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

function compass(b: number) {
  const dirs = ["north", "north-east", "east", "south-east", "south", "south-west", "west", "north-west"];
  return dirs[Math.round(b / 45) % 8];
}

const MapPage = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  useEffect(() => {
    supabase.from("locations").select("*").order("name").then(({ data }) => {
      if (data) setLocations(data as Location[]);
    });
  }, []);

  const filtered = useMemo(
    () => locations.filter((l) => l.name.toLowerCase().includes(search.toLowerCase())),
    [locations, search]
  );

  const route = useMemo(() => {
    const a = locations.find((l) => l.id === from);
    const b = locations.find((l) => l.id === to);
    return a && b ? [a, b] : [];
  }, [from, to, locations]);

  const directions = useMemo(() => {
    if (route.length !== 2) return [];
    const [a, b] = route;
    const dist = Math.round(haversine(a, b));
    const dir = compass(bearing(a, b));
    return [
      `Start at ${a.name}.`,
      `Head ${dir} for approximately ${dist} meters.`,
      `Arrive at ${b.name}.`,
    ];
  }, [route]);

  return (
    <div className="container py-8 grid gap-6 lg:grid-cols-[360px_1fr]">
      <div className="space-y-4">
        <Card className="p-4 space-y-3">
          <h2 className="font-semibold flex items-center gap-2"><Navigation className="h-4 w-4 text-primary" /> Plan a Route</h2>
          <Select value={from} onValueChange={setFrom}>
            <SelectTrigger><SelectValue placeholder="From..." /></SelectTrigger>
            <SelectContent>
              {locations.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={to} onValueChange={setTo}>
            <SelectTrigger><SelectValue placeholder="To..." /></SelectTrigger>
            <SelectContent>
              {locations.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
            </SelectContent>
          </Select>
          {directions.length > 0 && (
            <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground pt-2">
              {directions.map((d, i) => <li key={i}>{d}</li>)}
            </ol>
          )}
          {(from || to) && (
            <Button variant="ghost" size="sm" onClick={() => { setFrom(""); setTo(""); }}>Clear route</Button>
          )}
        </Card>

        <Card className="p-4 space-y-3">
          <h2 className="font-semibold flex items-center gap-2"><Search className="h-4 w-4 text-primary" /> Search</h2>
          <Input placeholder="Search locations..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <div className="max-h-72 overflow-auto space-y-1">
            {filtered.map((l) => (
              <button
                key={l.id}
                onClick={() => setTo(l.id)}
                className="w-full text-left rounded-md px-3 py-2 text-sm hover:bg-secondary transition-colors"
              >
                <div className="font-medium">{l.name}</div>
                <div className="text-xs text-muted-foreground">{l.category}</div>
              </button>
            ))}
          </div>
        </Card>
      </div>

      <CampusMap locations={locations} route={route} height="calc(100vh - 12rem)" onSelect={(l) => setTo(l.id)} />
    </div>
  );
};

export default MapPage;