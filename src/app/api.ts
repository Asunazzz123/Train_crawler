/* 车站搜索模式api轮询信息*/
export interface SearchParams {
  date: string;
  departure: string;
  destination: string;
  highSpeed: boolean;
  studentTicket: boolean;
  askTime: number;
  strictmode: boolean;
  seatType: string;
}

export interface TrainInfoInput {
  onSearch: (params: SearchParams) => void;
  onStop?: () => void;
  isLoading?: boolean;
  isSearching?: boolean;
}
/* 车次号搜索模式api轮询信息*/
export interface TrainTicketParams{
  date: string;
  trainCode: string;
  studentTicket: boolean;
  askTime: number;
}
export interface TrainTicketInput{
  onSearch: (params: TrainTicketParams) => void;
  onStop?: () => void;
  isLoading?: boolean;
  isSearching?: boolean;
}






export interface TrainTicketHS{
  date:string;
  trainCode: string;
  departure:string;
  destination:string;
  duration: number;
  secondClass: number | string;
  firstClass: number | string;
  specialClass: number | string;
  businessClass: number | string
}

// Interface matching TrainResultsTable
export interface TrainTicket {
  trainNumber: string;
  departure: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  seatsAvailable: number | string;
  seatType: string;
  hs?: string;
  date?: string; 
}

export interface TicketKind{
  onSeatChange: (kind:string) => void;
  isLoading?: boolean;
}

// Internal interface for CSV data from backend
interface RawTicketData {
  train_code: string;
  departure_station: string;
  destination_station: string;
  depart_time: string;
  arrive_time: string;
  during_time: string;
  hs: string;
  business_class?: string;
  special_class?: string;
  first_class?: string;
  second_class?: string;
  soft_sleeper?: string;
  hard_sleeper?: string;
  hard_seat?: string;
  no_seat?: string;
}

const BASE_URL = "http://localhost:5000/api";

// Stop train code crawler API
export const stopTrainCodeCrawler = async (params: TrainTicketParams): Promise<boolean> => {
  try {
    const response = await fetch(`${BASE_URL}/stop_train_code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        trainCode: params.trainCode,
        date: params.date,
        studentTicket: params.studentTicket,
      }),
    });
    const data = await response.json();
    console.log('Stop train code crawler response:', data);
    return data.status === 'success';
  } catch (error) {
    console.error('Error stopping train code crawler:', error);
    return false;
  }
};

// Fetch train info by train code (SSE)
export const fetchTrainByCode = (params: TrainTicketParams, onData: (tickets: TrainTicket[]) => void) => {
  const url = new URL(`${BASE_URL}/receive_by_code`);
  
  // Append params
  Object.keys(params).forEach(key => {
     const value = params[key as keyof TrainTicketParams];
     if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
     }
  });

  const eventSource = new EventSource(url.toString());

  console.log('SSE (TrainCode): Connecting to', url.toString());

  eventSource.onopen = () => {
    console.log('SSE (TrainCode): Connection opened, readyState:', eventSource.readyState);
  };

  eventSource.onmessage = (event) => {
    console.log('SSE (TrainCode) onmessage triggered, event.data:', event.data);
    try {
      const raw = event.data?.trim();
      if (!raw) {
        console.log('SSE (TrainCode): Empty data received');
        return;
      }
      
      // Check for error message from server
      if (raw.startsWith('{') && raw.includes('error')) {
        const errorData = JSON.parse(raw);
        if (errorData.error) {
          console.error('Server error:', errorData.error);
          eventSource.close();
          return;
        }
      }
      
      const data: RawTicketData[] = JSON.parse(raw);
      console.log('SSE (TrainCode): Parsed data array length:', data.length);
      
      if (Array.isArray(data)) {
        if (data.length === 0) {
          console.log('SSE (TrainCode): Backend returned empty array (no trains found)');
          onData([]);
          return;
        }
        
        const tickets = data.flatMap(convertRowToTickets);
        console.log('SSE (TrainCode): Converted to tickets:', tickets.length);
        
        if (tickets.length > 0) {
          onData(tickets);
        } else {
          console.warn('SSE (TrainCode): No tickets after conversion');
        }
      }
    } catch (error) {
      console.error('SSE (TrainCode): Error parsing train info:', error, 'Raw data:', event.data);
    }
  };

  eventSource.onerror = (error) => {
    console.error('SSE (TrainCode): Error event, readyState:', eventSource.readyState, 'error:', error);
    if (eventSource.readyState === EventSource.CLOSED) {
      console.log('SSE (TrainCode): Connection permanently closed');
    } else if (eventSource.readyState === EventSource.CONNECTING) {
      console.log('SSE (TrainCode): Reconnecting...');
    }
  };


  return () => {
    eventSource.close();
  };
};

// Stop crawler API
export const stopCrawler = async (params: SearchParams): Promise<boolean> => {
  try {
    const response = await fetch(`${BASE_URL}/stop`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        departure: params.departure,
        destination: params.destination,
        date: params.date,
        studentTicket: params.studentTicket,
        highSpeed: params.highSpeed,
        strictmode: params.strictmode,
      }),
    });
    const data = await response.json();
    console.log('Stop crawler response:', data);
    return data.status === 'success';
  } catch (error) {
    console.error('Error stopping crawler:', error);
    return false;
  }
};

export const fetchTrainInfo = (params: SearchParams, onData: (tickets: TrainTicket[]) => void) => {
  const url = new URL(`${BASE_URL}/receive`);
  
  // Append params
  Object.keys(params).forEach(key => {
     const value = params[key as keyof SearchParams];
     if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
     }
  });

  const eventSource = new EventSource(url.toString());

  console.log('SSE: Connecting to', url.toString());

  eventSource.onopen = () => {
    console.log('SSE: Connection opened, readyState:', eventSource.readyState);
  };

  eventSource.onmessage = (event) => {
    console.log('SSE onmessage triggered, event.data:', event.data);
    try {
      const raw = event.data?.trim();
      if (!raw) {
        console.log('SSE: Empty data received');
        return;
      }
      
      // Check for error message from server
      if (raw.startsWith('{') && raw.includes('error')) {
        const errorData = JSON.parse(raw);
        if (errorData.error) {
          console.error('Server error:', errorData.error);
          eventSource.close();
          return;
        }
      }
      
      const data: RawTicketData[] = JSON.parse(raw);
      console.log('SSE: Parsed data array length:', data.length);
      
      if (Array.isArray(data)) {
        // 如果后端明确返回空数组，表示真的没有查到车次
        if (data.length === 0) {
          console.log('SSE: Backend returned empty array (no trains found), notifying frontend');
          onData([]);
          return;
        }
        
        const tickets = data.flatMap(convertRowToTickets);
        console.log('SSE: Converted to tickets:', tickets.length);
        
        // 只有转换后有数据才通知前端，避免过滤导致的空结果触发停止
        if (tickets.length > 0) {
          onData(tickets);
        } else {
          console.warn('SSE: No tickets after conversion, raw data had', data.length, 'items (possibly filtered out)');
        }
      }
    } catch (error) {
      console.error('SSE: Error parsing train info:', error, 'Raw data:', event.data);
    }
  };

  eventSource.onerror = (error) => {
    console.error('SSE: Error event, readyState:', eventSource.readyState, 'error:', error);
    // EventSource.CONNECTING = 0, EventSource.OPEN = 1, EventSource.CLOSED = 2
    if (eventSource.readyState === EventSource.CLOSED) {
      console.log('SSE: Connection permanently closed');
    } else if (eventSource.readyState === EventSource.CONNECTING) {
      console.log('SSE: Reconnecting...');
    }
  };

  return () => {
    eventSource.close();
  };
};

function convertRowToTickets(row: RawTicketData): TrainTicket[] {
  const tickets: TrainTicket[] = [];
  const baseInfo = {
    trainNumber: row.train_code,
    departure: row.departure_station,
    destination: row.destination_station,
    departureTime: row.depart_time,
    arrivalTime: row.arrive_time,
    duration: row.during_time,
    hs: row.hs,
    price: 0, 
  };

  const addTicket = (seatType: string, count?: string) => {
    if (count && String(count).trim() !== '') {
       tickets.push({
         ...baseInfo,
         seatType,
         seatsAvailable: count 
       });
    }
  };

  addTicket('商务座', row.business_class);
  addTicket('特等座', row.special_class);
  addTicket('一等座', row.first_class);
  addTicket('二等座', row.second_class);
  addTicket('软卧', row.soft_sleeper);
  addTicket('硬卧', row.hard_sleeper);
  addTicket('硬座', row.hard_seat);
  addTicket('无座', row.no_seat);

  return tickets;
}

export const postSearchTrains = async (params: SearchParams) => {
  // Try to use GET to avoid method mismatch if endpoint is GET only
  const url = new URL(`${BASE_URL}/receive`);
   Object.keys(params).forEach(key => {
     const value = params[key as keyof SearchParams];
     if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
     }
  });
  const res = await fetch(url.toString());
  // The endpoint returns a stream usually, so fetch might hang if not handled as stream.
  // But if the backend implementation checks 'AskTime', it loops.
  // This legacy function is tricky. 
  // If we just need to TRIGGER start, maybe load_crawler?
  return {}; 
};
