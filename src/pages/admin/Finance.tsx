import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Calculator, 
  DollarSign, 
  Receipt, 
  TrendingUp,
  Search,
  Filter,
  Download,
  FileText
} from 'lucide-react';

export default function FinancePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Finance</h1>
          <p className="text-muted-foreground">
            Gestion financière, facturation, COGS et réconciliation
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Compta
          </Button>
          <Button>
            <FileText className="mr-2 h-4 w-4" />
            Nouvelle Facture
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chiffre d'Affaires</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">234,567 MAD</div>
            <p className="text-xs text-muted-foreground">
              +12.5% vs mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Marge Brute</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156,234 MAD</div>
            <p className="text-xs text-muted-foreground">
              66.6% de marge
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">COGS Total</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78,333 MAD</div>
            <p className="text-xs text-muted-foreground">
              33.4% du CA
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Factures Impayées</CardTitle>
            <Receipt className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">12</div>
            <p className="text-xs text-muted-foreground">
              Total: 45,600 MAD
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Facturation */}
      <Card>
        <CardHeader>
          <CardTitle>Facturation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Input 
                placeholder="Rechercher facture, client..." 
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

          {/* Invoices Table */}
          <div className="border rounded-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium">Facture</th>
                    <th className="text-left p-4 font-medium">Client</th>
                    <th className="text-left p-4 font-medium">Date</th>
                    <th className="text-left p-4 font-medium">Montant</th>
                    <th className="text-left p-4 font-medium">TVA</th>
                    <th className="text-left p-4 font-medium">Total TTC</th>
                    <th className="text-left p-4 font-medium">Statut</th>
                    <th className="text-left p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Sample data */}
                  <tr className="border-t">
                    <td className="p-4">
                      <div>
                        <p className="font-medium">#FAC-2024-001</p>
                        <p className="text-sm text-muted-foreground">Commande #ORD-12345</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">Ahmed Benali</p>
                        <p className="text-sm text-muted-foreground">Casablanca</p>
                      </div>
                    </td>
                    <td className="p-4">15/08/2024</td>
                    <td className="p-4">450.00 MAD</td>
                    <td className="p-4">90.00 MAD</td>
                    <td className="p-4 font-medium">540.00 MAD</td>
                    <td className="p-4">
                      <Badge variant="default">Payée</Badge>
                    </td>
                    <td className="p-4">
                      <Button variant="outline" size="sm">Voir</Button>
                    </td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-4">
                      <div>
                        <p className="font-medium">#FAC-2024-002</p>
                        <p className="text-sm text-muted-foreground">Commande #ORD-12346</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">Fatima Zahra</p>
                        <p className="text-sm text-muted-foreground">Rabat</p>
                      </div>
                    </td>
                    <td className="p-4">16/08/2024</td>
                    <td className="p-4">230.00 MAD</td>
                    <td className="p-4">46.00 MAD</td>
                    <td className="p-4 font-medium">276.00 MAD</td>
                    <td className="p-4">
                      <Badge variant="destructive">Impayée</Badge>
                    </td>
                    <td className="p-4">
                      <Button variant="outline" size="sm">Voir</Button>
                    </td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-4">
                      <div>
                        <p className="font-medium">#FAC-2024-003</p>
                        <p className="text-sm text-muted-foreground">Commande #ORD-12347</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">Mohamed Alami</p>
                        <p className="text-sm text-muted-foreground">Marrakech</p>
                      </div>
                    </td>
                    <td className="p-4">17/08/2024</td>
                    <td className="p-4">890.00 MAD</td>
                    <td className="p-4">178.00 MAD</td>
                    <td className="p-4 font-medium">1,068.00 MAD</td>
                    <td className="p-4">
                      <Badge variant="secondary">En attente</Badge>
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

      {/* COGS et Unité Economics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>COGS par Catégorie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Chaussures</span>
                <div className="text-right">
                  <p className="font-medium">25,400 MAD</p>
                  <p className="text-sm text-muted-foreground">32.4%</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Vêtements</span>
                <div className="text-right">
                  <p className="font-medium">32,100 MAD</p>
                  <p className="text-sm text-muted-foreground">41.0%</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Accessoires</span>
                <div className="text-right">
                  <p className="font-medium">12,833 MAD</p>
                  <p className="text-sm text-muted-foreground">16.4%</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Électronique</span>
                <div className="text-right">
                  <p className="font-medium">8,000 MAD</p>
                  <p className="text-sm text-muted-foreground">10.2%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Unité Economics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>AOV Moyen</span>
                <span className="font-medium">456 MAD</span>
              </div>
              <div className="flex justify-between items-center">
                <span>COGS par Commande</span>
                <span className="font-medium">152 MAD</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Frais d'Expédition</span>
                <span className="font-medium">45 MAD</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Frais COD</span>
                <span className="font-medium">15 MAD</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center font-bold">
                  <span>Marge par Commande</span>
                  <span className="text-green-600">244 MAD</span>
                </div>
                <p className="text-sm text-muted-foreground text-right">53.5% de marge</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Réconciliation COD */}
      <Card>
        <CardHeader>
          <CardTitle>Réconciliation COD</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground">AUJOURD'HUI</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Livraisons COD</span>
                  <span className="font-medium">45,600 MAD</span>
                </div>
                <div className="flex justify-between">
                  <span>Montant reçu</span>
                  <span className="font-medium text-green-600">42,100 MAD</span>
                </div>
                <div className="flex justify-between">
                  <span>En attente</span>
                  <span className="font-medium text-orange-600">3,500 MAD</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground">CETTE SEMAINE</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total COD</span>
                  <span className="font-medium">234,500 MAD</span>
                </div>
                <div className="flex justify-between">
                  <span>Réconcilié</span>
                  <span className="font-medium text-green-600">221,800 MAD</span>
                </div>
                <div className="flex justify-between">
                  <span>Écart</span>
                  <span className="font-medium text-red-600">12,700 MAD</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground">CE MOIS</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total COD</span>
                  <span className="font-medium">1,234,500 MAD</span>
                </div>
                <div className="flex justify-between">
                  <span>Taux réconciliation</span>
                  <span className="font-medium text-green-600">94.2%</span>
                </div>
                <div className="flex justify-between">
                  <span>Pertes</span>
                  <span className="font-medium text-red-600">71,500 MAD</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Exports Comptabilité</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <FileText className="mb-2 h-6 w-6" />
              <span>Journal des Ventes</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Calculator className="mb-2 h-6 w-6" />
              <span>État COGS</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Receipt className="mb-2 h-6 w-6" />
              <span>Factures TVA</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <DollarSign className="mb-2 h-6 w-6" />
              <span>Réconciliation COD</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}