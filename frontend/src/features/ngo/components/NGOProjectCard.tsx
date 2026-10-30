import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, Badge } from '../../../components/ui/FeedbackDisplay';
import { Button } from '../../../components/ui/Button';
import { Heart, Users } from 'lucide-react';
import { NGOProject } from '../services';

export interface NGOProjectCardProps {
  project: NGOProject;
  onDonate?: (project: NGOProject) => void;
}

export const NGOProjectCard: React.FC<NGOProjectCardProps> = ({ project, onDonate }) => {
  const percentRaised = Math.min(100, Math.round((project.raisedAmount / project.targetAmount) * 100));

  return (
    <Card className="flex flex-col justify-between overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-48 w-full overflow-hidden bg-slate-100">
        <img src={project.imageUrl} alt={project.title} className="h-full w-full object-cover" />
      </div>
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Badge variant="gold">{project.category}</Badge>
          <span className="text-xs font-semibold text-violet-700">{percentRaised}% Funded</span>
        </div>
        <CardTitle className="text-lg line-clamp-2">{project.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-slate-600 flex-1">
        <p className="line-clamp-3 text-xs">{project.description}</p>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full bg-violet-700 transition-all duration-500" style={{ width: `${percentRaised}%` }} />
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <span>₹{project.raisedAmount.toLocaleString('en-IN')} raised</span>
            <span>Goal: ₹{project.targetAmount.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 text-xs text-slate-500">
          <Users className="h-4 w-4 text-slate-400" />
          <span>{project.beneficiariesCount} Lives Impacted</span>
        </div>
      </CardContent>
      <CardFooter className="border-t border-slate-100 pt-3">
        <Button
          variant="primary"
          className="w-full flex items-center justify-center space-x-2"
          onClick={() => onDonate && onDonate(project)}
        >
          <Heart className="h-4 w-4" />
          <span>Support This Project</span>
        </Button>
      </CardFooter>
    </Card>
  );
};

