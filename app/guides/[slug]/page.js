import { notFound } from "next/navigation";
import GuideArticle, { guideMetadata } from "@/components/guides/GuideArticle";
import { GUIDE_CONTENT, getGuide } from "@/lib/guideContent";

export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDE_CONTENT.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const g = getGuide(slug);
  return g ? guideMetadata(g) : {};
}

export default async function GuidePage({ params }) {
  const { slug } = await params;
  const g = getGuide(slug);
  if (!g) notFound();
  return <GuideArticle g={g} />;
}
