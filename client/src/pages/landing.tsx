import Navigation from "@/components/navigation";
import ReviewsCarousel from "@/components/reviews-carousel";
import GalleryCarousel from "@/components/gallery-carousel";
import QueueStatus from "@/components/queue-status";
import { useTranslation } from "@/hooks/useTranslation";
import { Star, Scissors, Crown, MapPin, Phone, Mail, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Landing() {
  const { t } = useTranslation();

  const services = [
    {
      icon: Scissors,
      name: t("services.classic.name"),
      description: t("services.classic.description"),
      price: "€25",
      features: [
        t("services.classic.features.consultation"),
        t("services.classic.features.washCut"),
        t("services.classic.features.styling"),
        t("services.classic.features.duration"),
      ],
    },
    {
      icon: Star,
      name: t("services.premium.name"),
      description: t("services.premium.description"),
      price: "€35",
      features: [
        t("services.premium.features.consultation"),
        t("services.premium.features.washCut"),
        t("services.premium.features.hotTowel"),
        t("services.premium.features.styling"),
        t("services.premium.features.duration"),
      ],
      popular: true,
    },
    {
      icon: Crown,
      name: t("services.deluxe.name"),
      description: t("services.deluxe.description"),
      price: "€50",
      features: [
        t("services.deluxe.features.consultation"),
        t("services.deluxe.features.washCut"),
        t("services.deluxe.features.hotTowel"),
        t("services.deluxe.features.beardTrim"),
        t("services.deluxe.features.styling"),
        t("services.deluxe.features.duration"),
      ],
    },
  ];

  const contactInfo = [
    {
      icon: MapPin,
      text: "123 Main Street, Amsterdam, Netherlands",
    },
    {
      icon: Phone,
      text: "+31 20 123 4567",
    },
    {
      icon: Mail,
      text: "info@barbershoppro.nl",
    },
  ];

  const openingHours = [
    { day: t("contact.hours.monday"), time: "10:00 AM - 7:00 PM" },
    { day: t("contact.hours.tuesday"), time: "10:00 AM - 7:00 PM" },
    { day: t("contact.hours.wednesday"), time: "10:00 AM - 7:00 PM" },
    { day: t("contact.hours.thursday"), time: "10:00 AM - 7:00 PM" },
    { day: t("contact.hours.friday"), time: "10:00 AM - 7:00 PM" },
    { day: t("contact.hours.saturday"), time: "10:00 AM - 7:00 PM" },
    { day: t("contact.hours.sunday"), time: "10:00 AM - 7:00 PM" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Reviews Section */}
      <section id="reviews" className="py-12 bg-barber-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-barber-dark mb-2">
              {t("reviews.title")}
            </h2>
            <p className="text-gray-600">{t("reviews.subtitle")}</p>
          </div>
          <ReviewsCarousel />
        </div>
      </section>

      {/* Queue Status Section */}
      <section id="queue" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-barber-dark mb-2">
              {t("queue.title")}
            </h2>
            <p className="text-gray-600">{t("queue.subtitle")}</p>
          </div>
          <QueueStatus />
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-12 bg-barber-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-barber-dark mb-2">
              {t("pricing.title")}
            </h2>
            <p className="text-gray-600">{t("pricing.subtitle")}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {services.map((service, index) => (
              <div
                key={index}
                className={`bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow ${
                  service.popular ? "border-2 border-barber-gold" : ""
                }`}
              >
                <div className="text-center">
                  {service.popular && (
                    <div className="bg-barber-gold text-white text-xs px-2 py-1 rounded-full mb-2 inline-block">
                      {t("pricing.popular")}
                    </div>
                  )}
                  <service.icon className="w-8 h-8 text-barber-gold mx-auto mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold text-barber-dark mb-2">
                    {service.name}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-4">{service.description}</p>
                  <div className="text-2xl sm:text-3xl font-bold text-barber-gold mb-4">
                    {service.price}
                  </div>
                  <ul className="text-sm text-gray-600 space-y-2">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex}>• {feature}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-barber-dark mb-2">
              {t("gallery.title")}
            </h2>
            <p className="text-gray-600">{t("gallery.subtitle")}</p>
          </div>
          <GalleryCarousel />
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-12 bg-barber-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-barber-dark mb-2">
              {t("contact.title")}
            </h2>
            <p className="text-gray-600">{t("contact.subtitle")}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
            {/* Contact Information */}
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-md">
              <h3 className="text-lg sm:text-xl font-semibold text-barber-dark mb-4">
                {t("contact.visitShop")}
              </h3>
              <div className="space-y-4">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-center">
                    <info.icon className="w-4 h-4 sm:w-5 sm:h-5 text-barber-gold mr-2 sm:mr-3 flex-shrink-0" />
                    <span className="text-sm sm:text-base text-gray-700">{info.text}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-6">
                <h4 className="text-sm sm:text-base font-semibold text-barber-dark mb-2 flex items-center">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  {t("contact.openingHours")}
                </h4>
                <div className="text-sm text-gray-600 space-y-1">
                  {openingHours.map((hour, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{hour.day}</span>
                      <span>{hour.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Social Media */}
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-md">
              <h3 className="text-lg sm:text-xl font-semibold text-barber-dark mb-4">
                {t("contact.followUs")}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {["Instagram", "Facebook", "Google", "Yelp"].map((platform) => (
                  <a
                    key={platform}
                    href="#"
                    className="flex items-center justify-center p-4 bg-barber-light rounded-lg hover:bg-barber-gold hover:text-white transition-colors"
                  >
                    <span className="font-medium">{platform}</span>
                  </a>
                ))}
              </div>
              
              
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-barber-dark text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">Barbershop Pro</h3>
            <p className="text-gray-300 mb-4">
              {t("footer.tagline")}
            </p>
            <div className="flex justify-center space-x-6">
              {["Instagram", "Facebook", "Google"].map((platform) => (
                <a
                  key={platform}
                  href="#"
                  className="text-gray-300 hover:text-barber-gold transition-colors"
                >
                  <span className="sr-only">{platform}</span>
                  <div className="w-6 h-6 bg-gray-300 rounded"></div>
                </a>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-600 text-sm text-gray-400">
              <p>&copy; 2024 Barbershop Pro. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>


    </div>
  );
}
