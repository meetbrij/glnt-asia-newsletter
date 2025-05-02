
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Book, Calendar, Eye, Loader2, Mail, Plus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { fetchNewsletters } from "../components/utils/supabase";

export default function PublishedNewsletters() {
  const [newsletters, setNewsletters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadNewsletters();
  }, []);

  const loadNewsletters = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await fetchNewsletters();
      setNewsletters(Array.isArray(data) ? data : []);
    } catch (error) {
      setError("Failed to load newsletters. Please try again.");
      console.error("Error fetching newsletters:", error);
      setNewsletters([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewNewsletter = (newsletterId) => {
    if (!newsletterId) return;
    
    // Open newsletter in a new tab without the navigation sidebar
    const url = `${window.location.origin}${createPageUrl(`Newsletter?id=${newsletterId}`)}`;
    window.open(url, "_blank");
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (e) {
      return "Unknown date";
    }
  };
  
  const getArticlesCountry = (newsletter) => {
    // This would normally come from the newsletter data, but we'll mock it
    const countries = ["Philippines", "Singapore", "Thailand"];
    return countries.map((country, index) => (
      <Badge 
        key={country} 
        variant="secondary" 
        className="mr-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
      >
        {country}: {index + 1}
      </Badge>
    ));
  };

  return (
    <div>
      <div className="p-4 sm:p-6 lg:p-8 border-b bg-white flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Published Newsletters</h1>
        <Button 
          className="bg-indigo-600 hover:bg-indigo-700"
          onClick={() => navigate(createPageUrl("AnalystDashboard"))}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create New Newsletter
        </Button>
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
        <h2 className="text-2xl font-bold mb-6">Published Newsletters</h2>
        
        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-600 mb-4" />
            <p className="text-gray-500">Loading newsletters...</p>
          </div>
        ) : !newsletters || newsletters.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow border">
            <Mail className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No newsletters published yet</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Start by selecting articles and publishing your first newsletter.
            </p>
            <Button 
              onClick={() => navigate(createPageUrl("AnalystDashboard"))}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Create Your First Newsletter
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {newsletters.map((newsletter) => (
              <motion.div
                key={newsletter.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="relative aspect-video bg-gray-100">
                    <img
                      src="https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80"
                      alt="Banking"
                      className="w-full h-1/2 object-cover"
                    />
                    <div className="absolute top-4 left-4 bg-white py-1 px-3 rounded-full shadow-sm">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-indigo-600" />
                        <span className="text-sm font-medium">
                          {formatDate(newsletter.publishDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200">
                        {newsletter.id % 2 === 0 ? "Weekly" : "Monthly"}
                      </Badge>
                      <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">
                        {newsletter.articles.length || 0} articles
                      </Badge>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2 line-clamp-1">
                      {newsletter.title || "Banking Technology Insights"}
                    </h3>
                    
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {newsletter.description || "The latest news and technological advancements in the banking sector from across Asia-Pacific."}
                    </p>
                    
                    <div className="bg-indigo-50 rounded-lg p-3 mb-4">
                      <h4 className="text-sm font-medium text-indigo-800 mb-2">Articles by Country:</h4>
                      <div className="flex flex-wrap gap-2">
                        {getArticlesCountry(newsletter)}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-500">
                        <Eye className="h-4 w-4 mr-1" />
                        <span>{newsletter.views || 0} views</span>
                      </div>
                      
                      <Button 
                        variant="outline"
                        className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                        onClick={() => handleViewNewsletter(newsletter.id)}
                      >
                        View Newsletter
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
