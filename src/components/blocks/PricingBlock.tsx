import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getButtonStyles, getButtonClassName } from '@/lib/buttonStyles';
import { getTextStyles } from '@/lib/utils';
import type { ButtonColorConfig } from '@/types/database';

interface PricingBlockProps {
  content: Record<string, unknown>;
  index: number;
}

export function PricingBlock({ content, index }: PricingBlockProps) {
  const plans = (content.plans as Array<{
    name: string;
    price: string;
    period?: string;
    description?: string;
    features: string[];
    buttonText?: string;
    buttonUrl?: string;
    isHighlighted?: boolean;
    _buttonColor?: ButtonColorConfig;
  }>) || [];
  const titleColor = content._titleColor as string | undefined;
  const titleCss = content._titleCss as string | undefined;
  const subtitleColor = content._subtitleColor as string | undefined;
  const subtitleCss = content._subtitleCss as string | undefined;

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {content.title && (
          <h2 
            className="text-3xl md:text-4xl font-bold text-center mb-4"
            style={getTextStyles(titleColor, titleCss)}
          >
            {content.title as string}
          </h2>
        )}
        {content.subtitle && (
          <p 
            className="text-xl text-center text-muted-foreground mb-12"
            style={getTextStyles(subtitleColor, subtitleCss)}
          >
            {content.subtitle as string}
          </p>
        )}
        <div className={`grid gap-8 max-w-6xl mx-auto ${
          plans.length === 1 ? 'md:grid-cols-1 max-w-md' :
          plans.length === 2 ? 'md:grid-cols-2 max-w-3xl' :
          'md:grid-cols-2 lg:grid-cols-3'
        }`}>
          {plans.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + idx * 0.1 }}
              className={`bg-background rounded-xl border p-8 flex flex-col ${
                plan.isHighlighted ? 'ring-2 ring-primary shadow-lg scale-105' : ''
              }`}
            >
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.period && <span className="text-muted-foreground ml-1">{plan.period}</span>}
              </div>
              {plan.description && (
                <div 
                  className="text-muted-foreground mb-6"
                  dangerouslySetInnerHTML={{ __html: plan.description }}
                />
              )}
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              {plan.buttonText && (
                <Link to={plan.buttonUrl || '#'} className="block">
                  <Button
                    size="lg"
                    variant={plan._buttonColor?.mode === 'custom' ? 'default' : (plan.isHighlighted ? 'default' : 'outline')}
                    style={getButtonStyles(plan._buttonColor)}
                    className={`w-full ${getButtonClassName(plan._buttonColor)}`}
                  >
                    {plan.buttonText}
                  </Button>
                </Link>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
