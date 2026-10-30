import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, Badge } from '../../../components/ui/FeedbackDisplay';
import { Button } from '../../../components/ui/Button';
import { PlayCircle, Clock, BookOpen, Share2 } from 'lucide-react';
import { SermonItem } from '../services';

export interface SermonCardProps {
  sermon: SermonItem;
  onPlay?: (sermon: SermonItem) => void;
}

export const SermonCard: React.FC<SermonCardProps> = ({ sermon, onPlay }) => {
  return (
    <Card className="flex flex-col justify-between overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative aspect-video w-full overflow-hidden bg-slate-900 group">
        {sermon.thumbnailUrl ? (
          <img
            src={sermon.thumbnailUrl}
            alt={sermon.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 opacity-90 group-hover:opacity-100"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-violet-950 text-violet-300">
            <PlayCircle className="h-12 w-12 opacity-80" />
          </div>
        )}
        <div className="absolute bottom-2 right-2 rounded bg-black/75 px-1.5 py-0.5 text-[11px] font-semibold text-white">
          {sermon.durationMinutes} min
        </div>
      </div>

      <CardHeader>
        <div className="flex items-center justify-between mb-1.5">
          <Badge variant="secondary" className="uppercase text-[10px]">
            {sermon.language}
          </Badge>
          <span className="text-xs text-slate-500">
            {new Date(sermon.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
          </span>
        </div>
        <CardTitle className="text-base line-clamp-2">{sermon.title}</CardTitle>
        <p className="text-xs font-medium text-violet-700">{sermon.speaker}</p>
      </CardHeader>

      {sermon.biblePassage && (
        <CardContent className="pt-0 text-xs text-slate-500 flex items-center space-x-1.5">
          <BookOpen className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span>{sermon.biblePassage}</span>
        </CardContent>
      )}

      <CardFooter className="border-t border-slate-100 pt-3">
        <Button
          variant="outline"
          size="sm"
          className="w-full flex items-center justify-center space-x-2"
          onClick={() => onPlay && onPlay(sermon)}
        >
          <PlayCircle className="h-4 w-4 text-violet-700" />
          <span>Watch Sermon</span>
        </Button>
      </CardFooter>
    </Card>
  );
};
