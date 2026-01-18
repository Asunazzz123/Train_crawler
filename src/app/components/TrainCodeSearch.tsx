import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Calendar } from '@/app/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover';
import { CalendarIcon, Search, StopCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { TrainTicketInput, TicketKind } from '../api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';

// 坐席等级选择组件
function SeatTypeSelector({ onSeatChange, isLoading }: TicketKind): JSX.Element {
  const [kind, setKind] = useState('二等座');

  const handleValueChange = (value: string) => {
    setKind(value);
    onSeatChange(value);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="seatKind">坐席等级</Label>
      <Select value={kind} onValueChange={handleValueChange} disabled={isLoading}>
        <SelectTrigger id="seatKind">
          <SelectValue placeholder="选择坐席等级" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="二等座">二等座</SelectItem>
          <SelectItem value="一等座">一等座</SelectItem>
          <SelectItem value="特等座">特等座</SelectItem>
          <SelectItem value="商务座">商务座</SelectItem>
          <SelectItem value="软卧">软卧</SelectItem>
          <SelectItem value="硬卧">硬卧</SelectItem>
          <SelectItem value="硬座">硬座</SelectItem>
          <SelectItem value="无座">无座</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}


export function TrainSearchForm({ onSearch, onStop, isLoading, isSearching }: TrainTicketInput) {
    const [date, setDate] = useState<Date>();
    const [trainCode, setTrainCode] = useState('');
    const [studentTicket, setStudentTicket] = useState(false);
    const [askTime, setAskTime] = useState(10);
    const [seatType, setSeatType] = useState('二等座');
    const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !trainCode ) {
      alert('Please fill in all required fields');
      return;
    }

    onSearch({
      date: format(date, 'yyyy-MM-dd'),
      trainCode,
      studentTicket,
      askTime,
      seatType,
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
            <Label htmlFor="departure">车次号 *</Label>
            <Input
              id="departure"
              placeholder="e.g., G101"
              value={trainCode}
              onChange={(e) => setTrainCode(e.target.value)}
              required
            />
          </div>
  
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

          {/* Seat Type Selection */}
          <SeatTypeSelector onSeatChange={setSeatType} isLoading={isLoading} />

          
  
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