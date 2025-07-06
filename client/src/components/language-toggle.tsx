import { useTranslation } from "@/hooks/useTranslation";

export default function LanguageToggle() {
  const { language, setLanguage } = useTranslation();

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "nl" : "en");
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-100"
      title={`Switch to ${language === "en" ? "Dutch" : "English"}`}
    >
      {language === "en" ? (
        <>
          <span className="mr-1">🇳🇱</span> NL
        </>
      ) : (
        <>
          <span className="mr-1">🇺🇸</span> EN
        </>
      )}
    </button>
  );
}
