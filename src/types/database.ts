// =============================================
// DATABASE TYPES FOR CMS
// =============================================

export type AppRole = 'admin' | 'editor';
export type PostStatus = 'draft' | 'published' | 'scheduled';

// Block types for page builder
export type BlockType =
  | 'hero'
  | 'rich_text'
  | 'image_text'
  | 'gallery'
  | 'testimonials'
  | 'faq'
  | 'stats'
  | 'pricing'
  | 'cta'
  | 'embed'
  | 'services'
  | 'portfolio'
  | 'team'
  | 'clients'
  | 'timeline'
  | 'values'
  | 'story'
  | 'why_choose'
  | 'contact_form'
  | 'contact_info'
  | 'blog_grid'
  | 'category_filter'
  | 'button'
  | 'container'; // New: container for nested blocks

export interface ButtonColorConfig {
  mode: 'default' | 'custom';
  backgroundColor?: string;
  textColor?: string;
}

// Animation configuration for blocks
export type AnimationType = 
  | 'none'
  | 'fade'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  | 'zoom-in'
  | 'zoom-out'
  | 'flip'
  | 'rotate'
  | 'bounce'
  | 'pulse';

export type AnimationEasing = 
  | 'linear'
  | 'ease'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'spring';

export interface BlockAnimation {
  type: AnimationType;
  duration: number; // in seconds
  delay: number; // in seconds
  easing: AnimationEasing;
  trigger: 'on-load' | 'on-scroll' | 'on-hover';
  repeat?: boolean;
  stagger?: number; // for child elements, in seconds
}

// Layout configuration for blocks within containers
export interface BlockLayout {
  x: number; // percentage or px
  y: number;
  width: number; // percentage (0-100)
  height: number | 'auto'; // percentage or auto
  zIndex?: number;
  gridColumn?: string; // for grid layouts
  gridRow?: string;
}

// Nested block structure
export interface NestedBlock {
  id: string;
  block_type: BlockType;
  content: Record<string, unknown>;
  layout: BlockLayout;
  animation?: BlockAnimation;
  children?: NestedBlock[]; // Recursive nesting
  is_visible: boolean;
}

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface SiteSettings {
  id: string;
  site_name: string;
  tagline: string | null;
  logo_url: string | null;
  logo_height?: number;
  logo_offset_x?: number;
  logo_offset_y?: number;
  email: string | null;
  phone: string | null;
  address: string | null;
  facebook_url: string | null;
  twitter_url: string | null;
  linkedin_url: string | null;
  instagram_url: string | null;
  github_url: string | null;
  default_seo_title: string | null;
  default_seo_description: string | null;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  seo_title: string | null;
  seo_description: string | null;
  og_image: string | null;
  is_published: boolean;
  is_system_page: boolean;
  created_at: string;
  updated_at: string;
}

export interface PageSection {
  id: string;
  page_id: string;
  block_type: BlockType;
  content: Record<string, unknown>;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface MenuItem {
  id: string;
  label: string;
  url: string | null;
  page_id: string | null;
  parent_id: string | null;
  menu_location: 'header' | 'footer';
  sort_order: number;
  is_enabled: boolean;
  open_in_new_tab: boolean;
  created_at: string;
  updated_at: string;
  children?: MenuItem[];
}

export interface Service {
  id: string;
  title: string;
  slug: string;
  icon: string | null;
  short_description: string | null;
  content: string | null;
  is_featured: boolean;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  slug: string;
  client: string | null;
  industry: string | null;
  tech_stack: string[];
  short_description: string | null;
  content: string | null;
  featured_image: string | null;
  highlights: string[];
  is_featured: boolean;
  is_published: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  images?: PortfolioImage[];
}

export interface PortfolioImage {
  id: string;
  portfolio_id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  avatar_url: string | null;
  email: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  github_url: string | null;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  featured_image: string | null;
  author_id: string | null;
  category_id: string | null;
  status: PostStatus;
  publish_date: string | null;
  created_at: string;
  updated_at: string;
  author?: Profile;
  category?: Category;
  tags?: Tag[];
}

export interface PostTag {
  id: string;
  post_id: string;
  tag_id: string;
}

export interface Testimonial {
  id: string;
  author_name: string;
  author_role: string | null;
  author_company: string | null;
  author_avatar: string | null;
  content: string;
  rating: number | null;
  is_featured: boolean;
  is_published: boolean;
  sort_order: number;
  created_at: string;
}

export interface ClientLogo {
  id: string;
  name: string;
  logo_url: string;
  website_url: string | null;
  sort_order: number;
  is_published: boolean;
  created_at: string;
}

export interface MediaAsset {
  id: string;
  filename: string;
  url: string;
  file_type: string | null;
  file_size: number | null;
  alt_text: string | null;
  uploaded_by: string | null;
  created_at: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  subject: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface HomeSection {
  id: string;
  section_type: 'hero' | 'stats_intro' | 'services_intro' | 'portfolio_intro' | 'cta';
  content: Record<string, unknown>;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface HomeStat {
  id: string;
  value: string;
  label: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface AboutSection {
  id: string;
  section_type: 'hero' | 'story' | 'values_intro' | 'timeline_intro' | 'why_choose';
  content: Record<string, unknown>;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface AboutValue {
  id: string;
  icon: string;
  title: string;
  description: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface AboutTimeline {
  id: string;
  year: string;
  title: string;
  description: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// =============================================
// BLOCK CONTENT TYPES
// =============================================

export interface HeroBlockContent {
  headline: string;
  subheadline?: string;
  primaryButtonText?: string;
  primaryButtonUrl?: string;
  secondaryButtonText?: string;
  secondaryButtonUrl?: string;
  backgroundImage?: string;
  backgroundVideo?: string;
  alignment?: 'left' | 'center' | 'right';
}

export interface RichTextBlockContent {
  content: string;
}

export interface ImageTextBlockContent {
  title?: string;
  content: string;
  imageUrl: string;
  imageAlt?: string;
  imagePosition: 'left' | 'right';
}

export interface GalleryBlockContent {
  title?: string;
  images: Array<{
    url: string;
    alt?: string;
    caption?: string;
  }>;
  columns?: 2 | 3 | 4;
}

export interface TestimonialsBlockContent {
  title?: string;
  subtitle?: string;
  testimonialIds?: string[];
  displayStyle?: 'carousel' | 'grid';
}

export interface FAQBlockContent {
  title?: string;
  items: Array<{
    question: string;
    answer: string;
  }>;
}

export interface StatsBlockContent {
  title?: string;
  items: Array<{
    value: string;
    label: string;
    suffix?: string;
  }>;
}

export interface PricingBlockContent {
  title?: string;
  subtitle?: string;
  plans: Array<{
    name: string;
    price: string;
    period?: string;
    description?: string;
    features: string[];
    buttonText?: string;
    buttonUrl?: string;
    isHighlighted?: boolean;
  }>;
}

export interface CTABlockContent {
  title: string;
  subtitle?: string;
  buttonText: string;
  buttonUrl: string;
  backgroundStyle?: 'gradient' | 'solid' | 'image';
  backgroundImage?: string;
}

export interface EmbedBlockContent {
  embedType: 'video' | 'map' | 'custom';
  embedUrl?: string;
  embedCode?: string;
  aspectRatio?: '16:9' | '4:3' | '1:1';
}

export interface ServicesBlockContent {
  title?: string;
  subtitle?: string;
  displayStyle?: 'grid' | 'list';
  featuredOnly?: boolean;
  limit?: number;
  serviceIds?: string[];
}

export interface PortfolioBlockContent {
  title?: string;
  subtitle?: string;
  displayStyle?: 'grid' | 'masonry';
  featuredOnly?: boolean;
  limit?: number;
  portfolioIds?: string[];
}

export interface TeamBlockContent {
  title?: string;
  subtitle?: string;
  displayStyle?: 'grid' | 'carousel';
  limit?: number;
  memberIds?: string[];
  columns?: 2 | 3 | 4;
}

export interface ClientsBlockContent {
  title?: string;
  displayStyle?: 'grid' | 'carousel';
}

export interface TimelineBlockContent {
  title?: string;
  subtitle?: string;
  items: Array<{
    year: string;
    title: string;
    description: string;
  }>;
}

export interface ValuesBlockContent {
  title?: string;
  subtitle?: string;
  items: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
  columns?: 2 | 3 | 4;
}

export interface StoryBlockContent {
  title: string;
  paragraphs: string[];
  stats?: {
    yearsExperience?: string;
    projectsCompleted?: string;
    [key: string]: string | undefined;
  };
}

export interface WhyChooseBlockContent {
  title: string;
  reasons: string[];
  stats?: {
    clientSatisfaction?: string;
    projectsCompleted?: string;
    happyClients?: string;
    supportAvailable?: string;
    [key: string]: string | undefined;
  };
}

export interface ContactFormBlockContent {
  title?: string;
  subtitle?: string;
}

export interface ContactInfoBlockContent {
  title?: string;
  showFromSettings?: boolean;
  email?: string;
  phone?: string;
  address?: string;
}

export interface BlogGridBlockContent {
  title?: string;
  layout?: 'grid' | 'list';
  postsPerPage?: number;
  categoryFilter?: string;
}

export interface CategoryFilterBlockContent {
  style?: 'pills' | 'tabs' | 'dropdown';
  showAll?: boolean;
}

export interface AnimationConfig {
  type: 'none' | 'fade' | 'slide' | 'zoom' | 'bounce' | 'flip' | 'rotate';
  direction?: 'up' | 'down' | 'left' | 'right';
  duration: number;
  delay: number;
  easing: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'spring';
  triggerOn: 'load' | 'scroll';
}

export type BlockContent =
  | HeroBlockContent
  | RichTextBlockContent
  | ImageTextBlockContent
  | GalleryBlockContent
  | TestimonialsBlockContent
  | FAQBlockContent
  | StatsBlockContent
  | PricingBlockContent
  | CTABlockContent
  | EmbedBlockContent
  | ServicesBlockContent
  | PortfolioBlockContent
  | TeamBlockContent
  | ClientsBlockContent
  | TimelineBlockContent
  | ValuesBlockContent
  | StoryBlockContent
  | WhyChooseBlockContent
  | ContactFormBlockContent
  | ContactInfoBlockContent
  | BlogGridBlockContent
  | CategoryFilterBlockContent;
