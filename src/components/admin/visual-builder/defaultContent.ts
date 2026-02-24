import type { BlockType } from '@/types/database';

export function getDefaultContent(blockType: BlockType): Record<string, unknown> {
  switch (blockType) {
    case 'hero':
      return {
        headline: 'Your Headline Here',
        subheadline: 'Add a compelling subheadline',
        primaryButtonText: 'Get Started',
        primaryButtonUrl: '/contact',
        alignment: 'center',
      };
    case 'rich_text':
      return { content: '# Your Content\n\nStart writing your content here...' };
    case 'image_text':
      return {
        title: 'Section Title',
        content: 'Your content here...',
        imageUrl: '/placeholder.svg',
        imagePosition: 'left',
      };
    case 'gallery':
      return { title: 'Gallery', images: [], columns: 3 };
    case 'testimonials':
      return { title: 'What Our Clients Say', displayStyle: 'carousel' };
    case 'faq':
      return {
        title: 'Frequently Asked Questions',
        items: [
          { question: 'Question 1?', answer: 'Answer 1' },
          { question: 'Question 2?', answer: 'Answer 2' },
        ],
      };
    case 'stats':
      return {
        items: [
          { value: '100', label: 'Projects', suffix: '+' },
          { value: '50', label: 'Clients', suffix: '+' },
          { value: '10', label: 'Years', suffix: '+' },
        ],
      };
    case 'pricing':
      return {
        title: 'Our Pricing',
        plans: [
          {
            name: 'Starter',
            price: '$99',
            period: '/month',
            features: ['Feature 1', 'Feature 2'],
            buttonText: 'Get Started',
            buttonUrl: '/contact',
          },
        ],
      };
    case 'cta':
      return {
        title: 'Ready to Get Started?',
        subtitle: 'Contact us today for a free consultation',
        buttonText: 'Contact Us',
        buttonUrl: '/contact',
        backgroundStyle: 'gradient',
      };
    case 'embed':
      return { embedType: 'video', aspectRatio: '16:9' };
    case 'services':
      return { title: 'Our Services', displayStyle: 'grid', showFeaturedOnly: false };
    case 'portfolio':
      return { title: 'Our Work', displayStyle: 'grid', showFeaturedOnly: false, limit: 6 };
    case 'team':
      return { title: 'Meet Our Team', displayStyle: 'grid' };
    case 'clients':
      return { title: 'Trusted By', displayStyle: 'carousel' };
    case 'timeline':
      return {
        title: 'Our Journey',
        subtitle: 'Key milestones in our history',
        items: [
          { year: '2020', title: 'Founded', description: 'Company started' },
          { year: '2021', title: 'First Milestone', description: 'Achievement description' },
        ],
      };
    case 'values':
      return {
        title: 'Our Values',
        subtitle: 'What drives us forward',
        columns: 3,
        items: [
          { icon: 'target', title: 'Excellence', description: 'We strive for excellence in everything we do' },
          { icon: 'heart', title: 'Passion', description: 'Passionate about delivering great results' },
          { icon: 'users', title: 'Teamwork', description: 'Collaboration is key to our success' },
        ],
      };
    case 'story':
      return {
        title: 'Our Story',
        paragraphs: ['Add your company story here...', 'Continue your narrative...'],
        stats: { yearsExperience: 10, projectsCompleted: 100 },
      };
    case 'why_choose':
      return {
        title: 'Why Choose Us',
        reasons: 'Expert Team\nProven Track Record\nCustomer First Approach',
        stats: {
          stat1Label: 'Projects', stat1Value: '100+',
          stat2Label: 'Clients', stat2Value: '50+',
          stat3Label: 'Countries', stat3Value: '10+',
          stat4Label: 'Awards', stat4Value: '5+',
        },
      };
    case 'contact_form':
      return { title: 'Get In Touch', subtitle: 'We would love to hear from you' };
    case 'contact_info':
      return { title: 'Contact Information', useSettings: true };
    case 'blog_grid':
      return { title: 'Latest Posts', layout: 'grid', postsPerPage: 9 };
    case 'category_filter':
      return { style: 'pills', showAll: true };
    case 'button':
      return {
        text: 'Click Me',
        url: '/contact',
        variant: 'default',
        size: 'default',
        alignment: 'center',
        openInNewTab: false,
      };
    case 'container':
      return {
        layoutType: 'flex',
        direction: 'row',
        gap: '16',
        columns: 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        children: [],
        animation: {
          type: 'none',
          duration: 0.5,
          delay: 0,
          easing: 'ease-out',
          trigger: 'on-load',
        },
      };
    default:
      return {};
  }
}

// Default dimensions for each block type (approximate rendered heights)
export function getDefaultBlockDimensions(blockType: BlockType): { width: number; height: number } {
  switch (blockType) {
    case 'hero':
      return { width: 100, height: 400 };
    case 'rich_text':
      return { width: 100, height: 200 };
    case 'image_text':
      return { width: 100, height: 350 };
    case 'gallery':
      return { width: 100, height: 400 };
    case 'testimonials':
      return { width: 100, height: 300 };
    case 'faq':
      return { width: 100, height: 250 };
    case 'stats':
      return { width: 100, height: 150 };
    case 'pricing':
      return { width: 100, height: 400 };
    case 'cta':
      return { width: 100, height: 200 };
    case 'embed':
      return { width: 100, height: 350 };
    case 'services':
      return { width: 100, height: 400 };
    case 'portfolio':
      return { width: 100, height: 450 };
    case 'team':
      return { width: 100, height: 400 };
    case 'clients':
      return { width: 100, height: 120 };
    case 'timeline':
      return { width: 100, height: 350 };
    case 'values':
      return { width: 100, height: 300 };
    case 'story':
      return { width: 100, height: 300 };
    case 'why_choose':
      return { width: 100, height: 350 };
    case 'contact_form':
      return { width: 100, height: 400 };
    case 'contact_info':
      return { width: 100, height: 250 };
    case 'blog_grid':
      return { width: 100, height: 500 };
    case 'category_filter':
      return { width: 100, height: 60 };
    case 'button':
      return { width: 100, height: 60 };
    case 'container':
      return { width: 100, height: 200 };
    default:
      return { width: 100, height: 150 };
  }
}
