import { Home, ClipboardList, Award, Settings } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchOrdersByLookup } from "@/data/menuData";
import { useState, useEffect } from "react";

const navItems = [
  { icon: Home, label: "Início", path: "/" },
  { icon: ClipboardList, label: "Pedidos", path: "/pedidos" },
  { icon: Award, label: "Fidelidade", path: "/fidelidade" },
  { icon: Settings, label: "Admin", path: "/admin" },
];

export default function BottomNav() {
  const location = useLocation();
  const [customerCpf, setCustomerCpf] = useState(() => localStorage.getItem("digitalmenu_customer_cpf") || "");

  // Atualiza o CPF se o usuário buscar na página de pedidos
  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem("digitalmenu_customer_cpf");
      if (stored && stored !== customerCpf) setCustomerCpf(stored);
    };
    window.addEventListener("storage", handleStorageChange);
    // Polling local para capturar mudanças no localStorage feitas na mesma aba
    const interval = setInterval(handleStorageChange, 1000);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [customerCpf]);

  const { data: orders = [] } = useQuery({
    queryKey: ['orders-badge', customerCpf],
    queryFn: () => fetchOrdersByLookup(customerCpf),
    enabled: customerCpf.length >= 10,
    refetchInterval: 10000 // A cada 10 segundos para não sobrecarregar
  });

  const hasActiveOrder = orders.some(o => o.status !== 'entregue' && o.status !== 'cancelado');

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-elevated safe-area-bottom pointer-events-auto lg:hidden h-[70px]">
      <div className="flex items-center justify-around h-full max-w-md mx-auto">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          const isPedidos = path === "/pedidos";

          return (
            <NavLink
              key={label}
              to={path}
              aria-label={`Ir para ${label}`}
              className={`flex flex-col items-center justify-center gap-1 px-4 h-full rounded-xl transition-colors min-w-[64px] touch-manipulation hover:bg-muted/50 ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground active:text-foreground"
              }`}
            >
              <div className="relative">
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                {isPedidos && hasActiveOrder && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-card animate-pulse" />
                )}
              </div>
              <span className="text-[11px] font-semibold notranslate whitespace-nowrap" translate="no">{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

