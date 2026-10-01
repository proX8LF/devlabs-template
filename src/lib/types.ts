export type ItemStatus = "open" | "done";

export interface Item {
  id: string;
  title: string;
  details: string;
  status: ItemStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SiteSettings {
  companyName: string;
  contactEmail: string;
  footerText: string;
  updatedAt: string;
}
