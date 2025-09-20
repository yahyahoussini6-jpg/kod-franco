import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

interface BundleGalleryProps {
  primaryImages: any[];
  secondaryImages: any[];
  primaryProductName: string;
  secondaryProductName: string;
  bundleName: string;
}

export function BundleGallery({ 
  primaryImages, 
  secondaryImages, 
  primaryProductName, 
  secondaryProductName,
  bundleName 
}: BundleGalleryProps) {
  const [currentPrimaryIndex, setCurrentPrimaryIndex] = useState(0);
  const [currentSecondaryIndex, setCurrentSecondaryIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<any[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [galleryLayout, setGalleryLayout] = useState<'grid' | 'carousel' | 'stacked'>('stacked');

  const openLightbox = (images: any[], index: number) => {
    setLightboxImages(images);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const navigateLightbox = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setLightboxIndex((prev) => (prev > 0 ? prev - 1 : lightboxImages.length - 1));
    } else {
      setLightboxIndex((prev) => (prev < lightboxImages.length - 1 ? prev + 1 : 0));
    }
  };

  const downloadImage = (imageUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    link.click();
  };

  const ImageCard = ({ 
    images, 
    currentIndex, 
    setCurrentIndex, 
    productName, 
    badgeText, 
    badgeColor 
  }: {
    images: any[];
    currentIndex: number;
    setCurrentIndex: (index: number) => void;
    productName: string;
    badgeText: string;
    badgeColor: string;
  }) => (
    <Card className="overflow-hidden">
      <div className="relative">
        <div className={`absolute top-4 left-4 z-10 px-3 py-1 rounded-full text-sm font-medium ${badgeColor}`}>
          {badgeText}
        </div>
        
        {images.length > 0 ? (
          <>
            <div 
              className="aspect-square w-full overflow-hidden cursor-pointer group"
              onClick={() => openLightbox(images, currentIndex)}
            >
              <img
                src={images[currentIndex]?.url}
                alt={productName}
                className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                <Maximize2 className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>
            
            {images.length > 1 && (
              <>
                {galleryLayout === 'carousel' ? (
                  <Carousel className="w-full">
                    <CarouselContent className="p-2">
                      {images.map((image, index) => (
                        <CarouselItem key={index} className="basis-1/4">
                          <button
                            onClick={() => setCurrentIndex(index)}
                            className={`w-full aspect-square rounded-lg border-2 overflow-hidden transition-all ${
                              currentIndex === index 
                                ? 'border-primary ring-2 ring-primary/20' 
                                : 'border-muted hover:border-primary/50'
                            }`}
                          >
                            <img
                              src={image.url}
                              alt={`${productName} ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                  </Carousel>
                ) : (
                  <div className="p-4 border-t">
                    <div className="flex gap-2 overflow-x-auto">
                      {images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentIndex(index)}
                          className={`flex-shrink-0 w-16 h-16 rounded-lg border-2 overflow-hidden transition-all ${
                            currentIndex === index 
                              ? 'border-primary ring-2 ring-primary/20' 
                              : 'border-muted hover:border-primary/50'
                          }`}
                        >
                          <img
                            src={image.url}
                            alt={`${productName} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <div className="aspect-square w-full flex items-center justify-center bg-muted">
            <span className="text-muted-foreground">Aucune image</span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-lg">{productName}</h3>
        <p className="text-sm text-muted-foreground">{images.length} image(s)</p>
      </div>
    </Card>
  );

  const renderLayoutControls = () => (
    <div className="flex justify-center gap-2 mb-6">
      <Button
        variant={galleryLayout === 'stacked' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setGalleryLayout('stacked')}
      >
        Empilé
      </Button>
      <Button
        variant={galleryLayout === 'grid' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setGalleryLayout('grid')}
      >
        Grille
      </Button>
      <Button
        variant={galleryLayout === 'carousel' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setGalleryLayout('carousel')}
      >
        Carrousel
      </Button>
    </div>
  );

  if (galleryLayout === 'grid') {
    return (
      <div className="space-y-6">
        {renderLayoutControls()}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ImageCard
            images={primaryImages}
            currentIndex={currentPrimaryIndex}
            setCurrentIndex={setCurrentPrimaryIndex}
            productName={primaryProductName}
            badgeText="Produit Principal"
            badgeColor="bg-primary text-primary-foreground"
          />
          
          <ImageCard
            images={secondaryImages}
            currentIndex={currentSecondaryIndex}
            setCurrentIndex={setCurrentSecondaryIndex}
            productName={secondaryProductName}
            badgeText="BONUS"
            badgeColor="bg-destructive text-destructive-foreground"
          />
        </div>

        {/* Lightbox */}
        <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
          <DialogContent className="max-w-4xl w-full p-0 bg-black/95">
            <DialogTitle className="sr-only">Galerie d'images</DialogTitle>
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
                onClick={() => setLightboxOpen(false)}
              >
                <X className="h-6 w-6" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-16 z-50 text-white hover:bg-white/20"
                onClick={() => downloadImage(lightboxImages[lightboxIndex]?.url, `${bundleName}-${lightboxIndex + 1}.jpg`)}
              >
                <Download className="h-6 w-6" />
              </Button>

              {lightboxImages.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20"
                    onClick={() => navigateLightbox('prev')}
                  >
                    <ChevronLeft className="h-8 w-8" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20"
                    onClick={() => navigateLightbox('next')}
                  >
                    <ChevronRight className="h-8 w-8" />
                  </Button>
                </>
              )}

              <div className="flex items-center justify-center min-h-[70vh]">
                <img
                  src={lightboxImages[lightboxIndex]?.url}
                  alt={`Image ${lightboxIndex + 1}`}
                  className="max-w-full max-h-full object-contain"
                />
              </div>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
                {lightboxIndex + 1} / {lightboxImages.length}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Default stacked layout (original)
  return (
    <div className="space-y-6">
      {renderLayoutControls()}

      {/* Bundle Badge */}
      <div className="flex items-center justify-center">
        <div className="bg-gradient-to-r from-primary/10 to-primary/20 text-primary px-6 py-3 rounded-full text-lg font-bold border border-primary/30">
          Pack Spécial
        </div>
      </div>

      {/* Primary Product */}
      <ImageCard
        images={primaryImages}
        currentIndex={currentPrimaryIndex}
        setCurrentIndex={setCurrentPrimaryIndex}
        productName={primaryProductName}
        badgeText="1"
        badgeColor="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm"
      />

      {/* Plus Icon */}
      <div className="flex justify-center">
        <div className="bg-primary/20 rounded-full p-4 border-2 border-primary/30">
          <span className="text-2xl font-bold text-primary">+</span>
        </div>
      </div>

      {/* Secondary Product */}
      <ImageCard
        images={secondaryImages}
        currentIndex={currentSecondaryIndex}
        setCurrentIndex={setCurrentSecondaryIndex}
        productName={secondaryProductName}
        badgeText="2"
        badgeColor="bg-secondary text-secondary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm"
      />

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-4xl w-full p-0 bg-black/95">
          <DialogTitle className="sr-only">Galerie d'images</DialogTitle>
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-16 z-50 text-white hover:bg-white/20"
              onClick={() => downloadImage(lightboxImages[lightboxIndex]?.url, `${bundleName}-${lightboxIndex + 1}.jpg`)}
            >
              <Download className="h-6 w-6" />
            </Button>

            {lightboxImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20"
                  onClick={() => navigateLightbox('prev')}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20"
                  onClick={() => navigateLightbox('next')}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              </>
            )}

            <div className="flex items-center justify-center min-h-[70vh]">
              <img
                src={lightboxImages[lightboxIndex]?.url}
                alt={`Image ${lightboxIndex + 1}`}
                className="max-w-full max-h-full object-contain"
              />
            </div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
              {lightboxIndex + 1} / {lightboxImages.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}