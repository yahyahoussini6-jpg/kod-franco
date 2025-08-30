import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProductCard } from '@/components/ProductCard';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';

const PRODUCTS_PER_PAGE = 12;

export default function Products() {
  const [currentPage, setCurrentPage] = useState(1);
  
  const { data: productsData, isLoading, error } = useQuery({
    queryKey: ['products', currentPage],
    queryFn: async () => {
      const from = (currentPage - 1) * PRODUCTS_PER_PAGE;
      const to = from + PRODUCTS_PER_PAGE - 1;
      
      const [productsResponse, countResponse] = await Promise.all([
        supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })
          .range(from, to),
        supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
      ]);
      
      if (productsResponse.error) throw productsResponse.error;
      if (countResponse.error) throw countResponse.error;
      
      return {
        products: productsResponse.data,
        totalCount: countResponse.count || 0
      };
    },
  });

  const products = productsData?.products || [];
  const totalCount = productsData?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / PRODUCTS_PER_PAGE);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-muted rounded-lg h-64 md:h-80 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Erreur de chargement</h2>
          <p className="text-muted-foreground">
            Impossible de charger les produits. Veuillez réessayer plus tard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Nos Produits</h1>
      
      {products && products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product as any} />
            ))}
          </div>
          
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Aucun produit disponible</h2>
          <p className="text-muted-foreground">
            Revenez bientôt pour découvrir nos nouveaux produits !
          </p>
        </div>
      )}
    </div>
  );
}