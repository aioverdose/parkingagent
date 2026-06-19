"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface PageContent {
  landing: Record<string, string>;
  howItWorks: Record<string, string>;
  membership: Record<string, string>;
}

interface CourseModule {
  id: string;
  title: string;
  description: string;
  content: string;
  isActive: boolean;
  required: boolean;
  lastUpdated: string;
}

interface ContentVersion {
  id: string;
  page: string;
  status: string;
  lastUpdated: string;
}

export default function AdminCMS() {
  const [content, setContent] = useState<PageContent | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [versions, setVersions] = useState<ContentVersion[]>([]);
  const [activeTab, setActiveTab] = useState<"pages" | "courses">("pages");
  const [saved, setSaved] = useState(false);
  const [editingContent, setEditingContent] = useState<Record<string, string>>({});

  useEffect(() => {
    api.get<{ content: PageContent; versions: ContentVersion[]; modules: CourseModule[] }>("/api/admin/cms").then((data) => {
      setContent(data.content);
      setVersions(data.versions);
      setModules(data.modules);
    });
  }, []);

  const handleHeroUpdate = (field: string, value: string) => {
    if (!content) return;
    setContent({
      ...content,
      landing: { ...content.landing, [field]: value },
    });
  };

  const handleSave = async () => {
    if (!content) return;
    for (const [key, value] of Object.entries(content.landing)) {
      await api.put("/api/admin/cms", { page: "landing", key, value });
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handlePublish = async () => {
    await api.post("/api/admin/cms/publish");
    const data = await api.get<{ versions: ContentVersion[] }>("/api/admin/cms");
    setVersions(data.versions);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleModule = async (id: string) => {
    const mod = modules.find((m) => m.id === id);
    if (!mod) return;
    const data = await api.patch<{ module: CourseModule }>(`/api/admin/cms/modules/${id}`, { isActive: !mod.isActive });
    setModules((prev) => prev.map((m) => (m.id === id ? data.module : m)));
  };

  const handleContentChange = (id: string, value: string) => {
    setEditingContent((prev) => ({ ...prev, [id]: value }));
  };

  const saveModuleContent = async (id: string) => {
    const content = editingContent[id];
    if (!content) return;
    const data = await api.patch<{ module: CourseModule }>(`/api/admin/cms/modules/${id}`, { content });
    setModules((prev) => prev.map((m) => (m.id === id ? data.module : m)));
    setEditingContent((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!content) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#202124]">CMS</h1>
        <span className="text-xs text-[#BDBDBD] self-center">
          {versions.find((v) => v.status === "published")
            ? `Published: ${versions.filter((v) => v.status === "published").pop()?.lastUpdated}`
            : "No published version"}
        </span>
      </div>

      <div className="flex gap-4 border-b border-gray-200">
        {(["pages" as const, "courses" as const]).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-medium transition-colors ${
              activeTab === tab ? "border-b-2 border-[#4285F4] text-[#4285F4]" : "text-[#757575] hover:text-[#202124]"
            }`}>
            {tab === "pages" ? "Page Content" : "Course Modules"}
          </button>
        ))}
      </div>

      {activeTab === "pages" && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h2 className="font-semibold text-[#202124] mb-4">Landing Page</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#757575] mb-1">Headline</label>
                <input type="text" value={content.landing?.headline || ""}
                  onChange={(e) => handleHeroUpdate("headline", e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4285F4] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#757575] mb-1">Subheadline</label>
                <input type="text" value={content.landing?.subheadline || ""}
                  onChange={(e) => handleHeroUpdate("subheadline", e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4285F4] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#757575] mb-1">Tagline</label>
                <input type="text" value={content.landing?.tagline || ""}
                  onChange={(e) => handleHeroUpdate("tagline", e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4285F4] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#757575] mb-1">CTA Button Text</label>
                <input type="text" value={content.landing?.ctaText || ""}
                  onChange={(e) => handleHeroUpdate("ctaText", e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4285F4] outline-none" />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={handleSave} className="bg-[#4285F4] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#1A73E8] transition-colors">
              {saved ? "Saved!" : "Save Changes"}
            </button>
            <button onClick={handlePublish} className="bg-[#0F9D58] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#34A853] transition-colors">
              {saved ? "Published!" : "Publish Changes"}
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-[#202124] mb-4">Version History</h3>
            <div className="space-y-2">
              {versions.map((v) => (
                <div key={v.id} className="flex items-center justify-between text-sm py-2 border-b border-gray-100 last:border-0">
                  <span className="text-[#757575]">Version {v.id} — {v.page}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[#BDBDBD] text-xs">{v.lastUpdated}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                      v.status === "published" ? "bg-[#E6F4EA] text-[#0F9D58]" : "bg-[#FFF8E1] text-[#FBBB05]"
                    }`}>{v.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "courses" && (
        <div className="space-y-4">
          {modules.map((mod) => (
            <div key={mod.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-[#202124]">{mod.title}</h3>
                  <p className="text-sm text-[#757575] mt-1">{mod.description}</p>
                  <p className="text-xs text-[#BDBDBD] mt-2">Last updated: {mod.lastUpdated}{mod.required && " — Required"}</p>
                </div>
                <button onClick={() => toggleModule(mod.id)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                    mod.isActive ? "bg-[#E6F4EA] text-[#0F9D58] hover:bg-[#C8E6C9]" : "bg-gray-100 text-[#757575] hover:bg-gray-200"
                  }`}>
                  {mod.isActive ? "Active" : "Inactive"}
                </button>
              </div>
              <div className="mt-4">
                <label className="block text-xs font-medium text-[#757575] mb-1">Course Content</label>
                <textarea rows={8}
                  defaultValue={mod.content || ""}
                  onChange={(e) => handleContentChange(mod.id, e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#4285F4] outline-none font-mono text-xs leading-relaxed" />
              </div>
              {editingContent[mod.id] !== undefined && (
                <button onClick={() => saveModuleContent(mod.id)}
                  className="mt-2 bg-[#4285F4] text-white px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#1A73E8] transition-colors">
                  Save Content
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
