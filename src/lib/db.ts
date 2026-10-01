import type { Item, SiteSettings } from "./types";
import { site } from "./site";

const ITEMS_KEY = "tpl-items-v1";
const SETTINGS_KEY = "tpl-settings-v1";

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full/blocked — memory fallback below keeps the session working
    mem.set(key, value);
  }
}

const mem = new Map<string, unknown>();

function readMem<T>(key: string, fallback: T): T {
  if (mem.has(key)) return mem.get(key) as T;
  return read<T>(key, fallback);
}

const defaultSettings = (): SiteSettings => ({
  companyName: `${site.name} ${site.accent}`,
  contactEmail: site.email,
  footerText: site.footer,
  updatedAt: new Date().toISOString(),
});

function seed(): void {
  if (read<Item[]>(ITEMS_KEY, []).length > 0) return;
  const now = new Date().toISOString();
  write(ITEMS_KEY, [
    {
      id: "seed_1",
      title: "Welcome aboard",
      details: "This is a seeded example item. Edit it, toggle its status, duplicate it, or delete it — everything runs locally in your browser.",
      status: "open",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "seed_2",
      title: "Rebrand the template",
      details: "Open src/lib/site.ts and make it yours: name, accent, email, footer.",
      status: "open",
      createdAt: now,
      updatedAt: now,
    },
  ] as Item[]);
}

/** Local-first store. Same function names as the server version —
 *  point these at a real API later without touching pages. */
export const db = {
  listItems(): Item[] {
    seed();
    return readMem<Item[]>(ITEMS_KEY, []).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  getItem(id: string): Item | null {
    return this.listItems().find((x) => x.id === id) ?? null;
  },
  saveItem(item: Item): Item {
    const all = readMem<Item[]>(ITEMS_KEY, []);
    const i = all.findIndex((x) => x.id === item.id);
    if (i >= 0) all[i] = item;
    else all.push(item);
    write(ITEMS_KEY, all);
    return item;
  },
  deleteItem(id: string): void {
    write(ITEMS_KEY, readMem<Item[]>(ITEMS_KEY, []).filter((x) => x.id !== id));
  },
  getSettings(): SiteSettings {
    return readMem<SiteSettings>(SETTINGS_KEY, defaultSettings());
  },
  saveSettings(s: SiteSettings): SiteSettings {
    write(SETTINGS_KEY, s);
    return s;
  },
};

export function newId(prefix = "itm_"): string {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}
