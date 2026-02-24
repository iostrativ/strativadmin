import { motion } from 'framer-motion';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { getTextStyles } from '@/lib/utils';
import type { ContactInfoBlockContent } from '@/types/database';

interface ContactInfoBlockProps {
  content: ContactInfoBlockContent;
  index: number;
}

export function ContactInfoBlock({ content, index }: ContactInfoBlockProps) {
  const { title, showFromSettings = true, email, phone, address } = content;
  const titleColor = (content as Record<string, unknown>)._titleColor as string | undefined;
  const titleCss = (content as Record<string, unknown>)._titleCss as string | undefined;
  const { data: settings } = useSiteSettings();

  // Use settings data if showFromSettings is true, otherwise use content props
  const displayEmail = showFromSettings ? settings?.email : email;
  const displayPhone = showFromSettings ? settings?.phone : phone;
  const displayAddress = showFromSettings ? settings?.address : address;

  // Don't render if no contact info available
  if (!displayEmail && !displayPhone && !displayAddress) return null;

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="max-w-4xl mx-auto"
        >
          {title && (
            <h2 
              className="text-3xl font-bold mb-8 text-center"
              style={getTextStyles(titleColor, titleCss)}
            >
              {title}
            </h2>
          )}

          <div className="grid md:grid-cols-3 gap-8">
            {displayEmail && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                  <Mail className="h-8 w-8" />
                </div>
                <h3 className="font-semibold mb-2">Email</h3>
                <a
                  href={`mailto:${displayEmail}`}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {displayEmail}
                </a>
              </motion.div>
            )}

            {displayPhone && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.2 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                  <Phone className="h-8 w-8" />
                </div>
                <h3 className="font-semibold mb-2">Phone</h3>
                <a
                  href={`tel:${displayPhone}`}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {displayPhone}
                </a>
              </motion.div>
            )}

            {displayAddress && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.3 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                  <MapPin className="h-8 w-8" />
                </div>
                <h3 className="font-semibold mb-2">Address</h3>
                <p className="text-muted-foreground">{displayAddress}</p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
