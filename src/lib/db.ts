import { promises as fs } from "fs";
import path from "path";
import type { Item, SiteSettings } from "./types";
import { site } from "./site";

const DATA_DIR = process.env.VERCEL ? path.join("/tmp", "data") : path.join(process.cwd(), "data");

// Memory overlay: Vercel's filesystem is read-only, so disk writes can fail.
// The overlay keeps the API functional per instance instead of crashing.
const mem = new Map<string, unknown>();

async function readJson<T>(file: string, fallback: T): Promise<T> {
  if (mem.has(file)) return mem.get(file) as T;
  try {
    return JSON.parse(await fs.readFile(path.join(DATA_DIR, file), "utf8")) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(file: string, value: unknown): Promise<void> {
  mem.set(file, value);
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(path.join(DATA_DIR, file), JSON.stringify(value, null, 2), "utf8");
  } catch {
    // read-only (serverless): memory overlay serves reads
  }
}

const defaultSettings = (): SiteSettings => ({
  companyName: `${site.name} ${site.accent}`,
  contactEmail: site.email,
  footerText: site.footer,
  updatedAt: new Date().toISOString(),
});

export const db = {
  async listItems(): Promise<Item[]> {
    const all = await readJson<Item[]>("items.json", []);
    return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  async getItem(id: string): Promise<Item | null> {
    return ((await this.listItems()).find((x) => x.id === id) ?? null) as Item | null;
  },
  async saveItem(item: Item): Promise<Item> {
    const all = await readJson<Item[]>("items.json", []);
    const i = all.findIndex((x) => x.id === item.id);
    if (i >= 0) all[i] = item;
    else all.push(item);
    await writeJson("items.json", all);
    return item;
  },
  async deleteItem(id: string): Promise<void> {
    const all = await readJson<Item[]>("items.json", []);
    await writeJson("items.json", all.filter((x) => x.id !== id));
  },
  async getSettings(): Promise<SiteSettings> {
    return readJson<SiteSettings>("settings.json", defaultSettings());
  },
  async saveSettings(s: SiteSettings): Promise<SiteSettings> {
    await writeJson("settings.json", s);
    return s;
  },
};
