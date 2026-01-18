import { Search, Settings, Ticket, TramFront} from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { cn } from '@/app/components/ui/utils';

interface SidebarProps {
  activeMode: string;
  onModeChange: (mode: string) => void;
}

export function Sidebar({ activeMode, onModeChange }: SidebarProps) {
  const modes = [
    {
      id: 'standard',
      label: '车站搜索',
      icon: Search,
    },
    {
      id: 'ticket',
      label: '车次号搜索',
      icon : Ticket,
    },
     {
      id: 'subway',
      label: '地铁搜索',
      icon: TramFront,
    },
    {
      id: 'advanced',
      label: '高级爬虫',
      icon: Settings,
    },
   

  ];

  return (
    <Card className="h-full shadow-2xl backdrop-blur-sm bg-white/95 p-4">
      {/* Crawler Modes Section */}
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Crawler Modes
        </h3>
        <div className="space-y-1">
          {modes.map((mode) => {
            const Icon = mode.icon;
            const isActive = activeMode === mode.id;
            
            return (
              <Button
                key={mode.id}
                variant="ghost"
                className={cn(
                  'w-full justify-start gap-3 h-10',
                  isActive && 'bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700'
                )}
                onClick={() => onModeChange(mode.id)}
              >
                <Icon className={cn('h-4 w-4', isActive && 'text-blue-600')} />
                <span>{mode.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </Card>
  );
}