import { useDraggable } from '@dnd-kit/core';
import {
  Type,
  Image,
  LayoutTemplate,
  MessageSquare,
  HelpCircle,
  TrendingUp,
  DollarSign,
  Megaphone,
  Code,
  Briefcase,
  Users,
  Building,
  Layers,
  Clock,
  Award,
  FileText,
  CheckCircle,
  Mail,
  MapPin,
  Grid,
  Filter,
  MousePointerClick,
  Box,
} from 'lucide-react';
import type { BlockType } from '@/types/database';

export const blockTypes: { type: BlockType; label: string; icon: React.ElementType; description: string }[] = [
  { type: 'hero', label: 'Hero', icon: LayoutTemplate, description: 'Full-width hero section' },
  { type: 'rich_text', label: 'Rich Text', icon: Type, description: 'Markdown text content' },
  { type: 'image_text', label: 'Image + Text', icon: Image, description: 'Image alongside text' },
  { type: 'gallery', label: 'Gallery', icon: Image, description: 'Image gallery grid' },
  { type: 'testimonials', label: 'Testimonials', icon: MessageSquare, description: 'Customer testimonials' },
  { type: 'faq', label: 'FAQ', icon: HelpCircle, description: 'FAQ accordion' },
  { type: 'stats', label: 'Stats', icon: TrendingUp, description: 'Statistics counters' },
  { type: 'pricing', label: 'Pricing', icon: DollarSign, description: 'Pricing table' },
  { type: 'cta', label: 'Call to Action', icon: Megaphone, description: 'CTA banner' },
  { type: 'embed', label: 'Embed', icon: Code, description: 'Video, map, or embed' },
  { type: 'services', label: 'Services', icon: Layers, description: 'Services from CMS' },
  { type: 'portfolio', label: 'Portfolio', icon: Briefcase, description: 'Portfolio items' },
  { type: 'team', label: 'Team', icon: Users, description: 'Team members' },
  { type: 'clients', label: 'Clients', icon: Building, description: 'Client logos' },
  { type: 'timeline', label: 'Timeline', icon: Clock, description: 'Timeline milestones' },
  { type: 'values', label: 'Values', icon: Award, description: 'Values grid' },
  { type: 'story', label: 'Story', icon: FileText, description: 'Company story' },
  { type: 'why_choose', label: 'Why Choose Us', icon: CheckCircle, description: 'Reasons + stats' },
  { type: 'contact_form', label: 'Contact Form', icon: Mail, description: 'Contact form' },
  { type: 'contact_info', label: 'Contact Info', icon: MapPin, description: 'Contact details' },
  { type: 'blog_grid', label: 'Blog Grid', icon: Grid, description: 'Blog posts grid' },
  { type: 'category_filter', label: 'Category Filter', icon: Filter, description: 'Category filter' },
  { type: 'button', label: 'Button', icon: MousePointerClick, description: 'Standalone button' },
  { type: 'container', label: 'Container', icon: Box, description: 'Nested blocks container' },
];

interface BlockPaletteProps {
  onAddBlock: (type: BlockType) => void;
}

function DraggableBlockItem({
  block,
  onAddBlock,
}: {
  block: (typeof blockTypes)[0];
  onAddBlock: (type: BlockType) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${block.type}`,
    data: { type: 'palette', blockType: block.type },
  });

  return (
    <button
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={() => onAddBlock(block.type)}
      className={`flex items-center gap-2 p-2.5 rounded-lg border border-border hover:border-primary hover:bg-accent transition-colors text-left text-sm cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-50 ring-2 ring-primary' : ''
      }`}
    >
      <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
        <block.icon className="h-4 w-4 text-primary" />
      </div>
      <div className="min-w-0">
        <div className="font-medium text-xs truncate">{block.label}</div>
        <div className="text-[10px] text-muted-foreground truncate">{block.description}</div>
      </div>
    </button>
  );
}

export function BlockPalette({ onAddBlock }: BlockPaletteProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {blockTypes.map((block) => (
        <DraggableBlockItem
          key={block.type}
          block={block}
          onAddBlock={onAddBlock}
        />
      ))}
    </div>
  );
}
