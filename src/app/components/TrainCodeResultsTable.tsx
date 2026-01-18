import { useState } from 'react';
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
import { TrainTicket, TrainTicketParams } from '../api';
import { RefreshCw, ChevronDown, ChevronRight } from 'lucide-react';

interface TrainCodeResultsTableProps {
  trains: TrainTicket[];
  isLoading?: boolean;
  isMonitoring?: boolean;
  isNoData?: boolean; // __NO_DATA__ 标识
  searchParams?: TrainTicketParams;
  lastUpdateTime?: Date | null;
}

// 按车次号分组票务数据
interface GroupedTrainData {
  trainNumber: string;
  primaryTicket: TrainTicket | null;  // 选定坐席等级的票
  otherTickets: TrainTicket[];        // 其他坐席等级的票
  allTickets: TrainTicket[];          // 所有票
}

const getAvailabilityColor = (available: number | string) => {
    if (typeof available === 'string') {
        if (available === '有') return 'text-green-600';
        if (available === '无') return 'text-red-600';
        const num = parseInt(available);
        if (!isNaN(num)) return getAvailabilityColor(num);
        return 'text-yellow-600';
    }
    if (available > 20) return 'text-green-600';
    if (available > 0) return 'text-yellow-600';
    return 'text-red-600';
}

// 按车次号分组数据
function groupTrainsByNumber(trains: TrainTicket[], selectedSeatType?: string): GroupedTrainData[] {
  const groupMap = new Map<string, TrainTicket[]>();
  
  // 按车次号分组
  trains.forEach(train => {
    const existing = groupMap.get(train.trainNumber) || [];
    existing.push(train);
    groupMap.set(train.trainNumber, existing);
  });
  
  // 转换为GroupedTrainData数组
  const result: GroupedTrainData[] = [];
  groupMap.forEach((tickets, trainNumber) => {
    // 查找选定坐席等级的票
    const primaryTicket = selectedSeatType 
      ? tickets.find(t => t.seatType === selectedSeatType) || null
      : tickets[0] || null;
    
    // 其他坐席等级的票
    const otherTickets = selectedSeatType
      ? tickets.filter(t => t.seatType !== selectedSeatType)
      : tickets.slice(1);
    
    result.push({
      trainNumber,
      primaryTicket,
      otherTickets,
      allTickets: tickets,
    });
  });
  
  return result;
}

// 折叠行组件 - 返回多个 TableRow 元素
function CollapsibleTrainRow({ group }: { group: GroupedTrainData }) {
  const [isOpen, setIsOpen] = useState(false);
  const hasOtherTickets = group.otherTickets.length > 0;
  
  // 如果没有选定坐席的票，显示第一个有票的
  const displayTicket = group.primaryTicket || group.allTickets[0];
  
  if (!displayTicket) return null;
  
  return (
    <>
      {/* 主行 */}
      <TableRow 
        className={hasOtherTickets ? 'cursor-pointer hover:bg-muted/50' : ''}
        onClick={hasOtherTickets ? () => setIsOpen(!isOpen) : undefined}
      >
        <TableCell className="font-medium">
          <div className="flex items-center gap-2">
            {hasOtherTickets && (
              <button 
                className="p-1 hover:bg-muted rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(!isOpen);
                }}
              >
                {isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            )}
            <Badge 
              variant="outline" 
              className={displayTicket.hs === 'y' ? 'text-red-600 border-red-600' : ''}
            >
              {displayTicket.trainNumber}
            </Badge>
            {hasOtherTickets && (
              <Badge variant="secondary" className="text-xs">
                +{group.otherTickets.length}种坐席
              </Badge>
            )}
          </div>
        </TableCell>
        <TableCell>
          {displayTicket.departure} → {displayTicket.destination}
        </TableCell>
        <TableCell>{displayTicket.departureTime}</TableCell>
        <TableCell>{displayTicket.arrivalTime}</TableCell>
        <TableCell>{displayTicket.duration}</TableCell>
        <TableCell>
          <Badge variant={group.primaryTicket ? "default" : "outline"}>
            {displayTicket.seatType}
          </Badge>
        </TableCell>
        <TableCell>
          <span className={getAvailabilityColor(displayTicket.seatsAvailable)}>
            {displayTicket.seatsAvailable} {typeof displayTicket.seatsAvailable === 'number' || (parseInt(displayTicket.seatsAvailable as string).toString() === displayTicket.seatsAvailable) ? 'seats' : ''}
          </span>
        </TableCell>
      </TableRow>
      
      {/* 折叠内容 - 其他坐席等级 */}
      {hasOtherTickets && isOpen && group.otherTickets.map((ticket, index) => (
        <TableRow 
          key={`${ticket.trainNumber}-${ticket.seatType}-${index}`}
          className="bg-muted/30"
        >
          <TableCell className="font-medium pl-12">
            <span className="text-muted-foreground">└─</span>
          </TableCell>
          <TableCell className="text-muted-foreground">
            {ticket.departure} → {ticket.destination}
          </TableCell>
          <TableCell className="text-muted-foreground">{ticket.departureTime}</TableCell>
          <TableCell className="text-muted-foreground">{ticket.arrivalTime}</TableCell>
          <TableCell className="text-muted-foreground">{ticket.duration}</TableCell>
          <TableCell>
            <Badge variant="outline">{ticket.seatType}</Badge>
          </TableCell>
          <TableCell>
            <span className={getAvailabilityColor(ticket.seatsAvailable)}>
              {ticket.seatsAvailable} {typeof ticket.seatsAvailable === 'number' || (parseInt(ticket.seatsAvailable as string).toString() === ticket.seatsAvailable) ? 'seats' : ''}
            </span>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

export function TrainCodeResultsTable({ trains, isLoading, isMonitoring, isNoData, searchParams, lastUpdateTime }: TrainCodeResultsTableProps) {
  const askTime = searchParams?.askTime || 10;
  const selectedSeatType = searchParams?.seatType;
  
  // 按车次号分组
  const groupedTrains = groupTrainsByNumber(trains, selectedSeatType);
  
  // 调试日志
  console.log('TrainCodeResultsTable - trains:', trains.length, 'groupedTrains:', groupedTrains.length);
  console.log('TrainCodeResultsTable - selectedSeatType:', selectedSeatType);
  groupedTrains.forEach(g => {
    console.log(`  ${g.trainNumber}: primary=${g.primaryTicket?.seatType}, others=${g.otherTickets.length}`);
  });
  
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
            <div className="text-muted-foreground">正在搜索车次信息...</div>
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
            {isNoData ? (
              <div className="text-muted-foreground">
                未找到车次。请尝试其他搜索条件。
              </div>
            ) : isMonitoring ? (
              <>
                <div className="flex items-center mb-2">
                  <RefreshCw className="h-5 w-5 animate-spin mr-2 text-orange-500" />
                  <div className="text-orange-600 font-medium">当前车次没有车票，正在监控车票信息...</div>
                </div>
                <div className="text-sm text-muted-foreground">
                  每 {askTime} 秒刷新一次 {lastUpdateTime && `| 最后检查: ${lastUpdateTime.toLocaleTimeString('zh-CN')}`}
                </div>
              </>
            ) : (
              <div className="text-muted-foreground">
                没有车票。
              </div>
            )}
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
            <CardTitle>车次查询结果</CardTitle>
            <CardDescription>
              找到 {groupedTrains.length} 个车次，共 {trains.length} 种票型
              {selectedSeatType && <span className="ml-2">（优先显示: {selectedSeatType}）</span>}
            </CardDescription>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <RefreshCw className="h-3 w-3" />
              <span>自动刷新: 每 {askTime}秒</span>
            </div>
            {lastUpdateTime && (
              <div className="mt-1">
                最后更新: {formatTime(lastUpdateTime)}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>车次号</TableHead>
                <TableHead>路线</TableHead>
                <TableHead>出发时间</TableHead>
                <TableHead>到达时间</TableHead>
                <TableHead>历时</TableHead>
                <TableHead>坐席等级</TableHead>
                <TableHead>余票</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groupedTrains.map((group) => (
                <CollapsibleTrainRow 
                  key={group.trainNumber} 
                  group={group}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
