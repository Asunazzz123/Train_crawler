import { useState, useRef, useEffect } from 'react';
import { TrainSearchForm } from '@/app/components/TrainSearchForm';
import { TrainResultsTable } from '@/app/components/TrainResultsTable';
import { fetchTrainInfo, stopCrawler, TrainTicket, SearchParams } from './api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Train } from 'lucide-react';


export default function App() {
  const [trains, setTrains] = useState<TrainTicket[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentSearchParams, setCurrentSearchParams] = useState<SearchParams>();
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  const cleanupRef = useRef<() => void>();

  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);

  const handleSearch = async (params: SearchParams) => {
    // Cleanup previous stream
    if (cleanupRef.current) {
        cleanupRef.current();
    }

    setIsLoading(true);
    setIsSearching(true);
    setHasSearched(true);
    setTrains([]);
    setLastUpdateTime(null);

    const searchParams: SearchParams = {
      ...params,
      askTime: params.askTime || 10,
      strictmode: params.strictmode ?? false,
      seatType: params.seatType || '二等座'
    };
    setCurrentSearchParams(searchParams);

    try {
       const stop = fetchTrainInfo(searchParams, (newTickets) => {
           setIsLoading(false); 
           
           // 如果收到空数组，等待1秒后自动停止搜索
           if (newTickets.length === 0) {
             console.log('No trains found, stopping search in 1 second...');
             setTimeout(async () => {
               // Close SSE connection
               if (cleanupRef.current) {
                 cleanupRef.current();
                 cleanupRef.current = undefined;
               }
               // Stop backend crawler
               if (searchParams) {
                 await stopCrawler(searchParams);
               }
               setIsSearching(false);
             }, 1000);
             return;
           }
           
           // Replace tickets with new data (each SSE event is a fresh query result)
           // This ensures we show the latest ticket availability instead of accumulating
           setTrains(newTickets);
           setLastUpdateTime(new Date());
       });
       cleanupRef.current = stop;

    } catch (error) {
       console.error("Error starting stream", error);
       setIsLoading(false);
       setIsSearching(false);
       alert('Failed to connect to the server. Please check if backend is running.');
    }
  };

  const handleStop = async () => {
    // Close SSE connection
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = undefined;
    }
    
    // Stop backend crawler
    if (currentSearchParams) {
      await stopCrawler(currentSearchParams);
    }
    
    setIsLoading(false);
    setIsSearching(false);
  };

  return (
    <div className="min-h-screen relative py-8 px-4">
      {/* Background Image */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1767788326477-d02cb940405a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFpbiUyMHN0YXRpb24lMjBzY2VuaWN8ZW58MXx8fHwxNzY4NTI5MzYyfDA&ixlib=rb-4.1.0&q=80&w=1080)',
        }}
      >
        {/* Overlay for better readability */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Train className="h-8 w-8 text-white drop-shadow-lg" />
            <h1 className="text-4xl font-bold text-white drop-shadow-lg">Train Ticket Crawler</h1>
          </div>
          
        </div>

        {/* Search Form */}
        <Card className="shadow-2xl backdrop-blur-sm bg-white/95">
          <CardHeader>
            <CardTitle>Search Trains</CardTitle>
            <CardDescription>
              Enter your travel details to find available trains
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TrainSearchForm 
              onSearch={handleSearch} 
              onStop={handleStop}
              isLoading={isLoading} 
              isSearching={isSearching}
            />
          </CardContent>
        </Card>

        {/* Results Table */}
        {hasSearched && (
          <div className="shadow-2xl backdrop-blur-sm bg-white/95 rounded-lg">
            <TrainResultsTable 
              trains={trains} 
              isLoading={isLoading} 
              searchParams={currentSearchParams}
              lastUpdateTime={lastUpdateTime}
            />
          </div>
        )}
      </div>
    </div>
  );
}
