import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchOrders, fetchCoupons, Order, Coupon } from "@/data/menuData";
import { BarChart3, TrendingUp, DollarSign, ShoppingBag, Users, Calendar, Filter } from "lucide-react";

export default function AdminReports() {
  const { data: orders = [] } = useQuery({ queryKey: ['orders'], queryFn: fetchOrders });
  const { data: coupons = [] } = useQuery({ queryKey: ['coupons'], queryFn: fetchCoupons });

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [couponFilter, setCouponFilter] = useState("all");

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      if (order.status === "cancelado") return false;

      const orderDate = new Date(order.createdAt);
      if (startDate) {
        const start = new Date(startDate + "T00:00:00");
        if (orderDate < start) return false;
      }
      if (endDate) {
        const end = new Date(endDate + "T23:59:59.999");
        if (orderDate > end) return false;
      }

      if (couponFilter === "with_coupon") {
        if (!order.couponId) return false;
      } else if (couponFilter !== "all") {
        if (String(order.couponId) !== couponFilter) return false;
      }

      return true;
    });
  }, [orders, startDate, endDate, couponFilter]);

  const metrics = useMemo(() => {
    let totalRevenue = 0;
    const paymentCounts: Record<string, number> = {};
    const productCounts: Record<string, number> = {};
    const customerCounts: Record<string, { count: number, total: number }> = {};

    filteredOrders.forEach(order => {
      totalRevenue += order.total;

      const pm = order.paymentMethod || "Não informado";
      paymentCounts[pm] = (paymentCounts[pm] || 0) + 1;

      order.items.forEach(item => {
        productCounts[item.productName] = (productCounts[item.productName] || 0) + item.quantity;
      });

      const custId = order.customerWhatsApp || order.customerName || "Desconhecido";
      if (!customerCounts[custId]) {
        customerCounts[custId] = { count: 0, total: 0 };
      }
      customerCounts[custId].count += 1;
      customerCounts[custId].total += order.total;
    });

    const topProducts = Object.entries(productCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const topPayments = Object.entries(paymentCounts)
      .sort((a, b) => b[1] - a[1]);

    const topCustomers = Object.entries(customerCounts)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 10);

    return { totalRevenue, topProducts, topPayments, topCustomers, totalOrders: filteredOrders.length };
  }, [filteredOrders]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display text-foreground flex items-center gap-2">
            <BarChart3 className="text-primary" size={24} />
            Relatórios
          </h2>
          <p className="text-sm text-muted-foreground">Analise o desempenho das suas vendas</p>
        </div>
      </div>

      <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex flex-wrap gap-4 items-end">
        <div className="space-y-1.5 flex-1 min-w-[150px]">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <Calendar size={12} /> Data Inicial
          </label>
          <input 
            type="date" 
            value={startDate} 
            onChange={e => setStartDate(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div className="space-y-1.5 flex-1 min-w-[150px]">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <Calendar size={12} /> Data Final
          </label>
          <input 
            type="date" 
            value={endDate} 
            onChange={e => setEndDate(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div className="space-y-1.5 flex-1 min-w-[200px]">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <Filter size={12} /> Filtro de Cupom
          </label>
          <select 
            value={couponFilter} 
            onChange={e => setCouponFilter(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="all">Todos os Pedidos</option>
            <option value="with_coupon">Apenas pedidos com cupom</option>
            {coupons.map(c => (
              <option key={c.id} value={String(c.id)}>Cupom: {c.code}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border border-border p-5 rounded-xl shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Faturamento Total</p>
            <p className="text-2xl font-bold text-foreground">R$ {metrics.totalRevenue.toFixed(2)}</p>
          </div>
        </div>
        <div className="bg-card border border-border p-5 rounded-xl shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary-foreground">
            <ShoppingBag size={24} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Total de Pedidos</p>
            <p className="text-2xl font-bold text-foreground">{metrics.totalOrders}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/30">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <TrendingUp size={16} className="text-primary" /> Produtos Mais Vendidos
            </h3>
          </div>
          <div className="p-0">
            {metrics.topProducts.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground text-center">Sem dados no período.</p>
            ) : (
              <ul className="divide-y divide-border">
                {metrics.topProducts.map(([name, qty], idx) => (
                  <li key={name} className="p-3 flex justify-between items-center hover:bg-muted/30">
                    <span className="text-sm font-medium text-foreground">
                      <span className="text-muted-foreground mr-2">{idx + 1}º</span> {name}
                    </span>
                    <span className="text-sm font-bold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">{qty} un</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/30">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <DollarSign size={16} className="text-emerald-500" /> Formas de Pagamento
            </h3>
          </div>
          <div className="p-0">
            {metrics.topPayments.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground text-center">Sem dados no período.</p>
            ) : (
              <ul className="divide-y divide-border">
                {metrics.topPayments.map(([name, qty]) => (
                  <li key={name} className="p-3 flex justify-between items-center hover:bg-muted/30">
                    <span className="text-sm text-foreground">{name}</span>
                    <span className="text-sm font-bold text-muted-foreground">{qty} pedidos</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden md:col-span-2">
          <div className="p-4 border-b border-border bg-muted/30">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Users size={16} className="text-blue-500" /> Clientes que Mais Compraram
            </h3>
          </div>
          <div className="p-0 overflow-x-auto">
            {metrics.topCustomers.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground text-center">Sem dados no período.</p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="p-3 font-medium text-muted-foreground">Posição</th>
                    <th className="p-3 font-medium text-muted-foreground">Contato / Nome</th>
                    <th className="p-3 font-medium text-muted-foreground text-center">Qtd Pedidos</th>
                    <th className="p-3 font-medium text-muted-foreground text-right">Valor Gasto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {metrics.topCustomers.map(([contact, data], idx) => (
                    <tr key={contact} className="hover:bg-muted/30">
                      <td className="p-3 text-muted-foreground font-medium">#{idx + 1}</td>
                      <td className="p-3 font-medium text-foreground">{contact}</td>
                      <td className="p-3 text-center">{data.count}</td>
                      <td className="p-3 text-right font-bold text-primary">R$ {data.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
