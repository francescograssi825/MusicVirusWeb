import { useEffect, useState } from "react";
import { 
  AlertCircle,
  User,
  FileText,
  Calendar,
  AlertTriangle,
  Info,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Skeleton } from "../../../components/ui/skeleton";
import { Button } from "../../../components/ui/button";

interface Report {
  id: string;
  object: string;
  message: string;
  fanId: string;
  fanUsername: string;
  idEvent: string;
  eventName: string | null;
}

interface EventDetails {
  id: string;
  name: string;
  description: string;
  artist: {
    id: string;
    artistName: string;
    email: string;
  };
  genres: string[];
  merchant: {
    id: string;
    merchantName: string;
    merchantAddress: string;
    merchantDescription: string;
    merchantOffers: string;
    email: string;
  };
  amount: number;
  creationDate: string | null;
  eventDate: string;
  endFundraisingDate: string;
  pictures: string[];
  sample: string[];
  eventState: string;
  creatorToken: string | null;
  creator: string | null;
}

const ReportTypeIcons: Record<string, React.ReactNode> = {
  TECHNICAL_ISSUES_TICKET: <AlertCircle className="h-5 w-5 text-orange-500" />,
  CONTENT_REPORT: <FileText className="h-5 w-5 text-red-500" />,
  GENERAL_ISSUE: <Info className="h-5 w-5 text-blue-500" />,
};

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);
  const [eventDetails, setEventDetails] = useState<Record<string, EventDetails>>({});
  const [loadingEvents, setLoadingEvents] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('Token di autenticazione non trovato');
        }
        
        const response = await fetch('http://localhost:8085/api/report/get-reports', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Errore nel caricamento dei report');
        }
        
        const data = await response.json();
        setReports(data.reports || []);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const fetchEventDetails = async (eventId: string) => {
    if (eventDetails[eventId]) return; // Dettagli già caricati
    
    setLoadingEvents(prev => ({ ...prev, [eventId]: true }));
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Token di autenticazione non trovato');
      }
      
      const response = await fetch('http://localhost:8085/api/event/get-event', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: eventId })
      });

      if (!response.ok) {
        throw new Error('Errore nel recupero dei dettagli evento');
      }

      const eventData = await response.json();
      setEventDetails(prev => ({ ...prev, [eventId]: eventData }));
    } catch (err) {
      console.error(`Errore nel recupero dei dettagli per l'evento ${eventId}:`, err);
    } finally {
      setLoadingEvents(prev => ({ ...prev, [eventId]: false }));
    }
  };

  const toggleExpand = async (reportId: string, eventId: string) => {
    if (expandedReportId === reportId) {
      setExpandedReportId(null);
    } else {
      setExpandedReportId(reportId);
      if (eventId) {
        await fetchEventDetails(eventId);
      }
    }
  };

  const getReportTypeName = (objectType: string) => {
    const typeNames: Record<string, string> = {
      TECHNICAL_ISSUES_TICKET: "Problema Tecnico",
      CONTENT_REPORT: "Segnalazione Contenuto",
      GENERAL_ISSUE: "Problema Generale"
    };
    
    return typeNames[objectType] || objectType;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount ); 
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-1/4 mb-6" />
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                  <Skeleton className="h-8 w-24 rounded-md" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="bg-red-50 border-red-200">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <CardTitle className="text-red-600">Errore</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">{error}</p>
            <Button 
              className="mt-4" 
              onClick={() => window.location.reload()}
            >
              Riprova
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="p-6">
        <Card className="text-center py-12">
          <CardContent>
            <Info className="h-12 w-12 mx-auto text-gray-400" />
            <h3 className="mt-4 text-xl font-semibold">Nessun report disponibile</h3>
            <p className="text-gray-500 mt-2">
              Al momento non ci sono segnalazioni da visualizzare.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
   <div className="p-6 space-y-6">
  <div className="flex justify-between items-center bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
    <h1 className="text-2xl font-bold text-white">Segnalazioni</h1>
    <Badge variant="secondary" className="px-4 py-1 bg-white text-gray-800 font-medium">
      {reports.length} {reports.length === 1 ? 'segnalazione' : 'segnalazioni'}
    </Badge>
  </div>
      
      <div className="grid gap-4">
        {reports.map((report) => (
          <Card 
            key={report.id} 
            className="border-l-4 border-blue-500 overflow-hidden"
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-3">
                  <div className="mt-1">
                    {ReportTypeIcons[report.object] || <Info className="h-5 w-5 text-blue-500" />}
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {getReportTypeName(report.object)}
                    </h3>
                    <p className="text-sm text-gray-600 flex items-center mt-1">
                      <User className="h-4 w-4 mr-1" />
                      <span className="font-medium">{report.fanUsername}</span>
                      {report.eventName && (
                        <>
                          <span className="mx-2">•</span>
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>{report.eventName}</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
                
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => toggleExpand(report.id, report.idEvent)}
                >
                  {expandedReportId === report.id ? 'Mostra meno' : 'Dettagli'}
                </Button>
              </div>
              
              {expandedReportId === report.id && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-gray-700 whitespace-pre-wrap mb-4">
                    {report.message}
                  </p>
                  
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">ID Report</p>
                      <p className="font-mono text-sm break-all">{report.id}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">ID Utente</p>
                      <p className="font-mono text-sm break-all">{report.fanId}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-500">ID Evento</p>
                      <p className="font-mono text-sm break-all">{report.idEvent}</p>
                    </div>
                  </div>
                  
                  {/* Sezione Dettagli Evento */}
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <h4 className="font-semibold text-lg mb-3">Dettagli Evento</h4>
                    
                    {loadingEvents[report.idEvent] ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                      </div>
                    ) : eventDetails[report.idEvent] ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-500">Nome Evento</p>
                          <p className="font-medium">{eventDetails[report.idEvent].name}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Stato</p>
                          <Badge variant="outline" className="capitalize">
                            {eventDetails[report.idEvent].eventState.toLowerCase()}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-gray-500">Artista</p>
                          <p className="font-medium">
                            {eventDetails[report.idEvent].artist.artistName}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Esercente</p>
                          <p className="font-medium">
                            {eventDetails[report.idEvent].merchant.merchantName}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Data Evento</p>
                          <p className="font-medium">
                            {formatDate(eventDetails[report.idEvent].eventDate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Fine Raccoglimento</p>
                          <p className="font-medium">
                            {formatDate(eventDetails[report.idEvent].endFundraisingDate)}
                          </p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-gray-500">Descrizione</p>
                          <p className="text-gray-700">
                            {eventDetails[report.idEvent].description}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Genere</p>
                          <div className="flex flex-wrap gap-1">
                            {eventDetails[report.idEvent].genres.map((genre, idx) => (
                              <Badge key={idx} variant="secondary">
                                {genre}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-500">Obiettivo Finanziario</p>
                          <p className="font-medium">
                            {formatCurrency(eventDetails[report.idEvent].amount)}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">
                        Dettagli evento non disponibili
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}