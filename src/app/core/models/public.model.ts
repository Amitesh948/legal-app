export interface HeroSlider {
  id: string;
  title: string;
  subtitle: string;
  button_text: string;
  target_url: string;
  image_url: string;
  display_order: number;
  is_active: boolean;
}

export interface Testimonial {
  id: string;
  client_name: string;
  client_designation: string;
  client_image_url: string | null;
  rating: number; // 1-5
  content: string;
}

export interface PracticeArea {
  id: string;
  title: string;
  description: string;
  icon_svg: string;
  action_text: string;
  link: string;
  sort_order: number;
}

export interface PublicCategory {
  id: string;
  name: string;
  slug?: string;
}

export interface PublicTag {
  id: string;
  name: string;
  slug?: string;
}

export interface Author {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image_url: string | null;
  status: string; // e.g. "published"
  created_at: string;
  author: Author;
  category: PublicCategory;
  tags?: PublicTag[];
}

export interface PublicCase {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  cover_image_url: string | null;
  created_at: string;
  category: PublicCategory;
  tags?: PublicTag[];
}
