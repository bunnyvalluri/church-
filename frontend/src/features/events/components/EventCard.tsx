import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../../components/ui/FeedbackDisplay';
import { Badge } from '../../../components/ui/FeedbackDisplay';
import { Button } from '../../../components/ui/Button';
import { Calendar, MapPin, Users } from 'lucide-react';
import { ChurchEvent } from '../schemas';

export interface EventCardProps {
  event: ChurchEvent;
  onRegister?: (event: ChurchEvent) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onRegister }) => {
  const isFull = event.capacity ? event.registeredCount >= event.capacity : false;

  return (
    <Card className="flex flex-col justify-between overflow-hidden hover:shadow-md transition-shadow">
      {event.imageUrl && (
        <div className="h-48 w-full overflow-hidden bg-slate-100">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      )}
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Badge variant="default">{event.category}</Badge>
          {isFull ? (
            <Badge variant="destructive">Capacity Full</Badge>
          ) : (
            <Badge variant="success">Open for Registration</Badge>
          )}
        </div>
        <CardTitle className="line-clamp-2">{event.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-slate-600 flex-1">
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-violet-700 shrink-0" />
          <span>{new Date(event.startDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
        </div>
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-violet-700 shrink-0" />
          <span className="line-clamp-1">{event.location}</span>
        </div>
        {event.capacity && (
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-slate-400 shrink-0" />
            <span>
              {event.registeredCount} / {event.capacity} registered
            </span>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t border-slate-100 pt-4">
        <Button
          variant="primary"
          className="w-full"
          disabled={isFull}
          onClick={() => onRegister && onRegister(event)}
        >
          {isFull ? 'Sold Out' : 'Register for Event'}
        </Button>
      </CardFooter>
    </Card>
  );
};

