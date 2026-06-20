"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface PageContent { landing: Record<string, string>; howItWorks: Record<string, string>; membership: Record<string, string>; }
interface CourseModule { id: string; title: string; description: string; content: string; isActive: boolean; required: boolean; lastUpdated: string; }
interface ContentVersion { id: string; page: string; status: string; lastUpdated: string; }

export default function AdminCMS() {
  const [content, setContent] = useState<PageContent | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [versions, setVersions] = useState<ContentVersion[]>([]);
  const [activeTab, setActiveTab] = useState<"pages" | "courses">("pages");
  const [saved, setSaved] = useState(false);
  const [editingContent, setEditingContent] = useState<Record<string, string>>({});

  useEffect(() => {
    api.get<{ content: PageContent; versions: ContentVersion[]; modules: CourseModule[] }>("/api/admin/cms").then((d) => { setContent(d.content); setVersions(d.versions); setModules(d.modules); });
  }, []);

  const handleHeroUpdate = (field: string, value: string) => { if (!content) return; setContent({ ...content, landing: { ...content.landing, [field]: value } }); };

  const handleSave = async () => { if (!content) return; for (const [key, value] of Object.entries(content.landing)) { await api.put("/api/admin/cms", { page: "landing", key, value }); } setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const handlePublish = async () => { await api.post("/api/admin/cms/publish"); const d = await api.get<{ versions: ContentVersion[] }>("/api/admin/cms"); setVersions(d.versions); setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const toggleModule = async (id: string) => { const mod = modules.find((m) => m.id === id); if (!mod) return; const d = await api.patch<{ module: CourseModule }>(`/api/admin/cms/modules/${id}`, { isActive: !mod.isActive }); setModules((prev) => prev.map((m) => (m.id === id ? d.module : m))); };

  const handleContentChange = (id: string, value: string) => setEditingContent((prev) => ({ ...prev, [id]: value }));

  const saveModuleContent = async (id: string) => { const c = editingContent[id]; if (!c) return; const d = await api.patch<{ module: CourseModule }>(`/api/admin/cms/modules/${id}`, { content: c }); setModules((prev) => prev.map((m) => (m.id === id ? d.module : m))); const next = { ...editingContent }; delete next[id]; setEditingContent(next); setSaved(true); setTimeout(() => setSaved(false), 2000); };

  if (!content) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#202124]">CMS</h1>
        <span className="text-[10px] text-[#BDBDBD]">
          {versions.find((v) => v.status === "published") ? `Published: ${versions.filter((v) => v.status === "published").pop()?.lastUpdated}` : "No published version"}
        </span>
      </div>

      <div className="flex gap-4 border-b border-gray-200">
        {(["pages", "courses"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`pb-2.5 text-xs font-medium transition-colors ${activeTab === tab ? "border-b-2 border-[#4285F4] text-[#4285F4]" : "text-[#757575] hover:text-[#202124]"}`}>
            {tab === "pages" ? "Page Content" : "Course Modules"}
          </button>
        ))}
      </div>

      {activeTab === "pages" && (
        <div className="space-y-4">
          <Card title="Landing Page">
            <div className="space-y-3">
              {["headline", "subheadline", "tagline", "ctaText"].map((field) => (
                <div key={field}>
                  <label className="block text-[10px] font-medium text-[#757575] uppercase tracking-wider mb-1">{field}</label>
                  <input type="text" value={content.landing[field] || ""}
                    onChange={(e) => handleHeroUpdate(field, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#4285F4] outline-none" />
                </div>
              ))}
            </div>
          </Card>

          <div className="flex gap-2">
            <button onClick={handleSave} className="bg-[#4285F4] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#1A73E8]">{saved ? "Saved!" : "Save"}</button>
            <button onClick={handlePublish} className="bg-[#0F9D58] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#34A853]">{saved ? "Published!" : "Publish"}</button>
          </div>

          <Card title="Version History">
            {versions.map((v) => (
              <div key={v.id} className="flex items-center justify-between text-xs py-1.5 border-b border-gray-100 last:border-0">
                <span className="text-[#757575]">Version {v.id} — {v.page}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[#BDBDBD] text-[10px]">{v.lastUpdated}</span>
                  <Badge variant={v.status === "published" ? "success" : "warning"}>{v.status}</Badge>
                </div>
              </div>
            ))}
          </Card>
        </div>
      )}

      {activeTab === "courses" && (
        <div className="space-y-3">
          {modules.map((mod) => (
            <Card key={mod.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[#202124] text-xs">{mod.title}</h3>
                  <p className="text-[10px] text-[#757575] mt-0.5">{mod.description}</p>
                  <p className="text-[10px] text-[#BDBDBD] mt-1">{mod.lastUpdated}{mod.required && " — Required"}</p>
                </div>
                <button onClick={() => toggleModule(mod.id)}
                  className={`text-[10px] font-semibold px-2.5 py-1.5 rounded-lg transition-colors ${mod.isActive ? "bg-[#E6F4EA] text-[#0F9D58]" : "bg-gray-100 text-[#757575]"}`}>
                  {mod.isActive ? "Active" : "Inactive"}
                </button>
              </div>
              <div className="mt-3">
                <label className="block text-[10px] font-medium text-[#757575] mb-1">Content</label>
                <textarea rows={6} defaultValue={mod.content || ""}
                  onChange={(e) => handleContentChange(mod.id, e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-[#4285F4] outline-none font-mono text-[10px]" />
              </div>
              {editingContent[mod.id] !== undefined && (
                <button onClick={() => saveModuleContent(mod.id)} className="mt-1.5 bg-[#4285F4] text-white px-3 py-1 rounded-lg text-[10px] font-semibold hover:bg-[#1A73E8]">Save Content</button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
