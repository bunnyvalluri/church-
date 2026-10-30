'use client';

import * as React from 'react';
import { HYDERABAD_CAMPUSES, ChurchBranch } from '../services';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/FeedbackDisplay';
import { MapPin, Phone, Clock } from 'lucide-react';

export interface CampusSelectorProps {
  selectedCampusId?: string;
  onSelect?: (branch: ChurchBranch) => void;
}

export const CampusSelector: React.FC<CampusSelectorProps> = ({ selectedCampusId, onSelect }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
      {HYDERABAD_CAMPUSES.map((branch) => {
        const isSelected = selectedCampusId === branch.id;
        return (
          <Card
            key={branch.id}
            onClick={() => onSelect && onSelect(branch)}
            className={`cursor-pointer transition-all border-2 ${
              isSelected ? 'border-violet-600 ring-2 ring-violet-600/20 shadow-md' : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base text-violet-900">{branch.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2 text-xs text-slate-600">
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-violet-700 shrink-0 mt-0.5" />
                <span>{branch.address}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>{branch.phone}</span>
              </div>
              <div className="flex items-start space-x-2">
                <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  {branch.serviceTimes.map((t, idx) => (
                    <div key={idx}>{t}</div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

