import { motion } from 'framer-motion';

interface ClientLogo {
  id: string;
  name: string;
  logo_url: string;
  website_url?: string;
  height?: number;
}

interface ClientsBlockProps {
  content: Record<string, unknown>;
  index: number;
}

function LogoItem({ client }: { client: ClientLogo }) {
  const logoHeight = client.height || 48;

  const img = (
    <img
      src={client.logo_url}
      alt={client.name}
      style={{ height: `${logoHeight}px` }}
      className="max-w-[180px] object-contain grayscale hover:grayscale-0 transition-all opacity-60 hover:opacity-100"
    />
  );

  if (client.website_url) {
    return (
      <a href={client.website_url} target="_blank" rel="noopener noreferrer" className="shrink-0 px-6">
        {img}
      </a>
    );
  }

  return <div className="shrink-0 px-6">{img}</div>;
}

function CarouselView({ clients }: { clients: ClientLogo[] }) {
  const duplicated = [...clients, ...clients, ...clients];

  return (
    <div className="overflow-hidden relative">
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-muted/30 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-muted/30 to-transparent z-10 pointer-events-none" />

      <div
        className="flex items-center animate-scroll-logos"
        style={{ width: 'max-content' }}
      >
        {duplicated.map((client, i) => (
          <LogoItem key={`${client.id}-${i}`} client={client} />
        ))}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scroll-logos {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        .animate-scroll-logos {
          animation: scroll-logos ${Math.max(clients.length * 3, 15)}s linear infinite;
        }
        .animate-scroll-logos:hover {
          animation-play-state: paused;
        }
      `}} />
    </div>
  );
}

export function ClientsBlock({ content, index }: ClientsBlockProps) {
  const logos = (content.logos as ClientLogo[]) || [];
  const displayStyle = (content.displayStyle as string) || 'grid';
  const titleAlign = (content.titleAlign as string) || 'center';
  const titleSize = (content.titleFontSize as number) || 24;
  const subtitleSize = (content.subtitleFontSize as number) || 16;
  const titleFont = content.titleFontFamily as string | undefined;
  const subtitleFont = content.subtitleFontFamily as string | undefined;
  const titleColor = content._titleColor as string | undefined;
  const subtitleColor = content._subtitleColor as string | undefined;

  const hasTitle = !!(content.title as string);
  const hasSubtitle = !!(content.subtitle as string);

  const alignClass = titleAlign === 'left' ? 'text-left' : titleAlign === 'right' ? 'text-right' : 'text-center';

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        {hasTitle && (
          <h2
            className={`font-bold ${alignClass} ${hasSubtitle ? 'mb-2' : logos.length > 0 ? 'mb-8' : ''}`}
            style={{
              fontSize: `${titleSize}px`,
              fontFamily: titleFont ? `'${titleFont}', sans-serif` : undefined,
              color: titleColor || undefined,
            }}
          >
            {content.title as string}
          </h2>
        )}
        {hasSubtitle && (
          <p
            className={`text-muted-foreground ${alignClass} ${logos.length > 0 ? 'mb-8' : ''}`}
            style={{
              fontSize: `${subtitleSize}px`,
              fontFamily: subtitleFont ? `'${subtitleFont}', sans-serif` : undefined,
              color: subtitleColor || undefined,
            }}
          >
            {content.subtitle as string}
          </p>
        )}

        {logos.length === 0 && !hasTitle && !hasSubtitle && (
          <div className="text-center text-muted-foreground">
            <p>No client logos added yet. Edit this block to add logos.</p>
          </div>
        )}

        {logos.length > 0 && (
          displayStyle === 'carousel' && logos.length >= 3 ? (
            <CarouselView clients={logos} />
          ) : (
            <div className="flex flex-wrap justify-center items-center gap-8">
              {logos.map((client, i) => (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + i * 0.1 }}
                >
                  <LogoItem client={client} />
                </motion.div>
              ))}
            </div>
          )
        )}
      </div>
    </section>
  );
}
