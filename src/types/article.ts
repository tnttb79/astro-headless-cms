export interface HealthArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  publishedDate: string;
  coverImageUrl: string;
  coverImageAlt: string;
  richContent?: Record<string, unknown>;
}
