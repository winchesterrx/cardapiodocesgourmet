import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogOut, MapPin, Phone } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export default function Entregador() {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'courier') {
      navigate('/login');
    }
  }, [user, navigate]);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['courier-orders'],
    queryFn: async () => {
      const res = await fetch('http://localhost:3000/api/orders');
      if (!res.ok) throw new Error('Erro ao buscar pedidos');
      const allOrders = await res.json();
      return allOrders.filter((o: any) => o.courierId === user?.id && o.status === 'Despachado');
    },
    refetchInterval: 10000,
    enabled: !!user
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white shadow-sm p-4 sticky top-0 z-10 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Painel do Entregador</h1>
          <p className="text-sm text-gray-500">Olá, {user.name}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={handleLogout}>
          <LogOut className="h-5 w-5" />
        </Button>
      </header>

      <main className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-500">Entregas Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{orders.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-500">Taxa por Entrega</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">R$ {Number(user.delivery_fee).toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>

        <h2 className="font-bold text-lg mt-6 mb-2">Suas Entregas de Hoje</h2>

        {isLoading ? (
          <p className="text-center text-gray-500 py-8">Carregando entregas...</p>
        ) : orders.length === 0 ? (
          <Card className="bg-gray-100 border-dashed">
            <CardContent className="py-8 text-center text-gray-500">
              Nenhuma entrega pendente no momento.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order: any) => (
              <Card key={order.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">Pedido #{order.number}</CardTitle>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                      Pagar: {order.paymentMethod}
                    </span>
                  </div>
                  <p className="text-sm font-medium">Cliente: {order.customerName || 'Não informado'}</p>
                  <p className="text-sm font-bold text-green-600">Total: R$ {Number(order.total).toFixed(2)}</p>
                  {order.changeNeededFor && (
                    <div className="mt-2 text-sm font-medium bg-amber-50 p-2 rounded border border-amber-200 text-amber-800">
                      Levar troco para R$ {Number(order.changeNeededFor).toFixed(2)}
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded-md text-sm border flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-gray-500" />
                    <span>{order.address}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.address)}`, '_blank')}
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Maps
                    </Button>
                    {order.customerWhatsApp ? (
                      <Button 
                        variant="outline" 
                        className="w-full border-green-200 text-green-700 hover:bg-green-50"
                        onClick={() => window.open(`https://wa.me/55${order.customerWhatsApp.replace(/\D/g, '')}`, '_blank')}
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        WhatsApp
                      </Button>
                    ) : (
                      <Button variant="outline" className="w-full" disabled>
                        <Phone className="h-4 w-4 mr-2" />
                        S/ Número
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
