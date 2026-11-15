import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleView } from "@/components/journal/ArticleView";
import { ARTICLES, findArticle } from "@/lib/content";

// One page is built for each note in lib/content.ts, and for nothing else.
export const dynamicParams = false;

export function generateStaticParams() {
  return ARTICLES.map((article) => ({ slug: article.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const article = findArticle(params.slug);
  return article ? { title: article.title, description: article.excerpt } : {};
}

export default function Page({ params }: { params: { slug: string } }) {
  if (!findArticle(params.slug)) notFound();
  return <ArticleView slug={params.slug} />;
}
