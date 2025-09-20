import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { 
  BarChart3, 
  Package, 
  ShoppingCart, 
  LogOut, 
  Home,
  Warehouse,
  UserCheck,
  RotateCcw,
  Calculator,
  Truck,
  Settings,
  Database,
  TestTube,
  ChevronRight,
  ChevronDown,
  TrendingUp
} from 'lucide-react';

import { MessageSquare } from 'lucide-react';

const navigation = [
  { name: 'Analytics', href: '/admin', icon: BarChart3, exact: true },
  { name: 'Commandes', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Produits', href: '/admin/products', icon: Package },
  { name: 'Catégories', href: '/admin/categories', icon: Database },
  { 
    name: 'Operations', 
    type: 'section',
    items: [
      { name: 'Inventaire', href: '/admin/inventory', icon: Warehouse },
      { name: 'Clients (CRM)', href: '/admin/clients', icon: UserCheck },
      { name: 'Leads - Wana Buy', href: '/admin/leads', icon: TrendingUp },
      { name: 'Retours/RTO', href: '/admin/returns', icon: RotateCcw },
      { name: 'Finance', href: '/admin/finance', icon: Calculator },
      { name: 'Expédition', href: '/admin/shipping', icon: Truck },
    ]
  },
  { 
    name: 'Marketing & SEO', 
    type: 'section',
    items: [
      { name: 'Blog', href: '/admin/blog', icon: Database },
      { name: 'SEO Management', href: '/admin/seo', icon: TestTube },
      { name: 'Offres Bundle', href: '/admin/bundle-offers', icon: Package },
      { name: 'Personnalisation Bundle', href: '/admin/bundle-customizations', icon: Settings },
      { name: 'Avis Clients', href: '/admin/reviews', icon: MessageSquare },
    ]
  },
  { 
    name: 'Système', 
    type: 'section',
    items: [
      { name: 'Administration', href: '/admin/system', icon: Settings },
      { name: 'WhatsApp', href: '/admin/whatsapp', icon: MessageSquare },
    ]
  }
];

function NavigationItem({ item, isActive, location }: { item: any; isActive: boolean; location: any }) {
  if (item.type === 'section') {
    const [isExpanded, setIsExpanded] = React.useState(
      item.items?.some((subItem: any) => location.pathname.startsWith(subItem.href))
    );

    return (
      <li>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
        >
          <span>{item.name}</span>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
        {isExpanded && (
          <ul className="mt-1 ml-4 space-y-1">
            {item.items?.map((subItem: any) => {
              const subIsActive = location.pathname.startsWith(subItem.href);
              return (
                <li key={subItem.name}>
                  <Link
                    to={subItem.href}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      subIsActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <subItem.icon className="h-4 w-4" />
                    <span>{subItem.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </li>
    );
  }

  return (
    <li>
      <Link
        to={item.href}
        className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
        }`}
      >
        <item.icon className="h-4 w-4" />
        <span>{item.name}</span>
      </Link>
    </li>
  );
}

export default function AdminLayout() {
  const { user, userRole, signOut } = useAuth();
  const location = useLocation();

  // Redirect if not admin
  React.useEffect(() => {
    if (user && userRole && userRole !== 'admin') {
      window.location.href = '/auth';
    }
  }, [user, userRole]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Accès Admin Requis</h2>
            <p className="text-muted-foreground mb-6">
              Vous devez être connecté avec un compte administrateur
            </p>
            <Button asChild>
              <Link to="/auth">Se connecter</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (userRole !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Accès Non Autorisé</h2>
            <p className="text-muted-foreground mb-6">
              Vous n'avez pas les permissions pour accéder à cette zone
            </p>
            <Button asChild>
              <Link to="/">Retour à l'accueil</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              {user.email}
            </span>
            <Button variant="outline" size="sm" asChild>
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Site Public
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen border-r bg-muted/10">
          <nav className="p-4">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const isActive = item.exact 
                  ? location.pathname === item.href
                  : location.pathname.startsWith(item.href);
                
                return (
                  <NavigationItem key={item.name} item={item} isActive={isActive} location={location} />
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}