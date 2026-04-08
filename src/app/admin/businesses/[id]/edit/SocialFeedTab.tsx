"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Globe,
  Globe2,
  Camera,
  MessageCircle,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  Info,
  Image as ImageIcon,
  ExternalLink,
} from "lucide-react";
import type { SocialPost } from "@/generated/prisma/client";

const PLATFORMS = ["facebook", "instagram", "twitter", "other"] as const;
type Platform = (typeof PLATFORMS)[number];

const PLATFORM_CONFIG: Record<
  Platform,
  { icon: typeof Globe; label: string; badge: string }
> = {
  facebook: {
    icon: Globe2,
    label: "Facebook",
    badge: "bg-blue-100 text-blue-700",
  },
  instagram: {
    icon: Camera,
    label: "Instagram",
    badge: "bg-pink-100 text-pink-700",
  },
  twitter: {
    icon: MessageCircle,
    label: "Twitter",
    badge: "bg-sky-100 text-sky-700",
  },
  other: {
    icon: Globe,
    label: "Other",
    badge: "bg-gray-100 text-gray-700",
  },
};

function formatDate(d: string | Date) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

interface SocialFeedTabProps {
  businessId: string;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
}

type PostFormData = {
  platform: Platform;
  content: string;
  imageUrl: string;
  linkUrl: string;
  postedAt: string;
};

const emptyPostForm: PostFormData = {
  platform: "facebook",
  content: "",
  imageUrl: "",
  linkUrl: "",
  postedAt: new Date().toISOString().slice(0, 16),
};

export default function SocialFeedTab({
  businessId,
  facebookUrl,
  instagramUrl,
}: SocialFeedTabProps) {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<PostFormData>(emptyPostForm);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch(`/api/businesses/${businessId}/posts`);
      if (!res.ok) throw new Error("Failed to load posts");
      setPosts(await res.json());
    } catch {
      setError("Failed to load social posts");
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  async function handleCreatePost(e: React.FormEvent) {
    e.preventDefault();
    if (!form.content.trim() && !form.imageUrl.trim()) {
      setError("Content or image URL is required");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/businesses/${businessId}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: form.platform,
          content: form.content.trim() || null,
          imageUrl: form.imageUrl.trim() || null,
          linkUrl: form.linkUrl.trim() || null,
          postedAt: new Date(form.postedAt).toISOString(),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Failed to create post");
      }
      setForm(emptyPostForm);
      setShowForm(false);
      await fetchPosts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create post");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(postId: string) {
    setDeletingId(postId);
    try {
      const res = await fetch(
        `/api/businesses/${businessId}/posts/${postId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to delete post");
      await fetchPosts();
    } catch {
      setError("Failed to delete post");
    } finally {
      setDeletingId(null);
    }
  }

  const hasSocialUrls = facebookUrl || instagramUrl;

  const inputClass =
    "block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-500">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Loading social posts…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            ✕
          </button>
        </div>
      )}

      {/* Future Integration Card */}
      <div className="rounded-lg border border-teal-200 bg-teal-50 p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-teal-600 mt-0.5 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-teal-800">
              Automatic Feed Integration Coming Soon
            </p>
            {hasSocialUrls ? (
              <>
                <p className="text-sm text-teal-700 mt-1">
                  Posts from connected social accounts will appear here
                  automatically.
                </p>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  {facebookUrl && (
                    <a
                      href={facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                    >
                      <Globe2 className="h-3.5 w-3.5" />
                      Facebook
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {instagramUrl && (
                    <a
                      href={instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-pink-600 hover:underline"
                    >
                      <Camera className="h-3.5 w-3.5" />
                      Instagram
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </>
            ) : (
              <p className="text-sm text-teal-700 mt-1">
                No social accounts connected. Add Facebook or Instagram URLs in
                the <span className="font-medium">Info</span> tab to enable
                future automatic feed integration.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 rounded-md bg-teal-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-teal-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Post
        </button>
      </div>

      {/* Add Post Form */}
      {showForm && (
        <form
          onSubmit={handleCreatePost}
          className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-4"
        >
          <div>
            <label htmlFor="post-platform" className={labelClass}>
              Platform
            </label>
            <select
              id="post-platform"
              value={form.platform}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  platform: e.target.value as Platform,
                }))
              }
              className={inputClass}
            >
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {PLATFORM_CONFIG[p].label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="post-content" className={labelClass}>
              Content
            </label>
            <textarea
              id="post-content"
              value={form.content}
              onChange={(e) =>
                setForm((f) => ({ ...f, content: e.target.value }))
              }
              rows={3}
              className={inputClass}
              placeholder="Post content…"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="post-imageUrl" className={labelClass}>
                Image URL (optional)
              </label>
              <input
                id="post-imageUrl"
                type="url"
                value={form.imageUrl}
                onChange={(e) =>
                  setForm((f) => ({ ...f, imageUrl: e.target.value }))
                }
                className={inputClass}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <label htmlFor="post-linkUrl" className={labelClass}>
                Link URL (optional)
              </label>
              <input
                id="post-linkUrl"
                type="url"
                value={form.linkUrl}
                onChange={(e) =>
                  setForm((f) => ({ ...f, linkUrl: e.target.value }))
                }
                className={inputClass}
                placeholder="https://example.com/post"
              />
            </div>
          </div>
          <div>
            <label htmlFor="post-postedAt" className={labelClass}>
              Posted Date/Time
            </label>
            <input
              id="post-postedAt"
              type="datetime-local"
              value={form.postedAt}
              onChange={(e) =>
                setForm((f) => ({ ...f, postedAt: e.target.value }))
              }
              className={inputClass}
            />
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-teal-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? "Saving…" : "Save Post"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setForm(emptyPostForm);
              }}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Post List */}
      {posts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Globe className="h-10 w-10 mx-auto mb-3 text-gray-300" />
          <p className="font-medium">No social posts yet</p>
          <p className="text-sm mt-1">
            Add posts manually or connect social accounts in the Info tab.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {posts.map((post) => {
            const platform = (post.platform as Platform) || "other";
            const config =
              PLATFORM_CONFIG[platform] ?? PLATFORM_CONFIG.other;
            const Icon = config.icon;

            return (
              <div
                key={post.id}
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow transition-shadow"
              >
                <div className="flex items-start gap-3">
                  {post.imageUrl && (
                    <div className="hidden sm:block shrink-0 w-16 h-16 rounded-md overflow-hidden bg-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={post.imageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                          (
                            e.target as HTMLImageElement
                          ).nextElementSibling?.classList.remove("hidden");
                        }}
                      />
                      <div className="hidden w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-gray-400" />
                      </div>
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${config.badge}`}
                      >
                        <Icon className="h-3 w-3" />
                        {config.label}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(post.postedAt)}
                      </span>
                    </div>
                    {post.content && (
                      <p className="text-sm text-gray-800 line-clamp-3">
                        {post.content}
                      </p>
                    )}
                    {post.linkUrl && (
                      <a
                        href={post.linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-teal-600 hover:underline mt-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View original
                      </a>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(post.id)}
                    disabled={deletingId === post.id}
                    className="shrink-0 p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                    title="Delete post"
                  >
                    {deletingId === post.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
