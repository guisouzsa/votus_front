export type NewsSource = {
  name: string;
  logoUrl?: string;
};

export type NewsArticle = {
  id: string;
  category?: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  source?: NewsSource;
  publishedAt?: string;
  content?: string;
};
