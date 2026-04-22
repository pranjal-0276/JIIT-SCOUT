import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { Location } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Pencil, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

type FormState = Partial<Location> & { panoFile?: File | null };

const empty: FormState = { name: "", category: "general", latitude: 28.602, longitude: 77.361, description: "", panorama_url: "" };

const Admin = () => {
  const { user, isAdmin, loading } = useAuth();
  const [locations, setLocations] = useState<Location[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);

  const refresh = async () => {
    const { data } = await supabase.from("locations").select("*").order("name");
    if (data) setLocations(data as Location[]);
  };

  useEffect(() => {
    if (isAdmin) refresh();
  }, [isAdmin]);

  if (loading) return <div className="container py-8">Loading...</div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <div className="container py-8">You need admin access.</div>;

  const openNew = () => { setForm(empty); setOpen(true); };
  const openEdit = (l: Location) => { setForm(l); setOpen(true); };

  const save = async () => {
    if (!form.name || form.latitude == null || form.longitude == null) {
      return toast.error("Name, latitude and longitude required");
    }
    setSaving(true);
    let panorama_url = form.panorama_url || null;

    if (form.panoFile) {
      const path = `${Date.now()}-${form.panoFile.name.replace(/[^a-z0-9.\-_]/gi, "_")}`;
      const { error: upErr } = await supabase.storage.from("panoramas").upload(path, form.panoFile);
      if (upErr) {
        setSaving(false);
        return toast.error(upErr.message);
      }
      const { data } = supabase.storage.from("panoramas").getPublicUrl(path);
      panorama_url = data.publicUrl;
    }

    const payload = {
      name: form.name!,
      category: form.category || "general",
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
      description: form.description || null,
      panorama_url,
    };

    const { error } = form.id
      ? await supabase.from("locations").update(payload).eq("id", form.id)
      : await supabase.from("locations").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(form.id ? "Updated" : "Created");
    setOpen(false);
    refresh();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this location?")) return;
    const { error } = await supabase.from("locations").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    refresh();
  };

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Campus Locations</h1>
          <p className="text-sm text-muted-foreground">Manage all locations and 360° panoramas.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew} className="bg-gradient-primary"><Plus className="h-4 w-4 mr-1" /> New Location</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{form.id ? "Edit" : "New"} Location</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Name</Label><Input value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Category</Label><Input value={form.category ?? ""} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Latitude</Label><Input type="number" step="any" value={form.latitude ?? ""} onChange={(e) => setForm({ ...form, latitude: parseFloat(e.target.value) })} /></div>
                <div><Label>Longitude</Label><Input type="number" step="any" value={form.longitude ?? ""} onChange={(e) => setForm({ ...form, longitude: parseFloat(e.target.value) })} /></div>
              </div>
              <div><Label>Description</Label><Textarea value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div>
                <Label className="flex items-center gap-2"><Upload className="h-4 w-4" /> 360° Panorama (equirectangular JPG)</Label>
                <Input type="file" accept="image/*" onChange={(e) => setForm({ ...form, panoFile: e.target.files?.[0] ?? null })} />
                {form.panorama_url && <p className="text-xs text-muted-foreground mt-1 truncate">Current: {form.panorama_url}</p>}
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={save} disabled={saving} className="bg-gradient-primary">{saving ? "Saving..." : "Save"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {locations.map((l) => (
          <Card key={l.id} className="p-4 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold">{l.name}</div>
                <div className="text-xs text-primary uppercase">{l.category}</div>
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => openEdit(l)}><Pencil className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => remove(l.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </div>
            {l.description && <p className="text-sm text-muted-foreground line-clamp-2">{l.description}</p>}
            <div className="text-xs text-muted-foreground">{l.latitude.toFixed(5)}, {l.longitude.toFixed(5)}</div>
            {l.panorama_url && <div className="text-xs text-success">✓ 360° image</div>}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Admin;