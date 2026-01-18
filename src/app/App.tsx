import { useState, useRef, useEffect } from 'react';
import { TrainSearchForm } from '@/app/components/TrainSearchForm';
import { TrainSearchForm as TrainCodeSearch } from '@/app/components/TrainCodeSearch';
import { TrainResultsTable } from '@/app/components/TrainResultsTable';
import { TrainCodeResultsTable } from '@/app/components/TrainCodeResultsTable';
import { fetchTrainInfo, stopCrawler, fetchTrainByCode, stopTrainCodeCrawler, TrainTicket, SearchParams, TrainTicketParams } from './api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Train } from 'lucide-react';
import { Sidebar } from "@/app/components/Sidebar";

export default function App() {
  const [trains, setTrains] = useState<TrainTicket[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeMode,setActiveMode]=useState('standard');
  const [currentSearchParams, setCurrentSearchParams] = useState<SearchParams>();
  const [currentTrainCodeParams, setCurrentTrainCodeParams] = useState<TrainTicketParams>();
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false); // ticket模式下，无票时的监控状态
  const [isNoData, setIsNoData] = useState(false); // __NO_DATA__ 标识
  const cleanupRef = useRef<() => void>();
  const trainCodeCleanupRef = useRef<() => void>();
  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
      if (trainCodeCleanupRef.current) {
        trainCodeCleanupRef.current();
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
    setIsMonitoring(false);
    setIsNoData(false);

    const searchParams: SearchParams = {
      ...params,
      askTime: params.askTime || 10,
      strictmode: params.strictmode ?? false,
      seatType: params.seatType || '二等座'
    };
    setCurrentSearchParams(searchParams);

    try {
       const stop = fetchTrainInfo(searchParams, (newTickets, noDataFlag) => {
           setIsLoading(false); 
           
           // 检查是否是 __NO_DATA__ 标识
           if (noDataFlag) {
             console.log('Received __NO_DATA__ marker, no trains available for this route');
             setIsNoData(true);
             setIsMonitoring(false);
             // 1秒后停止搜索
             setTimeout(async () => {
               if (cleanupRef.current) {
                 cleanupRef.current();
                 cleanupRef.current = undefined;
               }
               if (searchParams) {
                 await stopCrawler(searchParams);
               }
               setIsSearching(false);
             }, 1000);
             return;
           }
           
           // 如果收到空数组（有数据但无票）
           if (newTickets.length === 0) {
             // 根据 autoMonitor 参数决定是否继续监控
             if (searchParams.autoMonitor !== false) {
               console.log('No tickets found, continuing to monitor...');
               setIsMonitoring(true);
               setIsNoData(false);
               setLastUpdateTime(new Date());
             } else {
               console.log('No tickets found, auto-monitor disabled, stopping in 1 second...');
               setTimeout(async () => {
                 if (cleanupRef.current) {
                   cleanupRef.current();
                   cleanupRef.current = undefined;
                 }
                 if (searchParams) {
                   await stopCrawler(searchParams);
                 }
                 setIsSearching(false);
               }, 1000);
             }
             return;
           }
           
           // 有票时取消监控状态
           setIsMonitoring(false);
           setIsNoData(false);
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
    setIsMonitoring(false);
    setIsNoData(false);
  };

  // 车次号搜索处理函数
  const handleTrainCodeSearch = async (params: TrainTicketParams) => {
    // Cleanup previous stream
    if (trainCodeCleanupRef.current) {
      trainCodeCleanupRef.current();
    }

    setIsLoading(true);
    setIsSearching(true);
    setHasSearched(true);
    setTrains([]);
    setLastUpdateTime(null);
    setIsMonitoring(false);
    setIsNoData(false);

    const searchParams: TrainTicketParams = {
      ...params,
      askTime: params.askTime || 10,
    };
    setCurrentTrainCodeParams(searchParams);

    try {
      const stop = fetchTrainByCode(searchParams, (newTickets, noDataFlag) => {
        setIsLoading(false);
        
        // 检查是否是 __NO_DATA__ 标识
        if (noDataFlag) {
          console.log('Received __NO_DATA__ marker, no trains available for this route');
          setIsNoData(true);
          setIsMonitoring(false);
          setTimeout(async () => {
            if (trainCodeCleanupRef.current) {
              trainCodeCleanupRef.current();
              trainCodeCleanupRef.current = undefined;
            }
            if (searchParams) {
              await stopTrainCodeCrawler(searchParams);
            }
            setIsSearching(false);
          }, 1000);
          return;
        }
        
        if (newTickets.length === 0) {
          // 根据autoMonitor参数决定是否继续监控
          if (searchParams.autoMonitor !== false) {
            // 开启自动监控：继续轮询
            console.log('No tickets found for train code, continuing to monitor...');
            setIsMonitoring(true);
            setIsNoData(false);
            setLastUpdateTime(new Date());
          } else {
            // 关闭自动监控：1秒后停止搜索
            console.log('No tickets found, auto-monitor disabled, stopping in 1 second...');
            setTimeout(async () => {
              if (trainCodeCleanupRef.current) {
                trainCodeCleanupRef.current();
                trainCodeCleanupRef.current = undefined;
              }
              if (searchParams) {
                await stopTrainCodeCrawler(searchParams);
              }
              setIsSearching(false);
            }, 1000);
          }
          return;
        }
        
        // 有票时取消监控状态
        setIsMonitoring(false);
        setIsNoData(false);
        setTrains(newTickets);
        setLastUpdateTime(new Date());
      });
      trainCodeCleanupRef.current = stop;

    } catch (error) {
      console.error("Error starting train code stream", error);
      setIsLoading(false);
      setIsSearching(false);
      alert('Failed to connect to the server. Please check if backend is running.');
    }
  };

  const handleTrainCodeStop = async () => {
    if (trainCodeCleanupRef.current) {
      trainCodeCleanupRef.current();
      trainCodeCleanupRef.current = undefined;
    }
    
    if (currentTrainCodeParams) {
      await stopTrainCodeCrawler(currentTrainCodeParams);
    }
    
    setIsLoading(false);
    setIsSearching(false);
    setIsMonitoring(false);
    setIsNoData(false);
  };

  const renderContent = () => {
    switch (activeMode) {
      case 'standard':
        return (
          <>
            {/* Search Form */}
            <Card className="shadow-2xl backdrop-blur-sm bg-white/95">
              <CardHeader>
                <CardTitle>车站搜索</CardTitle>
                <CardDescription>
                  Enter your travel details to find available trains efficiently.
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
                  isMonitoring={isMonitoring}
                  isNoData={isNoData}
                  searchParams={currentSearchParams}
                  lastUpdateTime={lastUpdateTime}
                />
              </div>
            )}
          </>
        );
      case 'ticket':
        return (
          <>
            <Card className="shadow-2xl backdrop-blur-sm bg-white/95">
              <CardHeader>
                <CardTitle>车次号搜索</CardTitle>
                <CardDescription>
                  通过车次号直接搜索列车信息和余票情况
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TrainCodeSearch
                  onSearch={handleTrainCodeSearch}
                  onStop={handleTrainCodeStop}
                  isLoading={isLoading}
                  isSearching={isSearching}
                />
              </CardContent>
            </Card>

            {/* Results Table */}
            {hasSearched && (
              <div className="shadow-2xl backdrop-blur-sm bg-white/95 rounded-lg">
                <TrainCodeResultsTable
                  trains={trains}
                  isLoading={isLoading}
                  isMonitoring={isMonitoring}
                  isNoData={isNoData}
                  searchParams={currentTrainCodeParams}
                  lastUpdateTime={lastUpdateTime}
                />
              </div>
            )}
          </>
        );
      case 'subway':
        return (
          <Card className="shadow-2xl backdrop-blur-sm bg-white/95">
            <CardHeader>
              <CardTitle>地铁搜索</CardTitle>
              <CardDescription>
                Search for subway routes and schedules.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="py-8 text-center text-muted-foreground">
                Subway search coming soon...
              </div>
            </CardContent>
          </Card>
        );
      
      case 'advanced':
        return (
          <Card className="shadow-2xl backdrop-blur-sm bg-white/95">
            <CardHeader>
              <CardTitle>高级爬虫</CardTitle>
              <CardDescription>
                Configure advanced crawling options for multiple routes and schedules.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="py-8 text-center text-muted-foreground">
                Advanced crawler features coming soon...
              </div>
            </CardContent>
          </Card>
        );
      
     
      default:
        return null;
    }
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
      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Train className="h-8 w-8 text-white drop-shadow-lg" />
            <h1 className="text-4xl font-bold text-white drop-shadow-lg">Train Ticket Crawler</h1>
          </div>
          <p className="text-white/90 drop-shadow-md">
            Search for available train tickets across China
          </p>
        </div>

        {/* Main Content with Sidebar */}
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <Sidebar activeMode={activeMode} onModeChange={setActiveMode} />
          </div>

          {/* Main Content Area */}
          <div className="flex-1 space-y-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
