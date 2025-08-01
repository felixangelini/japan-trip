'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Clock, MapPin, Share, MoreVertical, Edit, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { Activity, Stop } from '@/lib/types/database';

interface ActivityCardProps {
  activity: Activity;
  stop: Stop | undefined;
  onEdit: (activity: Activity) => void;
  onDelete: (activity: Activity) => void;
  onShare: (url: string) => void;
}

export function ActivityCard({ activity, stop, onEdit, onDelete, onShare }: ActivityCardProps) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const hasDescription = activity.description && activity.description.trim().length > 0;
  const hasExternalLink = activity.external_link && activity.external_link.trim().length > 0;

  const toggleDescription = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className="group relative min-h-20 overflow-hidden">
      {/* Background with gradient and stop image */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-white via-white to-white"
        style={{
          backgroundImage: stop?.image_url 
            ? `linear-gradient(180deg, white 0%, white calc(100% - 88px), transparent 100%), url(${stop.image_url})`
            : 'linear-gradient(white 0%, white 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'left',
          backgroundRepeat: 'no-repeat',
        }}
      />
      
      {/* Content overlay */}
      <div className="relative z-10 p-4 h-full flex flex-col">
        <div className="flex items-start justify-between gap-3 flex-1">
          <div className="flex-1 min-w-0">
            {/* Title and Time Row */}
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center text-sm text-muted-foreground shrink-0">
                <Clock className="h-4 w-4 mr-1" />
                <span>
                  {activity.scheduled_at ? formatTime(activity.scheduled_at) : '-'}
                </span>
              </div>
              <h3 className="font-semibold text-lg truncate">{activity.title}</h3>
              
              {hasExternalLink && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 shrink-0"
                  onClick={() => onShare(activity.external_link!)}
                >
                  <Share className="h-3 w-3" />
                </Button>
              )}
            </div>

            {/* Description */}
            {hasDescription && (
              <div className="mb-2">
                <p className={`text-muted-foreground text-sm ${isDescriptionExpanded ? '' : 'line-clamp-1'}`}>
                  {activity.description}
                </p>
                {activity.description!.length > 100 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 p-0 text-xs text-muted-foreground hover:text-foreground"
                    onClick={toggleDescription}
                  >
                    {isDescriptionExpanded ? (
                      <>
                        Mostra meno <ChevronUp className="h-3 w-3 ml-1" />
                      </>
                    ) : (
                      <>
                        Mostra di più <ChevronDown className="h-3 w-3 ml-1" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}

            {/* Location */}
            {activity.location_name && (
              <div className="flex items-center text-sm text-white">
                <MapPin className="h-4 w-4 mr-2 shrink-0" />
                <span className="truncate">{activity.location_name}</span>
              </div>
            )}
          </div>

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(activity)}>
                <Edit className="h-4 w-4 mr-2" />
                Modifica
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(activity)}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Elimina
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stop name overlay in the image area */}
      {stop && (
        <div className="absolute bottom-0 right-0 h-16+ flex items-end p-3">
          <div className="flex items-center text-white text-sm">
            <span className="font-medium">{stop.title}</span>
          </div>
        </div>
      )}
    </Card>
  );
} 