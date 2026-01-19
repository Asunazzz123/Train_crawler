import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Calendar } from '@/app/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover';
import { CalendarIcon, Search, StopCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { TrainInfoInput, TicketKind } from '../api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/app/components/ui/tooltip';

function switch_seat_inputbox(highSpeed: boolean, { onSeatChange, isLoading }: TicketKind): JSX.Element {
  const [kind, setkind] = useState('');

  const handleValueChange = (value: string) => {
    setkind(value);
    onSeatChange(value);
  };

  if (highSpeed) {
    return (
      <div className="space-y-2">
        <Label htmlFor="seatKind">坐席等级 *</Label>
        <Select value={kind} onValueChange={handleValueChange} disabled={isLoading}>
          <SelectTrigger id="seatKind">
            <SelectValue placeholder="选择坐席等级" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="secondClass">二等座</SelectItem>
            <SelectItem value="firstClass">一等座</SelectItem>
            <SelectItem value="specialClass">特等座</SelectItem>
            <SelectItem value="businessClass">商务座</SelectItem>
            <SelectItem value="noSeat">无座</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  } else {
    return (
      <div className="space-y-2">
        <Label htmlFor="seatKind">坐席等级 *</Label>
        <Select value={kind} onValueChange={handleValueChange} disabled={isLoading}>
          <SelectTrigger id="seatKind">
            <SelectValue placeholder="选择坐席等级" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="secondClass">二等座</SelectItem>
            <SelectItem value="firstClass">一等座</SelectItem>
            <SelectItem value="specialClass">特等座</SelectItem>
            <SelectItem value="businessClass">商务座</SelectItem>
            <SelectItem value="softSleeper">软卧</SelectItem>
            <SelectItem value="hardSleeper">硬卧</SelectItem>
            <SelectItem value="hardSeat">硬座</SelectItem>
            <SelectItem value="noSeat">无座</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  }
}

export function TrainSearchForm({ onSearch, onStop, isLoading, isSearching }: TrainInfoInput) {
  const [date, setDate] = useState<Date>();
  const [departure, setDeparture] = useState('');
  const [destination, setDestination] = useState('');
  const [highSpeed, setHighSpeed] = useState(false);
  const [studentTicket, setStudentTicket] = useState(false);
  const [askTime, setAskTime] = useState(0);
  const [strictmode, setStrictmode] = useState(false);
  const [seatType, setSeatType] = useState('');
  const [autoMonitor, setAutoMonitor] = useState(true); // 默认开启自动监控

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !departure || !destination) {
      alert('Please fill in all required fields');
      return;
    }

    onSearch({
      date: format(date, 'yyyy-MM-dd'),
      departure,
      destination,
      highSpeed,
      studentTicket,
      askTime,
      strictmode,
      seatType,
      autoMonitor,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Date Input */}
        <div className="space-y-2">
          <Label htmlFor="date">出发日期 *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, 'PPP') : <span>请选择日期</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Departure Station */}
        <div className="space-y-2">
          <Label htmlFor="departure">出发站 *</Label>
          <Input
            id="departure"
            placeholder="e.g., 北京"
            value={departure}
            onChange={(e) => setDeparture(e.target.value)}
            required
          />
        </div>

        {/* Destination Station */}
        <div className="space-y-2">
          <Label htmlFor="destination">目的地站 *</Label>
          <Input
            id="destination"
            placeholder="e.g., 上海"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            required
          />
        </div>
        {/* Seat Selection */}
        {switch_seat_inputbox(highSpeed, { onSeatChange: setSeatType, isLoading })}
        {/*Ask Time*/}
        <div className="space-y-2">
          <Label htmlFor="askTime">询问间隔 *</Label>
          <Select value={String(askTime)} onValueChange={(value) => setAskTime(Number(value))}>
            <SelectTrigger id="askTime">
              <SelectValue placeholder="选择询问间隔" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5秒</SelectItem>
              <SelectItem value="10">10秒</SelectItem>
              <SelectItem value="30">30秒</SelectItem>
              <SelectItem value="60">60秒</SelectItem>
              <SelectItem value="120">2分钟</SelectItem>
            </SelectContent>
          </Select>
        </div>

        

        {/* Options */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="highSpeed"
              checked={highSpeed}
              onCheckedChange={(checked) => setHighSpeed(checked as boolean)}
            />
            <Label
              htmlFor="highSpeed"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              仅限高铁
            </Label>
          </div>
        
          <div className="flex items-center space-x-2">
            <Checkbox
              id="studentTicket"
              checked={studentTicket}
              onCheckedChange={(checked) => setStudentTicket(checked as boolean)}
            />
            <Label
              htmlFor="studentTicket"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              学生票
            </Label>
          </div>
          <div className = "flex items-center space-x-3">
            <Checkbox id="StrictCheck"
              checked={strictmode}
              onCheckedChange={(checked) => setStrictmode(checked as boolean)}
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help">
                  <Label
                    htmlFor="StrictCheck"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                  启用严格模式
                  </Label>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>启用后，搜索将严格匹配提供的站点名称，而不是城市名称。</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="autoMonitor"
              checked={autoMonitor}
              onCheckedChange={(checked) => setAutoMonitor(checked as boolean)}
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help">
                  <Label
                    htmlFor="autoMonitor"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    无票时自动监控
                  </Label>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>启用后，当无票时，系统将自动监控余票情况，直至有票为止。</p>
              </TooltipContent>
            </Tooltip>
            
          </div>
        </div>
      </div>

      {isSearching ? (
        <Button 
          type="button" 
          variant="destructive"
          className="w-full md:w-auto" 
          onClick={onStop}
        >
          <StopCircle className="mr-2 h-4 w-4" />
          停止搜索
        </Button>
      ) : (
        <Button type="submit" className="w-full md:w-auto" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Search className="mr-2 h-4 w-4" />
          )}
          {isLoading ? '搜索中...' : '搜索火车票'}
        </Button>
      )}
    </form>
  );
}
