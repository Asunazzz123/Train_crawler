import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { SearchParams, TrainTicket } from '../api';
import { RefreshCw } from 'lucide-react';

interface TrainResultsTableProps {
  trains: TrainTicket[];
  isLoading?: boolean;
  searchParams?: SearchParams;
  lastUpdateTime?: Date | null;
}

const getAvailabilityColor = (available: number | string) => {
    if (typeof available === 'string') {
        if (available === '有') return 'text-green-600';
        if (available === '无') return 'text-red-600';
        const num = parseInt(available);
        if (!isNaN(num)) return getAvailabilityColor(num);
        return 'text-yellow-600';
    }
    if (available > 20) return 'text-green-600'; // Adjusted threshold for realistic train seats often lower
    if (available > 0) return 'text-yellow-600';
    return 'text-red-600';
}

function switchBoxHS( {trains, searchParams}: TrainResultsTableProps){
  const isHighSpeed = searchParams?.highSpeed || false;
  const seatType = searchParams?.seatType || '';
  
  // 普速列车专属坐席类型
  const regularTrainOnlySeatTypes = ['软卧', '硬卧', '硬座', 'softSleeper', 'hardSleeper', 'hardSeat'];
  
  // 过滤逻辑：当isHighSpeed为false且选择普速专属坐席时，只显示普速列车(hs='n')
  const filteredTrains = (!isHighSpeed && regularTrainOnlySeatTypes.includes(seatType))
    ? trains.filter(train => train.hs === 'n')
    : trains;

  
  if(isHighSpeed){
    return (
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Train Number</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Departure</TableHead>
                <TableHead>Arrival</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>TicketKind</TableHead>
                <TableHead>Availability</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTrains.map((train, index) => (
                <TableRow key={`${train.trainNumber}-${index}`}>
                  <TableCell className="font-medium">
                    <Badge variant="outline">{train.trainNumber}</Badge>
                  </TableCell>
                  <TableCell>
                    {train.departure} → {train.destination}
                  </TableCell>
                  <TableCell>{train.departureTime}</TableCell>
                  <TableCell>{train.arrivalTime}</TableCell>
                  <TableCell>{train.duration}</TableCell>
                  <TableCell>{train.seatType}</TableCell>
                  <TableCell>
                    <span className={getAvailabilityColor(train.seatsAvailable)}>
                      {train.seatsAvailable} {typeof train.seatsAvailable === 'number' || (parseInt(train.seatsAvailable as string).toString() === train.seatsAvailable) ? 'seats' : ''}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    )
  }
  else{
    return (
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Train Number</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Departure</TableHead>
                <TableHead>Arrival</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>TicketKind</TableHead>
                <TableHead>Availability</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTrains.map((train, index) => (
                <TableRow key={`${train.trainNumber}-${index}`}>
                  <TableCell className="font-medium">
                    <Badge 
                      variant="outline" 
                      className={train.hs === 'y' ? 'text-red-600 border-red-600' : ''}
                    >
                      {train.trainNumber}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {train.departure} → {train.destination}
                  </TableCell>
                  <TableCell>{train.departureTime}</TableCell>
                  <TableCell>{train.arrivalTime}</TableCell>
                  <TableCell>{train.duration}</TableCell>
                  <TableCell>{train.seatType}</TableCell>
                  <TableCell>
                    <span className={getAvailabilityColor(train.seatsAvailable)}>
                      {train.seatsAvailable} {typeof train.seatsAvailable === 'number' || (parseInt(train.seatsAvailable as string).toString() === train.seatsAvailable) ? 'seats' : ''}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    )
  }
}

export function TrainResultsTable({ trains, isLoading, searchParams, lastUpdateTime }: TrainResultsTableProps) {
  const askTime = searchParams?.askTime || 10;
  const isHighSpeed = searchParams?.highSpeed || false;
  const seatType = searchParams?.seatType || '';
  
  // 普速列车专属坐席类型
  const regularTrainOnlySeatTypes = ['软卧', '硬卧', '硬座', 'softSleeper', 'hardSleeper', 'hardSeat'];
  
  // 过滤逻辑：当isHighSpeed为false且选择普速专属坐席时，只显示普速列车(hs='n')
  const filteredTrainCount = (!isHighSpeed && regularTrainOnlySeatTypes.includes(seatType))
    ? trains.filter(train => train.hs === 'n').length
    : trains.length;
  
  // Format time for display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-5 w-5 animate-spin mr-2 text-muted-foreground" />
            <div className="text-muted-foreground">Searching for trains...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (trains.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="text-muted-foreground">
              No trains found. Please try searching with different criteria.
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Available Trains</CardTitle>
            <CardDescription>
              Found {filteredTrainCount} {filteredTrainCount === 1 ? 'train' : 'trains'} matching your search
            </CardDescription>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <RefreshCw className="h-3 w-3" />
              <span>Auto-refresh: every {askTime}s</span>
            </div>
            {lastUpdateTime && (
              <div className="mt-1">
                Last updated: {formatTime(lastUpdateTime)}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      {switchBoxHS({ trains, searchParams, isLoading })}
    </Card>
  );
}
