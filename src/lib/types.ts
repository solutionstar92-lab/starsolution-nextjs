export type Stat = [string, string];

export interface Entry {
  id: string;
  slug: string;
  title: string;
  eyebrow?: string;
  summary?: string;
  short?: string;
  stats?: Stat[];
  points?: string[];
  video?: { src?: string; poster?: string; youtube?: string } | null;
  icon?: string;
  tone?: string;
  badge?: string;
  metric?: string;
  metricLabel?: string;
  tag?: string;
  /* case studies */
  type?: string;
  kpi?: string;
  kpiUnit?: string;
  kpiLabel?: string;
  before?: string;
  after?: string;
  delta?: string;
  period?: string;
  c1?: string;
  c2?: string;
  /* team */
  initials?: string;
  role?: string;
}

export interface Project {
  id: string; slug: string; badge: string; title: string; short: string;
  url: string; accent: string; theme: 'montre' | 'beauty';
  summary: string; points: string[];
}

export interface Testimonial {
  id: string; initials: string; tone: string; name: string; role: string; quote: string;
}

export interface Bar { cap: string; val: number; text: string; ghost?: boolean }

export interface Chart {
  kicker: string; label: string; count: number; decimals?: number;
  prefix?: string; suffix?: string; note: string; bars: Bar[];
}

export interface HeroNode {
  icon: string; tone: string; source: string; label: string;
  value: string; delta: string; spark: string;
}

export interface Figure {
  metric: string; icon: string; count: number; decimals?: number;
  prefix?: string; suffix?: string; fallback: string; label: string; sub: string;
}

export interface SiteContent {
  solutions: Entry[];
  goals: Entry[];
  caseStudies: Entry[];
  systems: Entry[];
  automations: Entry[];
  team: Entry[];
  testimonials: Testimonial[];
  projects: Project[];
  charts: Record<string, Chart>;
  figures: Figure[];
  heroNodes: HeroNode[];
  heroStats: [string, string, string][];
  process: { num: string; icon: string; title: string; text: string }[];
  nightLog: { time: string; title: string; text: string }[];
  nightStats: Stat[];
  platforms: string[];
  contact: { email: string; phone: string; whatsapp: string; locations: string; offer: string };
}
