import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Warehouse, 
  AlertTriangle, 
  Package, 
  Plus,
  Search,
  Filter,
  Download,
  Upload
} from 'lucide-react';

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Inventaire & Stocks</h1>
          <p className="text-muted-foreground">
            Gestion des stocks, SKU/variants, et alertes de stock bas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau SKU
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total SKUs</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              +12% vs mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Total</CardTitle>
            <Warehouse className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45,678</div>
            <p className="text-xs text-muted-foreground">
              Unités en stock
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Bas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">23</div>
            <p className="text-xs text-muted-foreground">
              SKUs nécessitent réapprovisionnement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valeur Stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,345,678 MAD</div>
            <p className="text-xs text-muted-foreground">
              Valeur totale du stock
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Inventaire</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Input 
                placeholder="Rechercher SKU, nom produit..." 
                className="w-full"
              />
            </div>
            <Button variant="outline">
              <Search className="mr-2 h-4 w-4" />
              Rechercher
            </Button>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filtres
            </Button>
          </div>

          {/* Inventory Table */}
          <div className="border rounded-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium">SKU</th>
                    <th className="text-left p-4 font-medium">Produit</th>
                    <th className="text-left p-4 font-medium">Catégorie</th>
                    <th className="text-left p-4 font-medium">Stock</th>
                    <th className="text-left p-4 font-medium">Réservé</th>
                    <th className="text-left p-4 font-medium">Entrant</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Sample data */}
                  <tr className="border-t">
                    <td className="p-4 font-mono text-sm">SKU-001</td>
                    <td className="p-4">Chaussures Sport Nike</td>
                    <td className="p-4">Chaussures</td>
                    <td className="p-4">124</td>
                    <td className="p-4">12</td>
                    <td className="p-4">50</td>
                    <td className="p-4">
                      <Badge variant="default">En stock</Badge>
                    </td>
                    <td className="p-4">
                      <Button variant="outline" size="sm">Voir</Button>
                    </td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-4 font-mono text-sm">SKU-002</td>
                    <td className="p-4">T-shirt Coton Bio</td>
                    <td className="p-4">Vêtements</td>
                    <td className="p-4">5</td>
                    <td className="p-4">2</td>
                    <td className="p-4">0</td>
                    <td className="p-4">
                      <Badge variant="destructive">Stock bas</Badge>
                    </td>
                    <td className="p-4">
                      <Button variant="outline" size="sm">Voir</Button>
                    </td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-4 font-mono text-sm">SKU-003</td>
                    <td className="p-4">Sac à Dos Voyage</td>
                    <td className="p-4">Accessoires</td>
                    <td className="p-4">0</td>
                    <td className="p-4">0</td>
                    <td className="p-4">25</td>
                    <td className="p-4">
                      <Badge variant="secondary">Rupture</Badge>
                    </td>
                    <td className="p-4">
                      <Button variant="outline" size="sm">Voir</Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stock Adjustment Log */}
      <Card>
        <CardHeader>
          <CardTitle>Journal des Ajustements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <div>
                <p className="font-medium">SKU-001 - Ajustement manuel</p>
                <p className="text-sm text-muted-foreground">+20 unités ajoutées</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Il y a 2h</p>
                <p className="text-sm">Par: admin@store.com</p>
              </div>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <div>
                <p className="font-medium">SKU-002 - Réception commande</p>
                <p className="text-sm text-muted-foreground">+100 unités reçues</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Hier</p>
                <p className="text-sm">Par: system</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}