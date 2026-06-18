export interface PageContent {
  hero: {
    headline: string;
    subheadline: string;
    tagline: string;
    ctaText: string;
  };
  howItWorks: {
    title: string;
    description: string;
    rules: string[];
    courseInfo: string;
    ctaText: string;
  };
  membership: {
    benefits: string[];
    monthlyPrice: string;
    annualPrice: string;
    ctaText: string;
  };
  legal: {
    termsSummary: string;
    privacySummary: string;
    accessibilitySummary: string;
  };
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  isActive: boolean;
  required: boolean;
  lastUpdated: string;
}

export interface ContentVersion {
  id: string;
  page: string;
  status: "draft" | "published";
  lastUpdated: string;
  content: Partial<PageContent>;
}

const defaultContent: PageContent = {
  hero: {
    headline: "Parking Agent",
    subheadline: "City streets parking assistant",
    tagline: "Membership has its advantages",
    ctaText: "Get Started",
  },
  howItWorks: {
    title: "How It Works",
    description:
      "Our AI agentic technology matches departing members with arriving members in real-time, creating a seamless parking experience.",
    rules: [
      "All members must complete the short course on Long Beach street parking laws",
      "Maintain good-standing status by following community guidelines",
      "Ranking is determined by participation and reliability",
      "Only one member may claim a spot at a time",
    ],
    courseInfo:
      "A short course on laws governing street parking for Long Beach, CA, including time limits, permit zones, no-parking zones, and participation rules.",
    ctaText: "Become a Member",
  },
  membership: {
    benefits: [
      "Access to AI agentic matching technology",
      "Short course on Long Beach street parking laws",
      "Community rules of participation",
      "Ranking system with good-standing status",
    ],
    monthlyPrice: "$9.99–$19.99/month",
    annualPrice: "$79–$149/year",
    ctaText: "Start Membership",
  },
  legal: {
    termsSummary:
      "Parking Agent is a membership platform. We do not own, sell, lease, or control parking spots. We provide matching technology and community education.",
    privacySummary:
      "We collect your name, email, GPS location, membership status, and course completion data to provide matching services.",
    accessibilitySummary:
      "Our mobile-first platform is designed to be accessible. We strive for ADA compliance and WCAG guidelines.",
  },
};

const defaultModules: CourseModule[] = [
  {
    id: "cm1",
    title: "Long Beach Street Parking Laws",
    description: "Understand time limits, permit zones, and no-parking zones",
    isActive: true,
    required: true,
    lastUpdated: "2026-06-01",
  },
  {
    id: "cm2",
    title: "Rules of Participation",
    description: "Community guidelines and good-standing requirements",
    isActive: true,
    required: true,
    lastUpdated: "2026-06-01",
  },
  {
    id: "cm3",
    title: "Ranking System Overview",
    description: "How ranking works and how to maintain good-standing",
    isActive: true,
    required: true,
    lastUpdated: "2026-06-01",
  },
];

let contentStore: PageContent = { ...defaultContent };
let modulesStore: CourseModule[] = [...defaultModules];
let versionStore: ContentVersion[] = [
  {
    id: "v1",
    page: "landing",
    status: "published",
    lastUpdated: "2026-06-15",
    content: { hero: { ...defaultContent.hero } },
  },
];

export function getContent(page?: string): PageContent {
  return { ...contentStore };
}

export function updateContent(updates: Partial<PageContent>): PageContent {
  contentStore = { ...contentStore, ...updates };
  versionStore.push({
    id: `v-${Date.now()}`,
    page: "all",
    status: "draft",
    lastUpdated: new Date().toISOString().split("T")[0],
    content: { ...updates },
  });
  return { ...contentStore };
}

export function publishChanges(): ContentVersion[] {
  versionStore = versionStore.map((v) =>
    v.status === "draft" ? { ...v, status: "published" as const } : v
  );
  return [...versionStore];
}

export function getCourseModules(): CourseModule[] {
  return [...modulesStore];
}

export function updateCourseModule(
  id: string,
  updates: Partial<CourseModule>
): CourseModule[] {
  modulesStore = modulesStore.map((m) =>
    m.id === id ? { ...m, ...updates } : m
  );
  return [...modulesStore];
}

export function addCourseModule(module: CourseModule): CourseModule[] {
  modulesStore = [...modulesStore, module];
  return [...modulesStore];
}

export function getVersions(): ContentVersion[] {
  return [...versionStore];
}
