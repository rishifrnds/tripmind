import { Home, Map, Briefcase, PieChart } from "lucide-react";
import { Link, useLocation } from "wouter";

interface BottomNavProps {
  currentTab?: string;
  onTabChange?: (tab: string) => void;
  tripId?: string;
}

export function BottomNav({ currentTab, onTabChange, tripId }: BottomNavProps) {
  const [location] = useLocation();
  const isDashboard = location === "/";

  const navItems = tripId ? [
    { id: 'DASHBOARD', label: 'Home', icon: Home, isLink: true, href: "/" },
    { id: 'PLANNER', label: 'Planner', icon: Map, isLink: false },
    { id: 'PACKING', label: 'Packing', icon: Briefcase, isLink: false },
    { id: 'BUDGET', label: 'Budget', icon: PieChart, isLink: false }
  ] : [
    { id: 'DASHBOARD', label: 'Home', icon: Home, isLink: true, href: "/" },
    { id: 'NEW', label: 'New Trip', icon: Map, isLink: true, href: "/new" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 glass-panel border-t border-white/20 flex items-center justify-around px-2 sm:px-6 z-50 pb-safe">
      {navItems.map(item => {
        const isActive = isDashboard && item.id === 'DASHBOARD'
          || (!isDashboard && !tripId && item.id === 'NEW')
          || currentTab === item.id;

        const content = (
          <>
            <item.icon className={`w-6 h-6 mb-1 ${isActive ? 'text-accent fill-accent/20' : 'text-muted-foreground'}`} />
            <span className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-accent' : 'text-muted-foreground'}`}>
              {item.label}
            </span>
          </>
        );

        const className = `flex flex-col items-center justify-center w-20 h-full transition-all duration-300 ${isActive ? 'scale-110 -translate-y-1' : 'hover:scale-105 hover:text-primary'}`;

        if (item.isLink && item.href) {
          return (
            <Link key={item.id} href={item.href} className={className}>
              {content}
            </Link>
          );
        }

        return (
          <button
            key={item.id}
            onClick={() => onTabChange?.(item.id)}
            className={className}
          >
            {content}
          </button>
        );
      })}
    </nav>
  );
}
