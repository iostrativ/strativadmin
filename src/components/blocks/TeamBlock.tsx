import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTeamMembers } from '@/hooks/useTeam';
import { getTextStyles } from '@/lib/utils';

interface TeamBlockProps {
  content: Record<string, unknown>;
  index: number;
}

export function TeamBlock({ content, index }: TeamBlockProps) {
  const { data: team } = useTeamMembers(true);
  const titleColor = content._titleColor as string | undefined;
  const titleCss = content._titleCss as string | undefined;
  const subtitleColor = content._subtitleColor as string | undefined;
  const subtitleCss = content._subtitleCss as string | undefined;

  if (!team?.length) return null;

  const limit = (content.limit as number) || team.length;
  const memberIds = content.memberIds as string[] | undefined;
  const columns = (content.columns as 2 | 3 | 4) || 4;

  let filteredTeam = team;

  if (memberIds && memberIds.length > 0) {
    filteredTeam = team.filter(m => memberIds.includes(m.id));
  }

  const displayTeam = filteredTeam.slice(0, limit);

  const gridCols = {
    2: 'grid-cols-2 md:grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  }[columns];

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        {content.title && (
          <h2 
            className="text-3xl font-bold mb-4 text-center"
            style={getTextStyles(titleColor, titleCss)}
          >
            {content.title as string}
          </h2>
        )}
        {content.subtitle && (
          <p 
            className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto"
            style={getTextStyles(subtitleColor, subtitleCss)}
          >
            {content.subtitle as string}
          </p>
        )}
        <div className={`grid ${gridCols} gap-6`}>
          {displayTeam.map((member, i) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + i * 0.1 }}
              className="text-center"
            >
              <Avatar className="w-24 h-24 mx-auto mb-4">
                <AvatarImage src={member.avatar_url || undefined} />
                <AvatarFallback className="text-2xl">{member.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <h3 className="font-semibold">{member.name}</h3>
              <p className="text-sm text-muted-foreground">{member.role}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
