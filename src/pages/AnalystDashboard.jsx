
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { 
  AlertCircle, 
  ChevronDown, 
  Filter,
  Loader2, 
  FileText, 
  Calendar,
  Check,
  Mail,
  Search
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import NewsletterForm from "../components/analyst/NewsletterForm";
import NewsCard from "../components/analyst/NewsCard";
import { 
  fetchArticles, 
  updateArticle, 
  createNewsletter 
} from "../components/utils/supabase";

const COUNTRIES = ["Australia", "Japan", "Hong Kong", "Singapore", "Malaysia", "Indonesia", "Thailand", "Philippines"];
const CATEGORIES = ["Wealth Management", "Private Banking", "Global Markets", "Capital Markets", "Risk Management", "AML/KYC", "Core Banking", "Transaction Banking", "Cash Management", "Payments"];

export default function AnalystDashboard() {
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [selectedArticles, setSelectedArticles] = useState([]);
  const [filters, setFilters] = useState({ country: "all", category: "all" });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewsletterForm, setShowNewsletterForm] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();

  // Load articles on mount
  useEffect(() => {
    loadArticles();
  }, []);

  // Apply filters when filters change or articles change
  useEffect(() => {
    if (articles && articles.length) {
      applyFilters();
    }
  }, [filters, articles, activeTab, searchText]);

  const loadArticles = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await fetchArticles();
      
      if (!data || !Array.isArray(data)) {
        throw new Error("Invalid data returned from Supabase");
      }
      
      setArticles(data);
      setFilteredArticles(data);

      const selected = data.filter(a => a.selectedForNewsletter && !a.publishedInNewsletter);
      setSelectedArticles(selected || []);
    } catch (error) {
      setError("Failed to load articles. Please try again.");
      console.error("Error fetching articles:", error);
      // Set empty arrays to prevent errors
      setArticles([]);
      setFilteredArticles([]);
      setSelectedArticles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    if (!Array.isArray(articles)) {
      setFilteredArticles([]);
      return;
    }

    let result = [...articles];
    
    if (filters.country !== "all") {
      result = result.filter((article) => {
        let country =article.country.toLowerCase();
        if(country === "hongkong") {
          article.country = "hong kong"
        } 
        return country === filters.country.toLowerCase()

      });
    }
    
    if (filters.category !== "all") {
      result = result.filter(article => article.category === filters.category);
    }
    
    if (activeTab === "selected") {
      result = result.filter(article => article.selectedForNewsletter);
    } else if (activeTab === "featured") {
      result = result.filter((_, index) => index % 3 === 0);
    }
    
    if (searchText) {
      const lowerSearch = searchText.toLowerCase();
      result = result.filter(article => 
        (article.title?.toLowerCase() || "").includes(lowerSearch) ||
        (article.company?.toLowerCase() || "").includes(lowerSearch) ||
        (article.summary?.toLowerCase() || "").includes(lowerSearch)
      );
    }
    
    setFilteredArticles(result);
  };

  const handleSearchChange = (e) => {
    setSearchText(e.target.value || "");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    applyFilters();
  };

  const handleArticleSelect = async (article) => {
    if (!article || !article.id) {
      console.error("Invalid article to select:", article);
      return;
    }

    try {
      // Update article in Supabase
      await updateArticle(article.id, {
        selectedForNewsletter: !article.selectedForNewsletter
      });
      
      // Update local state
      setSelectedArticles(prev => {
        if (!Array.isArray(prev)) prev = [];
        
        const isAlreadySelected = prev.some(a => a.id === article.id);
        
        if (isAlreadySelected) {
          return prev.filter(a => a.id !== article.id);
        } else {
          return [...prev, article];
        }
      });
      
      // Update article in the articles array
      setArticles(prev => {
        return prev.map(a => {
          if (a.id === article.id) {
            return { ...a, selectedForNewsletter: !a.selectedForNewsletter };
          }
          return a;
        });
      });
    } catch (error) {
      setError("Failed to update article. Please try again.");
      console.error("Error updating article:", error);
    }
  };

  const handlePublishClick = () => {
    if (!selectedArticles || selectedArticles.length === 0) return;
    setShowNewsletterForm(true);
  };

  const handlePublishNewsletter = async (newsletterData) => {
    if (!selectedArticles || selectedArticles.length === 0) {
      setError("No articles selected for newsletter");
      return;
    }

    setIsPublishing(true);
    
    try {
      // Create newsletter in Supabase and update articles
      await createNewsletter(
        newsletterData, 
        selectedArticles.map(a => a.id)
      );
      
      // Reset selected articles and close form
      setSelectedArticles([]);
      setShowNewsletterForm(false);
      
      // Refresh articles list
      await loadArticles();
      
      // Navigate to the published newsletters page
      navigate(createPageUrl("PublishedNewsletters"));
    } catch (error) {
      setError("Failed to publish newsletter. Please try again.");
      console.error("Error publishing newsletter:", error);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div>
      <div className="p-4 sm:p-6 lg:p-8 border-b bg-white">
        <h1 className="text-2xl font-bold text-gray-900">Banking News Analysis Dashboard</h1>
      </div>
      
      {error && (
        <div className="mx-4 sm:mx-6 lg:mx-8 mt-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}
      
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Stats Card */}
        <div className="bg-white rounded-lg shadow mb-8 overflow-hidden">
          <div className="bg-indigo-600 text-white p-6 flex gap-4 items-start">
            <FileText className="h-8 w-8" />
            <div>
              <h2 className="text-xl font-semibold">Banking News Tracker</h2>
              <p className="opacity-90">
                Track and analyze banking news from across APAC region
              </p>
            </div>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-gray-500 mb-1">Last updated</div>
              <div className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <div>Today at {new Date().toLocaleTimeString()}</div>
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-500 mb-1">Articles collected</div>
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-gray-400 mr-2" />
                <div>{articles?.length || 0} articles</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs and Publish Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All Articles</TabsTrigger>
              <TabsTrigger value="selected">
                Selected
                <Badge className="ml-1 bg-indigo-500 hover:bg-indigo-600">
                  {articles?.filter(a => a.selectedForNewsletter)?.length || 0}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="featured">Featured</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={handlePublishClick}
            disabled={!selectedArticles || selectedArticles.length === 0}
          >
            <Mail className="mr-2 h-4 w-4" />
            Publish Newsletter ({selectedArticles?.length || 0})
          </Button>
        </div>
        
        {/* Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="lg:col-span-2">
            <div className="relative">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search bank name..."
                    value={searchText}
                    onChange={handleSearchChange}
                    className="w-full pl-10"
                  />
                </div>
              </form>
            </div>
          </div>
          
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {filters.country === "all" ? "All Countries" : filters.country}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full">
                <DropdownMenuItem onClick={() => setFilters({...filters, country: "all"})}>
                  All Countries
                </DropdownMenuItem>
                {COUNTRIES.map(country => (
                  <DropdownMenuItem 
                    key={country}
                    onClick={() => setFilters({...filters, country})}
                  >
                    {country}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {filters.category === "all" ? "All Categories" : filters.category}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full">
                <DropdownMenuItem onClick={() => setFilters({...filters, category: "all"})}>
                  All Categories
                </DropdownMenuItem>
                {CATEGORIES.map(category => (
                  <DropdownMenuItem 
                    key={category}
                    onClick={() => setFilters({...filters, category})}
                  >
                    {category}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Article List */}
        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-600 mb-4" />
            <p className="text-gray-500">Loading articles...</p>
          </div>
        ) : !filteredArticles || filteredArticles.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow border">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Try adjusting your filters to find banking news articles.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredArticles.map((article) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <NewsCard 
                  article={article} 
                  onSelect={handleArticleSelect}
                  isSelected={
                    selectedArticles?.some(a => a.id === article.id) || 
                    article.selectedForNewsletter
                  }
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
      
      <NewsletterForm 
        isOpen={showNewsletterForm} 
        onClose={() => setShowNewsletterForm(false)}
        onPublish={handlePublishNewsletter}
        selectedArticles={selectedArticles || []}
        isPublishing={isPublishing}
      />
    </div>
  );
}
