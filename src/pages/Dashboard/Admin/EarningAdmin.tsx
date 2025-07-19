import { useEffect, useState } from "react";
import { 
  Calendar, 
  DollarSign, 
  CreditCard, 
  Percent,
  BarChart2
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import ModalCommission from "./ModalCommission";

interface AdminPayment {
  id: string;
  amount: number;
  currency: string;
  payoutBatchId: string;
  payoutItemId: string;
  eventId: string;
  createdDate: string | null;
  note: string;
  errorDetails: string;
  status: 'SUCCESS' | 'ERROR'; // Campo derivato
}

interface ChartData {
  date: string;
  amount: number;
  cumulative: number;
  index?: number;
}

export default function AdminEarningsDashboard() {
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasValidDates, setHasValidDates] = useState(false);
  const [commission, setCommission] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmittingCommission, setIsSubmittingCommission] = useState(false);
  const [commissionError, setCommissionError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('http://localhost:8086/api/admin/admin-payments', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error('Errore nel caricamento dei pagamenti');
        
        const data = await response.json();
        const processedPayments = data.payments.map((p: any) => ({
          ...p,
          amount: Number(p.amount), // Converti BigDecimal in number
          createdDate: p.createdDate ? new Date(p.createdDate) : null,
          status: p.errorDetails ? 'ERROR' : 'SUCCESS' // Deriva lo stato
        }));
        
        setPayments(processedPayments);
        prepareChartData(processedPayments);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);


    useEffect(() => {
    const fetchCommission = async () => {
      try {
        const response = await fetch('http://localhost:8086/api/admin/commission', {
          
        });

        if (!response.ok) throw new Error('Errore nel caricamento dei pagamenti');
        
        const data = await response.json();
        setCommission(data.commission);
        
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchCommission();
  }, []);

  const handleSaveCommission = async (newCommission: number) => {
    setIsSubmittingCommission(true);
    setCommissionError(null);
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:8086/api/admin/put-commission', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ commission: newCommission })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Errore nell\'aggiornamento della commissione');
      }

  
      setCommission(newCommission);
      setIsModalOpen(false);
    } catch (err) {
      setCommissionError((err as Error).message);
    } finally {
      setIsSubmittingCommission(false);
    }
  };


  const prepareChartData = (payments: AdminPayment[]) => {
    const validDates = payments.some(p => p.createdDate !== null);
    setHasValidDates(validDates);
    
    let sortedPayments = [...payments];
    
    if (validDates) {
      sortedPayments.sort((a, b) => 
        new Date(a.createdDate || 0).getTime() - new Date(b.createdDate || 0).getTime()
      );
    }
    
    let cumulativeAmount = 0;
    const data: ChartData[] = [];
    
    sortedPayments.forEach((payment, index) => {
      cumulativeAmount += payment.amount;
      
      const dateLabel = payment.createdDate
        ? new Date(payment.createdDate).toLocaleDateString('it-IT', {
            day: '2-digit',
            month: 'short'
          })
        : `Pagamento ${index + 1}`;
      
      data.push({
        date: dateLabel,
        amount: payment.amount,
        cumulative: cumulativeAmount
      });
    });
    
    setChartData(data);
  };

  // Calcola le metriche
  const totalEarnings = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalPayments = payments.length;
  const successfulPayments = payments.filter(p => p.status === 'SUCCESS').length;


  
  // Filtra i pagamenti recenti (ultimi 5)
  const recentPayments = [...payments]
    .sort((a, b) => 
      new Date(b.createdDate || 0).getTime() - new Date(a.createdDate || 0).getTime()
    )
    .slice(0, 5);

  if (loading) return <div className="p-6 text-center">Caricamento pagamenti...</div>;
  if (error) return <div className="p-6 text-red-500">Errore: {error}</div>;

  return (
    <div className="space-y-6 p-6">
      <div className="bg-gradient-to-r from-purple-900 to-indigo-800 p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-white">Dashboard Pagamenti Admin</h1>
        <p className="text-indigo-200">
          Panoramica di tutti i pagamenti di sistema
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Totale Incassi
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{(totalEarnings).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Totale pagamenti ricevuti
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pagamenti Totali
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPayments}</div>
            <p className="text-xs text-muted-foreground">
              {successfulPayments} completati
            </p>
          </CardContent>
        </Card>
        
             <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ultimo Pagamento
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {recentPayments[0] ? `€${(recentPayments[0].amount).toFixed(2)}` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {recentPayments[0]?.createdDate 
                ? new Date(recentPayments[0].createdDate).toLocaleDateString('it-IT') 
                : 'Data non disponibile'}
            </p>
          </CardContent>
        </Card>

          <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Percentuale commissione
          </CardTitle>
          <Percent className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{commission * 100}%</div>
          <p className="text-xs text-muted-foreground">
            <Button onClick={() => setIsModalOpen(true)}>Modifica</Button>
          </p>
        </CardContent>
      </Card>

      {/* Modal per la modifica della commissione */}
      <ModalCommission
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setCommissionError(null);
        }}
        currentCommission={commission}
        onSave={handleSaveCommission}
        isSubmitting={isSubmittingCommission}
        error={commissionError || undefined}
      />
        
   
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Andamento Incassi</CardTitle>
                <CardDescription>
                  {hasValidDates 
                    ? "Storico dei pagamenti nel tempo" 
                    : "Sequenza dei pagamenti ricevuti"}
                </CardDescription>
              </div>
              <BarChart2 className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="pl-2 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickMargin={10}
                />
                <YAxis 
                  tickFormatter={(value: number) => `€${(value).toFixed(0)}`}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value: any) => [`€${(Number(value)).toFixed(2)}`, 'Valore']}
                  labelFormatter={(label: any) => `Data: ${label}`}
                  contentStyle={{ 
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="cumulative" 
                  name="Incasso Cumulativo"
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  name="Singolo Pagamento"
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Pagamenti Recenti</CardTitle>
            <CardDescription>
              Ultime 5 transazioni
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPayments.map((payment) => (
                <div 
                  key={payment.id} 
                  className={`border-l-4 pl-4 py-2 ${
                    payment.status === 'SUCCESS' 
                      ? 'border-green-500' 
                      : 'border-red-500'
                  }`}
                >
                  <h4 className="font-semibold flex justify-between">
                    <span>€{(payment.amount).toFixed(2)}</span>
                    <span className={`text-xs font-normal px-2 py-1 rounded-full ${
                      payment.status === 'SUCCESS' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {payment.status}
                    </span>
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {payment.createdDate 
                      ? new Date(payment.createdDate).toLocaleDateString('it-IT', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })
                      : 'Data non disponibile'}
                  </p>
                  <p className="text-sm truncate" title={`Event ID: ${payment.eventId}`}>
                    Evento: {payment.eventId}
                  </p>
                  {payment.note && (
                    <p className="text-xs text-muted-foreground truncate" title={payment.note}>
                      {payment.note}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground truncate" title={payment.payoutBatchId}>
                    Batch: {payment.payoutBatchId}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}