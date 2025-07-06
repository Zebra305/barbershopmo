import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Review {
  id: number;
  customerName: string;
  customerType: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function ReviewsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsToShow, setItemsToShow] = useState(1);

  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: ["/api/reviews"],
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
    if (reviews.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => 
          (prevIndex + 1) % Math.max(1, reviews.length - itemsToShow + 1)
        );
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [reviews.length, itemsToShow]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      (prevIndex + 1) % Math.max(1, reviews.length - itemsToShow + 1)
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 
        ? Math.max(0, reviews.length - itemsToShow) 
        : prevIndex - 1
    );
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "text-barber-gold fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No reviews available</p>
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
        {reviews.map((review) => (
          <div key={review.id} className="carousel-item carousel-item-md">
            <Card className="h-full">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex">
                    {renderStars(review.rating)}
                  </div>
                </div>
                <p className="text-gray-600 mb-4">{review.comment}</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                  <div>
                    <p className="font-semibold text-barber-dark">
                      {review.customerName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {review.customerType}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
      
      {reviews.length > itemsToShow && (
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
