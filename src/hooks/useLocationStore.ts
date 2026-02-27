import { useState, useEffect, useCallback } from "react";
import { BD_DISTRICTS, District } from "@/lib/bdDistricts";

const STORAGE_KEY = "selected_district";
const DEFAULT_DISTRICT = BD_DISTRICTS[0]; // ঢাকা

function getStored(): District {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.name && parsed.lat && parsed.lng) return parsed;
    }
  } catch {}
  return DEFAULT_DISTRICT;
}

// Simple global state with listeners
let currentDistrict = getStored();
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((fn) => fn());
}

export function setSelectedDistrict(d: District) {
  currentDistrict = d;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
  notify();
}

export function getSelectedDistrict(): District {
  return currentDistrict;
}

export function useSelectedDistrict(): [District, (d: District) => void] {
  const [district, setLocal] = useState(currentDistrict);

  useEffect(() => {
    const handler = () => setLocal(currentDistrict);
    listeners.add(handler);
    return () => { listeners.delete(handler); };
  }, []);

  const set = useCallback((d: District) => {
    setSelectedDistrict(d);
  }, []);

  return [district, set];
}
