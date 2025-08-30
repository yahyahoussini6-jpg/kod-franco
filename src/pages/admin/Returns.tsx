import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  RotateCcw, 
  Package, 
  AlertTriangle, 
  DollarSign,
  Search,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';

export default function ReturnsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Retours & RTO</h1>
          <p className="text-muted-foreground">
            Centre de gestion des retours, annulations et workflows RTO
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux RTO</CardTitle>
            <RotateCcw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">12.4%</div>
            <p className="text-xs text-muted-foreground">
              -2.1% vs mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retours en Cours</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">234</div>
            <p className="text-xs text-muted-foreground">
              En attente de traitement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coût RTO</CardTitle>
            <DollarSign className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">45,678 MAD</div>
            <p className="text-xs text-muted-foreground">
              Ce mois
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annulations</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">
              Pré-expédition ce mois
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Gestion des Retours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Input 
                placeholder="Rechercher commande, code suivi..." 
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

          {/* Returns Table */}
          <div className="border rounded-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium">Commande</th>
                    <th className="text-left p-4 font-medium">Client</th>
                    <th className="text-left p-4 font-medium">Type</th>
                    <th className="text-left p-4 font-medium">Raison</th>
                    <th className="text-left p-4 font-medium">Valeur</th>
                    <th className="text-left p-4 font-medium">Date</th>
                    <th className="text-left p-4 font-medium">Statut</th>
                    <th className="text-left p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Sample data */}
                  <tr className="border-t">
                    <td className="p-4">
                      <div>
                        <p className="font-medium">#ORD-12345</p>
                        <p className="text-sm text-muted-foreground">TRK-ABC123</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">Ahmed Benali</p>
                        <p className="text-sm text-muted-foreground">+212 6 12 34 56 78</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="destructive">RTO</Badge>
                    </td>
                    <td className="p-4">
                      <span className="text-sm">Client injoignable</span>
                    </td>
                    <td className="p-4">450 MAD</td>
                    <td className="p-4">
                      <span className="text-sm">Hier</span>
                    </td>
                    <td className="p-4">
                      <Badge variant="secondary">En transit retour</Badge>
                    </td>
                    <td className="p-4">
                      <Button variant="outline" size="sm">Traiter</Button>
                    </td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-4">
                      <div>
                        <p className="font-medium">#ORD-12346</p>
                        <p className="text-sm text-muted-foreground">TRK-DEF456</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">Fatima Zahra</p>
                        <p className="text-sm text-muted-foreground">+212 6 87 65 43 21</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline">Annulation</Badge>
                    </td>
                    <td className="p-4">
                      <span className="text-sm">Rupture de stock</span>
                    </td>
                    <td className="p-4">230 MAD</td>
                    <td className="p-4">
                      <span className="text-sm">Il y a 2h</span>
                    </td>
                    <td className="p-4">
                      <Badge variant="default">En attente</Badge>
                    </td>
                    <td className="p-4">
                      <Button variant="outline" size="sm">Traiter</Button>
                    </td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-4">
                      <div>
                        <p className="font-medium">#ORD-12347</p>
                        <p className="text-sm text-muted-foreground">TRK-GHI789</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">Mohamed Alami</p>
                        <p className="text-sm text-muted-foreground">+212 6 11 22 33 44</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="destructive">RTO</Badge>
                    </td>
                    <td className="p-4">
                      <span className="text-sm">Adresse incorrecte</span>
                    </td>
                    <td className="p-4">890 MAD</td>
                    <td className="p-4">
                      <span className="text-sm">Il y a 3j</span>
                    </td>
                    <td className="p-4">
                      <Badge variant="default">Reçu en entrepôt</Badge>
                    </td>
                    <td className="p-4">
                      <Button variant="outline" size="sm">Traiter</Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Raisons de Retour</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Client injoignable</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-muted rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{width: '45%'}}></div>
                  </div>
                  <span className="text-sm font-medium">45%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Adresse incorrecte</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-muted rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{width: '25%'}}></div>
                  </div>
                  <span className="text-sm font-medium">25%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Client refuse</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-muted rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{width: '20%'}}></div>
                  </div>
                  <span className="text-sm font-medium">20%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Autres</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-muted rounded-full h-2">
                    <div className="bg-gray-500 h-2 rounded-full" style={{width: '10%'}}></div>
                  </div>
                  <span className="text-sm font-medium">10%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Coûts RTO par Mois</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Coût de transport</span>
                <span className="font-medium">25,400 MAD</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Coût de manutention</span>
                <span className="font-medium">8,200 MAD</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Produits endommagés</span>
                <span className="font-medium">12,078 MAD</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center font-bold">
                  <span>Total</span>
                  <span>45,678 MAD</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workflows */}
      <Card>
        <CardHeader>
          <CardTitle>Workflows Automatisés</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Auto-restockage</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Articles en bon état remis automatiquement en stock
              </p>
              <Badge variant="default">Actif</Badge>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Échange client</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Proposition d'échange pour défauts produit
              </p>
              <Badge variant="secondary">Inactif</Badge>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Suivi qualité</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Contrôle qualité automatique des retours
              </p>
              <Badge variant="default">Actif</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}