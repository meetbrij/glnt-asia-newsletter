
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Check, Loader2, Mail, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import NewsletterForm from "../components/analyst/NewsletterForm";
import NewsCard from "../components/analyst/NewsCard";
import { 
  fetchArticles, 
  updateArticle, 
  createNewsletter 
} from "../components/utils/supabase";

export default function SelectedNews() {
  const [selectedArticles, setSelectedArticles] = useState([]);
  const [publishedArticles, setPublishedArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("selected");
  const [showNewsletterForm, setShowNewsletterForm] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSelectedArticles();
  }, []);

  const fetchSelectedArticles = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get selected but not published
      const selected = await fetchArticles({ 
        selected: true,
        published: false
      });
      
      // Get published
      const published = await fetchArticles({
        published: true
      });
      
      setSelectedArticles(Array.isArray(selected) ? selected : []);
      setPublishedArticles(Array.isArray(published) ? published : []);
    } catch (error) {
      setError("Failed to load articles. Please try again.");
      console.error("Error fetching articles:", error);
      setSelectedArticles([]);
      setPublishedArticles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleArticleSelect = async (article) => {
    if (!article || !article.id) return;
    if (activeTab === "published") return; // Can't deselect published articles
    
    try {
      // Update in Supabase
      await updateArticle(article.id, {
        selectedForNewsletter: !article.selectedForNewsletter
      });
      
      // Refresh articles
      await fetchSelectedArticles();
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
      
      // Close form
      setShowNewsletterForm(false);
      
      // Refresh articles
      await fetchSelectedArticles();
      
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
      <div className="p-4 sm:p-6 lg:p-8 border-b bg-white flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Selected News</h1>
        <Button 
          className="bg-indigo-600 hover:bg-indigo-700"
          disabled={!selectedArticles || selectedArticles.length === 0}
          onClick={handlePublishClick}
        >
          <Mail className="mr-2 h-4 w-4" />
          Publish Newsletter ({selectedArticles?.length || 0})
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
        <Tabs 
          defaultValue="selected" 
          className="mb-6"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList>
            <TabsTrigger value="selected" className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              Selected
              {selectedArticles && selectedArticles.length > 0 && ` (${selectedArticles.length})`}
            </TabsTrigger>
            <TabsTrigger value="published" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Published
              {publishedArticles && publishedArticles.length > 0 && ` (${publishedArticles.length})`}
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-600 mb-4" />
            <p className="text-gray-500">Loading articles...</p>
          </div>
        ) : (activeTab === "selected" && (!selectedArticles || selectedArticles.length === 0)) ? (
          <div className="text-center py-12 bg-white rounded-lg shadow border">
            <Mail className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No selected articles</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              You haven't selected any articles for the newsletter yet.
            </p>
            <Button 
              onClick={() => navigate(createPageUrl("AnalystDashboard"))} 
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Browse News Articles
            </Button>
          </div>
        ) : (activeTab === "published" && (!publishedArticles || publishedArticles.length === 0)) ? (
          <div className="text-center py-12 bg-white rounded-lg shadow border">
            <Mail className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No published articles</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              You haven't published any articles in newsletters yet.
            </p>
            {selectedArticles && selectedArticles.length > 0 && (
              <Button 
                onClick={() => setActiveTab("selected")} 
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                View Selected Articles
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {(activeTab === "selected" ? selectedArticles : publishedArticles).map((article) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <NewsCard 
                  article={article} 
                  onSelect={handleArticleSelect}
                  isSelected={article.selectedForNewsletter}
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
