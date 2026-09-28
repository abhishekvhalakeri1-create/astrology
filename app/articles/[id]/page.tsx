"use client";
import { useParams } from "next/navigation";
import { articles } from "@/lib/seedData";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function ArticleDetailPage() {
  const { id } = useParams();
  const art = articles.find(a=>a.id===id);
  if (!art) return <div className="p-6 text-white">Article not found</div>;
  return (
    <div className="p-4 lg:p-6 max-w-[800px] mx-auto space-y-6">
      <Link href="/articles" className="text-violet-300 text-sm">← Back to articles</Link>
      <div className="rounded-2xl overflow-hidden">
        <img src={art.image} alt={art.title} className="w-full h-[300px] object-cover" />
      </div>
      <div>
        <Badge variant="outline">{art.category}</Badge>
        <h1 className="text-3xl font-bold mt-3">{art.title}</h1>
        <div className="flex items-center gap-3 mt-3 text-sm text-white/50">
          <span>{art.author}</span><span>•</span><span>{new Date(art.createdAt).toLocaleDateString()}</span><span>•</span><span>{art.readTime} min read</span><span>•</span><span>{art.views.toLocaleString()} views</span>
        </div>
      </div>
      <Card>
        <CardContent className="p-6 prose prose-invert max-w-none">
          <p className="text-white/80 leading-relaxed">{art.content}</p>
          <p className="text-white/60 text-sm mt-6">This article is for educational and entertainment purposes. Astrology guidance is not a substitute for professional advice. Consult verified astrologer for personalized reading.</p>
        </CardContent>
      </Card>
    </div>
  );
}
