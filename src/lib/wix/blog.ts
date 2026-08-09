import { posts } from "@wix/blog";
import { media } from "@wix/sdk";
import type { HealthArticle } from "../../types/article";

const text = (value: unknown): string => typeof value === "string" ? value : "";

function dateString(value: unknown): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString();
  if (typeof value !== "string") return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

function coverImage(post: any): string {
  const source = text(post?.media?.wixMedia?.image) || text(post?.media?.embedMedia?.thumbnail?.url);
  if (!source || post?.media?.displayed === false) return "";
  if (!source.startsWith("wix:image://")) return source;

  try {
    return media.getImageUrl(source).url;
  } catch (error) {
    console.error("[wix-blog] cover image resolution failed", error);
    return "";
  }
}

function toHealthArticle(post: any): HealthArticle {
  const title = text(post?.title);
  const richContent = post?.richContent && typeof post.richContent === "object"
    ? post.richContent as Record<string, unknown>
    : undefined;

  return {
    id: text(post?._id),
    title,
    slug: text(post?.slug),
    excerpt: text(post?.excerpt),
    publishedDate: dateString(post?.firstPublishedDate),
    coverImageUrl: coverImage(post),
    coverImageAlt: text(post?.media?.altText) || (title ? `${title} cover image` : "Article cover image"),
    richContent,
  };
}

export async function getHealthArticles(limit?: number): Promise<HealthArticle[]> {
  try {
    const requestedLimit = limit === undefined ? 100 : Math.max(1, Math.min(Math.floor(limit), 100));
    let result = await posts
      .queryPosts({ fieldsets: ["URL"] })
      .descending("firstPublishedDate")
      .limit(requestedLimit)
      .find();
    const articles = result.items.map(toHealthArticle).filter((article) => article.id && article.slug && article.title);

    if (limit !== undefined) return articles.slice(0, limit);

    while (result.hasNext()) {
      result = await result.next();
      articles.push(...result.items.map(toHealthArticle).filter((article) => article.id && article.slug && article.title));
    }

    return articles;
  } catch (error) {
    console.error("[wix-blog] getHealthArticles failed", error);
    return [];
  }
}

export async function getHealthArticleBySlug(slug: string): Promise<HealthArticle | null> {
  if (!slug) return null;

  try {
    const { post } = await posts.getPostBySlug(slug, { fieldsets: ["RICH_CONTENT", "URL"] });
    return post ? toHealthArticle(post) : null;
  } catch (error) {
    console.error("[wix-blog] getHealthArticleBySlug failed", error);
    return null;
  }
}
