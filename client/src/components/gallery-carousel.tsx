import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface GalleryItem {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  createdAt: string;
}

export default function GalleryCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsToShow, setItemsToShow] = useState(1);

  const { data: galleryItems = [] } = useQuery<GalleryItem[]>({
    queryKey: ["/api/gallery"],
  });

  // Handle responsive items count
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setItemsToShow(3);
      } else {
        setItemsToShow(1);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto-scroll carousel
  useEffect(() => {
    if (galleryItems.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => 
          (prevIndex + 1) % Math.max(1, galleryItems.length - itemsToShow + 1)
        );
      }, 4000);

      return () => clearInterval(interval);
    }
  }, [galleryItems.length, itemsToShow]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      (prevIndex + 1) % Math.max(1, galleryItems.length - itemsToShow + 1)
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 
        ? Math.max(0, galleryItems.length - itemsToShow) 
        : prevIndex - 1
    );
  };

  if (galleryItems.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No gallery items available</p>
      </div>
    );
  }

  return (
    <div className="carousel-container">
      <div 
        className="carousel-slider"
        style={{
          transform: `translateX(-${currentIndex * (100 / itemsToShow)}%)`,
        }}
      >
        {galleryItems.map((item) => (
          <div key={item.id} className="carousel-item carousel-item-md">
            <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-gray-200 overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-barber-dark mb-1">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
      
      {galleryItems.length > itemsToShow && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="carousel-nav carousel-nav-left"
            onClick={prevSlide}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="carousel-nav carousel-nav-right"
            onClick={nextSlide}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </>
      )}
    </div>
  );
}
