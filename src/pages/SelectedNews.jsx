
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Loader2, Mail } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import NewsCard from "../components/analyst/NewsCard";
import { 
  fetchPublishedArticles, 
} from "../components/utils/supabase";

export default function SelectedNews() {
  const [publishedArticles, setPublishedArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSelectedArticles();
  }, []);

  const fetchSelectedArticles = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get published
      const published = await fetchPublishedArticles();
      
      setPublishedArticles(Array.isArray(published) ? published : []);
    } catch (error) {
      setError("Failed to load articles. Please try again.");
      console.error("Error fetching articles:", error);
      setPublishedArticles([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="p-4 sm:p-6 lg:p-8 border-b bg-white flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Published News</h1>
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
        
        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-600 mb-4" />
            <p className="text-gray-500">Loading articles...</p>
          </div>
        ) : (!publishedArticles || publishedArticles.length === 0) ? (
          <div className="text-center py-12 bg-white rounded-lg shadow border">
            <Mail className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No published articles</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              You haven't published any articles in newsletters yet.
            </p>
            <Button 
              onClick={() => navigate(createPageUrl("AnalystDashboard"))} 
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Browse News Articles
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {publishedArticles.map((article) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <NewsCard 
                  article={article} 
                  hideCheckbox={true}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
