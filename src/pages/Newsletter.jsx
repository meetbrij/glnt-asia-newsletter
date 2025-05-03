import { useState, useEffect } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { AlertCircle, Calendar, MapPin, Tag, Loader2, ExternalLink, Building } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toTitleCase } from "@/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  fetchNewsletters, 
  getNewsletterArticles,
  incrementNewsletterViews,
  incrementArticleViews
} from "../components/utils/supabase";

const COUNTRY_IMAGES = {
  "australia": "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?auto=format&fit=crop&q=80&w=1600&h=600",
  "japan": "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&q=80&w=1600&h=600",
  "hongkong": "https://images.unsplash.com/photo-1507941097613-9f2157b69235?auto=format&fit=crop&q=80&w=1600&h=600",
  "singapore": "https://images.unsplash.com/photo-1694400996388-918679ad0fa1?auto=format&fit=crop&q=80&w=1600&h=600",
  "malaysia": "https://images.unsplash.com/photo-1566914447826-bf04e54bf1be?auto=format&fit=crop&q=80&w=1600&h=600",
  "indonesia": "https://images.unsplash.com/photo-1567320032761-8d7fb7a5aa4e?auto=format&fit=crop&q=80&w=1600&h=600",
  "thailand": "https://images.unsplash.com/photo-1623637841657-2ad345b58e6a?auto=format&fit=crop&q=80&w=1600&h=600",
  "philippines": "https://images.unsplash.com/photo-1501890664351-4ef399c1524f?auto=format&fit=crop&q=80&w=1600&h=600"
};

const DEFAULT_BANNER = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1600&h=600";

// This component is used for the standalone newsletter view
export default function Newsletter() {
  const [newsletter, setNewsletter] = useState(null);
  const [groupedArticles, setGroupedArticles] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const newsletterId = urlParams.get('id');
    
    if (!newsletterId) {
      setError("No newsletter ID provided");
      setIsLoading(false);
      return;
    }

    loadNewsletter(newsletterId);
  }, []);

  const loadNewsletter = async (newsletterId) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch all newsletters
      const newsletters = await fetchNewsletters();
      
      if (!Array.isArray(newsletters) || newsletters.length === 0) {
        setError("No newsletters available");
        return;
      }
      
      // Find the requested newsletter
      const selectedNewsletter = newsletters.find(n => n.id == newsletterId);
      
      if (!selectedNewsletter) {
        setError("Newsletter not found");
        return;
      }
      
      setNewsletter(selectedNewsletter);
      
      // Record the view
      try {
        await incrementNewsletterViews(newsletterId);
      } catch (e) {
        console.error("Failed to record newsletter view:", e);
      }
      
      // Load articles for this newsletter
      const newsletterArticles = await getNewsletterArticles(selectedNewsletter.articles);
      
      if (!Array.isArray(newsletterArticles)) {
        throw new Error("Failed to fetch newsletter articles");
      }
      
      // Group by country
      const grouped = {};
      newsletterArticles.forEach(article => {
        const country = article.country || "Other";
        if (!grouped[country]) {
          grouped[country] = [];
        }
        grouped[country].push(article);
      });
      
      setGroupedArticles(grouped);
      
      // Set default active tab to first country if any
      if (Object.keys(grouped).length > 0) {
        setActiveTab("all");
      }
    } catch (error) {
      setError("Failed to load newsletter. Please try again.");
      console.error("Error loading newsletter:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleArticleView = async (articleId) => {
    try {
      await incrementArticleViews(articleId);
    } catch (e) {
      console.error("Failed to record article view:", e);
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMMM d, yyyy");
    } catch (e) {
      return "Unknown date";
    }
  };

  const getCountryColor = (country) => {
    const colors = {
      "australia": "bg-emerald-100 text-emerald-800 border-emerald-200",
      "japan": "bg-red-100 text-red-800 border-red-200",
      "hong kong": "bg-purple-100 text-purple-800 border-purple-200",
      "singapore": "bg-blue-100 text-blue-800 border-blue-200",
      "malaysia": "bg-yellow-100 text-yellow-800 border-yellow-200",
      "indonesia": "bg-orange-100 text-orange-800 border-orange-200",
      "thailand": "bg-pink-100 text-pink-800 border-pink-200",
      "philippines": "bg-indigo-100 text-indigo-800 border-indigo-200"
    };
    
    return colors[country] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getCategoryColor = (category) => {
    const colors = {
      "Wealth Management": "bg-violet-100 text-violet-800",
      "Private Banking": "bg-blue-100 text-blue-800",
      "Global Markets": "bg-green-100 text-green-800",
      "Cloud Computing": "bg-cyan-100 text-cyan-800",
      "Risk Management": "bg-red-100 text-red-800",
      "AML or KYC": "bg-amber-100 text-amber-800",
      "Institutional Banking": "bg-indigo-100 text-indigo-800",
      "Digital Banking": "bg-purple-100 text-purple-800",
      "Cash Management": "bg-teal-100 text-teal-800",
      "Retail Banking": "bg-rose-100 text-rose-800"
    };
    
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  const getCountryImage = (country) => {
    return COUNTRY_IMAGES[country] || DEFAULT_BANNER;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 mb-4 animate-spin mx-auto text-indigo-600" />
          <p className="text-gray-500">Loading newsletter...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <Alert className="max-w-xl">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const title = newsletter?.title || "Banking Sector Newsletter";
  const date = newsletter?.publishDate 
    ? formatDate(newsletter.publishDate)
    : format(new Date(), "MMMM d, yyyy");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Logo and Header */}
      <div className="bg-white shadow-sm py-6 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="flex items-center justify-center mb-10 border-b-2 p-4">
            <img
              src="/glnt-asia-logo.jpg"
              alt="GLNT ASIA MARKET INTELLIGENCE"
              className="h-7 w-7 sm:h-10 sm:w-10 object-contain"
            />
            <span className="font-josefin text-2xl ml-1 sm:text-3xl md:text-4xl">
              <span className="font-bold text-gray-800">GLNT</span>
              <span className="text-sky-700 font-normal">ELLIGENCE</span>
            </span>
          </div>
          <h2 className="text-sm font-medium text-indigo-600 uppercase tracking-wider mb-2">Banking Sector News</h2>
          <h1 className="text-2xl md:text-3xl font-bold mb-1">{title}</h1>
          <div className="flex items-center text-gray-500">
            <Calendar className="h-4 w-4 mr-2" />
            {date}
          </div>
        </div>
      </div>

      {/* Banner Image */}
      <div className="relative h-[300px] md:h-[400px] overflow-hidden">
        <img
          src={activeTab === "all" ? DEFAULT_BANNER : getCountryImage(activeTab)}
          alt={`Banking in ${activeTab === "all" ? "Asia Pacific" : activeTab}`}
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="container mx-auto max-w-5xl px-4 md:px-6">
        {/* Description */}
        <div className="bg-white shadow-sm rounded-lg p-6 mt-6 mb-12">
          <p className="text-lg text-gray-700">
            {newsletter?.description || "Latest news and insights from the banking sector across Asia-Pacific."}
          </p>
        </div>

        {/* Country Tabs */}
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="mb-8"
        >
          <TabsList className="mb-6 flex flex-wrap gap-2 h-auto">
            <TabsTrigger value="all" className="bg-white data-[state=active]:bg-indigo-100">
              All Regions
            </TabsTrigger>
            {Object.keys(groupedArticles).map((country) => (
              <TabsTrigger 
                key={country} 
                value={country}
                className="bg-white data-[state=active]:bg-indigo-100"
              >
                <MapPin className="h-4 w-4 mr-1" />
                {country.toUpperCase()}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value="all" className="mt-0">
            <div className="space-y-12">
              {Object.entries(groupedArticles).map(([country, countryArticles]) => (
                <div key={country}>
                  <div className="flex items-center gap-2 mb-6">
                    <Badge variant="outline" className="px-3 py-1 border-2 bg-indigo-50 border-indigo-100 text-indigo-800">
                      <MapPin className="h-3.5 w-3.5 mr-1.5" />
                      {country}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {countryArticles.length} articles
                    </span>
                  </div>
                  
                  <div className="grid gap-6">
                    {countryArticles.map((article) => (
                      <ArticleCard 
                        key={article.id} 
                        article={article}
                        onView={() => handleArticleView(article.id)}
                        getCategoryColor={getCategoryColor}
                        getCountryColor={getCountryColor}
                        formatDate={formatDate}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          {Object.entries(groupedArticles).map(([country, countryArticles]) => (
            <TabsContent key={country} value={country} className="mt-0">
              <div className="space-y-6">
                {countryArticles.map((article) => (
                  <ArticleCard 
                    key={article.id} 
                    article={article} 
                    onView={() => handleArticleView(article.id)}
                    getCategoryColor={getCategoryColor}
                    getCountryColor={getCountryColor}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
      
      <div className="bg-gray-100 py-8 mt-16">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img
                src="/glnt-asia-logo.jpg"
                alt="GLNT ASIA MARKET INTELLIGENCE"
                className="h-5 w-5 sm:h-10 sm:w-10 object-contain"
              />
              <span className="font-josefin text-base ml-1 sm:text-2xl md:text-2xl">
                <span className="font-bold text-gray-800">GLNT</span>
                <span className="text-sky-700 font-normal">ELLIGENCE</span>
              </span>
            </div>
            <div className="text-sm text-gray-500">
              Published on {date}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ArticleCard({ article, onView, getCategoryColor, getCountryColor, formatDate }) {

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
        <div className="flex flex-col space-y-4">
          <h2 className="text-xl font-bold mb-2">{article.title}</h2>

          <div className="flex items-center gap-1 mb-3">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-500">{formatDate(article.created_date)}</span>
          </div>
          
          <p className="text-gray-700 mb-4">{article.summary}</p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="outline"  className="flex items-center gap-1">
              <Building className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium">{article.company}</span>
            </Badge>

            <Badge variant="outline" className={`${getCountryColor(article.country)}`}>
              <MapPin className="h-3 w-3 mr-1" />
              {article.country.toUpperCase()}
            </Badge>

            {article.category && (
              <Badge className={getCategoryColor(toTitleCase(article.category))}>
                <Tag className="h-3 w-3 mr-1" />
                {toTitleCase(article.category)}
              </Badge>
            )}
          </div>
          
          <div className="flex justify-end items-center">
            <Button
              variant="outline"
              size="sm"
              asChild
              onClick={onView}
              className="text-indigo-600 hover:text-indigo-800"
            >
              <a
                href={article.source || "#"}
                target="_blank"
                rel="noopener noreferrer"
              >
                Read Full Article <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
