import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import type { Location } from "@/lib/types";
import { CampusMap } from "@/components/CampusMap";
import { Bot, Send, User } from "lucide-react";

type Msg = {
  role: "user" | "bot";
  text: string;
  highlight?: string;
  route?: Location[];
};

function detectIntent(text: string, locations: Location[]) {
  const lower = text.toLowerCase();
  // route: "from X to Y" / "X to Y"
  const routeMatch = lower.match(/(?:from\s+)?(.+?)\s+to\s+(.+)/);
  if (routeMatch) {
    const a = locations.find((l) => lower.includes(l.name.toLowerCase().split(" ")[0]) && lower.indexOf(l.name.toLowerCase().split(" ")[0]) < lower.indexOf("to"));
    const b = locations.find((l) => lower.includes(l.name.toLowerCase().split(" ")[0]) && lower.indexOf(l.name.toLowerCase().split(" ")[0]) > lower.indexOf("to"));
    // simpler: match by partial name
    const found = locations.filter((l) => lower.includes(l.name.toLowerCase()) || l.name.toLowerCase().split(" ").some((w) => w.length > 3 && lower.includes(w)));
    if (found.length >= 2) {
      return { type: "route" as const, from: found[0], to: found[1] };
    }
    if (a && b && a.id !== b.id) return { type: "route" as const, from: a, to: b };
  }
  // location lookup
  const found = locations.find((l) => lower.includes(l.name.toLowerCase()));
  if (found) return { type: "find" as const, location: found };
  const partial = locations.find((l) => l.name.toLowerCase().split(" ").some((w) => w.length > 3 && lower.includes(w)));
  if (partial) return { type: "find" as const, location: partial };
  // category
  const cats = ["library", "food", "cafeteria", "sports", "hostel", "auditorium", "academic"];
  for (const cat of cats) {
    if (lower.includes(cat)) {
      const match = locations.find((l) => l.category.includes(cat) || l.name.toLowerCase().includes(cat));
      if (match) return { type: "find" as const, location: match };
    }
  }
  if (/hi|hello|hey/.test(lower)) return { type: "greet" as const };
  if (/list|all|locations|show/.test(lower)) return { type: "list" as const };
  return { type: "unknown" as const };
}

const Chatbot = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "bot", text: "Hi! I'm Scout 👋 Ask me things like 'Where is the library?' or 'Route from Main Gate to Cafeteria'." },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.from("locations").select("*").then(({ data }) => data && setLocations(data as Location[]));
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    const userMsg: Msg = { role: "user", text: input };
    const intent = detectIntent(input, locations);
    let botMsg: Msg;
    switch (intent.type) {
      case "find":
        botMsg = {
          role: "bot",
          text: `📍 ${intent.location.name} — ${intent.location.description ?? "Located on campus."} I've highlighted it on the map below.`,
          highlight: intent.location.id,
        };
        break;
      case "route":
        botMsg = {
          role: "bot",
          text: `🧭 Route from ${intent.from.name} to ${intent.to.name}. Follow the blue line on the map.`,
          route: [intent.from, intent.to],
        };
        break;
      case "list":
        botMsg = { role: "bot", text: `Here are all locations:\n• ${locations.map((l) => l.name).join("\n• ")}` };
        break;
      case "greet":
        botMsg = { role: "bot", text: "Hello! How can I help you navigate the campus today?" };
        break;
      default:
        botMsg = {
          role: "bot",
          text: "I'm not sure I got that. Try 'where is library', 'show cafeteria', or 'route from main gate to sports complex'.",
        };
    }
    setMessages((m) => [...m, userMsg, botMsg]);
    setInput("");
  };

  const lastVisual = [...messages].reverse().find((m) => m.highlight || m.route);

  return (
    <div className="container py-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
      <Card className="flex flex-col h-[calc(100vh-12rem)]">
        <div className="border-b border-border p-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="font-semibold">Scout Assistant</div>
            <div className="text-xs text-muted-foreground">Always online</div>
          </div>
        </div>
        <div ref={scrollRef} className="flex-1 overflow-auto p-4 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              {m.role === "bot" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap ${
                  m.role === "user" ? "bg-gradient-primary text-primary-foreground" : "bg-secondary"
                }`}
              >
                {m.text}
              </div>
              {m.role === "user" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-4 w-4 text-primary" />
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="border-t border-border p-4 flex gap-2">
          <Input
            placeholder="Ask anything about the campus..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
          />
          <Button onClick={send} className="bg-gradient-primary"><Send className="h-4 w-4" /></Button>
        </div>
      </Card>

      <div className="h-[calc(100vh-12rem)]">
        <CampusMap
          locations={locations}
          highlightId={lastVisual?.highlight}
          route={lastVisual?.route}
          height="100%"
        />
      </div>
    </div>
  );
};

export default Chatbot;