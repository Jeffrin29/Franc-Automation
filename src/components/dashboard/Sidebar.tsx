import { Activity, BarChart3, Database, Settings, Wifi, Users, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link, useLocation } from 'react-router-dom';

const navigation = [
  { name: 'Dashboard', icon: BarChart3, path: '/' },
  { name: 'Live Data', icon: Activity, path: '/live' },
  { name: 'History', icon: Database, path: '/history' },
  { name: 'Devices', icon: Wifi, path: '/devices' },
  { name: 'User Management', icon: Users, path: '/users' },
  { name: 'Role Management', icon: ShieldCheck, path: '/roles' },
  { name: 'Settings', icon: Settings, path: '/settings' },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <div className="w-64 bg-gradient-sidebar border-r border-border relative">
      <div className="flex h-16 items-center px-6 border-b border-border">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">IoT Dashboard</h1>
            <p className="text-xs text-muted-foreground">Real-time monitoring</p>
          </div>
        </div>
      </div>
      
      <nav className="mt-6 px-3">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={cn(
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-glow'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  )}
                >
                  <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="absolute bottom-6 left-6 right-6">
        <div className="bg-gradient-card rounded-lg p-4 border border-border">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-metric-good rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">MQTT Status</span>
          </div>
          <p className="text-xs text-muted-foreground">Connected to broker</p>
        </div>
      </div>
    </div>
  );
}
