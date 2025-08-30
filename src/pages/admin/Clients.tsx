import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  UserCheck, 
  Phone, 
  MapPin, 
  ShoppingBag,
  AlertTriangle,
  Search,
  Filter,
  Download,
  Plus
} from 'lucide-react';

export default function ClientsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Clients (CRM)</h1>
          <p className="text-muted-foreground">
            Gestion des profils clients, historique commandes et segmentation
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau Client
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8,432</div>
            <p className="text-xs text-muted-foreground">
              +245 ce mois
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients Actifs</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,145</div>
            <p className="text-xs text-muted-foreground">
              Commande dans les 30 derniers jours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients à Risque</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">156</div>
            <p className="text-xs text-muted-foreground">
              Score RTO élevé
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">LTV Moyenne</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234 MAD</div>
            <p className="text-xs text-muted-foreground">
              Valeur vie client
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Base Clients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Input 
                placeholder="Rechercher nom, téléphone, email..." 
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

          {/* Clients Table */}
          <div className="border rounded-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium">Client</th>
                    <th className="text-left p-4 font-medium">Contact</th>
                    <th className="text-left p-4 font-medium">Ville</th>
                    <th className="text-left p-4 font-medium">Commandes</th>
                    <th className="text-left p-4 font-medium">Total Dépensé</th>
                    <th className="text-left p-4 font-medium">Score Risque</th>
                    <th className="text-left p-4 font-medium">Statut</th>
                    <th className="text-left p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Sample data */}
                  <tr className="border-t">
                    <td className="p-4">
                      <div>
                        <p className="font-medium">Ahmed Benali</p>
                        <p className="text-sm text-muted-foreground">Client depuis 2023</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Phone className="mr-1 h-3 w-3" />
                          +212 6 12 34 56 78
                        </div>
                        <p className="text-sm text-muted-foreground">ahmed@email.com</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center text-sm">
                        <MapPin className="mr-1 h-3 w-3" />
                        Casablanca
                      </div>
                    </td>
                    <td className="p-4">12</td>
                    <td className="p-4">3,450 MAD</td>
                    <td className="p-4">
                      <Badge variant="default">Faible</Badge>
                    </td>
                    <td className="p-4">
                      <Badge variant="default">Actif</Badge>
                    </td>
                    <td className="p-4">
                      <Button variant="outline" size="sm">Voir</Button>
                    </td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-4">
                      <div>
                        <p className="font-medium">Fatima Zahra</p>
                        <p className="text-sm text-muted-foreground">Client depuis 2024</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Phone className="mr-1 h-3 w-3" />
                          +212 6 87 65 43 21
                        </div>
                        <p className="text-sm text-muted-foreground">fatima@email.com</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center text-sm">
                        <MapPin className="mr-1 h-3 w-3" />
                        Rabat
                      </div>
                    </td>
                    <td className="p-4">3</td>
                    <td className="p-4">890 MAD</td>
                    <td className="p-4">
                      <Badge variant="destructive">Élevé</Badge>
                    </td>
                    <td className="p-4">
                      <Badge variant="secondary">Inactif</Badge>
                    </td>
                    <td className="p-4">
                      <Button variant="outline" size="sm">Voir</Button>
                    </td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-4">
                      <div>
                        <p className="font-medium">Mohamed Alami</p>
                        <p className="text-sm text-muted-foreground">Client depuis 2023</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Phone className="mr-1 h-3 w-3" />
                          +212 6 11 22 33 44
                        </div>
                        <p className="text-sm text-muted-foreground">mohamed@email.com</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center text-sm">
                        <MapPin className="mr-1 h-3 w-3" />
                        Marrakech
                      </div>
                    </td>
                    <td className="p-4">25</td>
                    <td className="p-4">7,890 MAD</td>
                    <td className="p-4">
                      <Badge variant="default">Faible</Badge>
                    </td>
                    <td className="p-4">
                      <Badge variant="default">VIP</Badge>
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

      {/* Segmentation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Segmentation Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Nouveaux Clients (&lt;3 mois)</span>
                <Badge>2,145</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Clients Réguliers (3-12 mois)</span>
                <Badge>3,456</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Clients VIP (&gt;12 mois)</span>
                <Badge>2,831</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Clients Inactifs (&gt;6 mois)</span>
                <Badge variant="secondary">1,234</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alertes Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="font-medium">156 clients à risque RTO</p>
                  <p className="text-sm text-muted-foreground">Score &gt; 0.7</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-red-500" />
                <div>
                  <p className="font-medium">23 numéros injoignables</p>
                  <p className="text-sm text-muted-foreground">Dernière tentative échouée</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <UserCheck className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="font-medium">89 clients à réactiver</p>
                  <p className="text-sm text-muted-foreground">Pas de commande depuis 90j</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}