import { useState } from "react";
import { MapPin, Search, Check, Navigation, Loader2 } from "lucide-react";
import { BD_DISTRICTS, District } from "@/lib/bdDistricts";
import { useSelectedDistrict } from "@/hooks/useLocationStore";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

/** Find nearest district from GPS coordinates */
const findNearestDistrict = (lat: number, lng: number): District => {
  let nearest = BD_DISTRICTS[0];
  let minDist = Infinity;
  for (const d of BD_DISTRICTS) {
    const dist = Math.sqrt((d.lat - lat) ** 2 + (d.lng - lng) ** 2);
    if (dist < minDist) { minDist = dist; nearest = d; }
  }
  return nearest;
};

const LocationPicker = () => {
  const [district, setDistrict] = useSelectedDistrict();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [detecting, setDetecting] = useState(false);

  const filtered = search
    ? BD_DISTRICTS.filter((d) => d.name.includes(search))
    : BD_DISTRICTS;

  const handleSelect = (d: District) => {
    setDistrict(d);
    setOpen(false);
    setSearch("");
  };

  const handleAutoDetect = () => {
    if (!navigator.geolocation) {
      toast.error("আপনার ব্রাউজার লোকেশন সাপোর্ট করে না");
      return;
    }
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const nearest = findNearestDistrict(pos.coords.latitude, pos.coords.longitude);
        setDistrict(nearest);
        setDetecting(false);
        setOpen(false);
        toast.success(`লোকেশন সনাক্ত: ${nearest.name}`);
      },
      () => {
        setDetecting(false);
        toast.error("লোকেশন অনুমতি দিন অথবা ম্যানুয়ালি সিলেক্ট করুন");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-1 text-xs hover:text-accent transition-colors cursor-pointer">
          <MapPin size={13} />
          <span className="max-w-[80px] truncate">{district.name}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="end">
        {/* Auto detect button */}
        <Button
          variant="outline"
          size="sm"
          className="w-full mb-2 text-xs gap-1.5"
          onClick={handleAutoDetect}
          disabled={detecting}
        >
          {detecting ? <Loader2 size={13} className="animate-spin" /> : <Navigation size={13} />}
          {detecting ? "সনাক্ত করা হচ্ছে..." : "অটো লোকেশন সনাক্ত করুন"}
        </Button>

        <div className="relative mb-2">
          <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="জেলা খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-7 h-8 text-sm"
          />
        </div>
        <ScrollArea className="h-[280px]">
          <div className="grid grid-cols-2 gap-0.5">
            {filtered.map((d) => (
              <button
                key={d.name}
                onClick={() => handleSelect(d)}
                className={`text-left text-xs px-2 py-1.5 rounded hover:bg-accent/10 transition-colors flex items-center gap-1 ${
                  district.name === d.name ? "bg-primary/10 text-primary font-semibold" : ""
                }`}
              >
                {district.name === d.name && <Check size={10} />}
                {d.name}
              </button>
            ))}
          </div>
          {filtered.length === 0 && (
            <p className="text-center text-xs text-muted-foreground py-4">কোনো জেলা পাওয়া যায়নি</p>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default LocationPicker;
