import { Home, ClipboardList, Award, Settings } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

const navItems = [
  { icon: Home, label: "Início", path: "/" },
  { icon: ClipboardList, label: "Pedidos", path: "/pedidos" },
  { icon: Award, label: "Fidelidade", path: "/fidelidade" },
  { icon: Settings, label: "Admin", path: "/admin" },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-elevated safe-area-bottom pointer-events-auto lg:hidden h-[70px]">
      <div className="flex items-center justify-around h-full max-w-md mx-auto">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;

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
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[11px] font-semibold notranslate whitespace-nowrap" translate="no">{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

