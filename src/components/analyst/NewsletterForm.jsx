import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Book, 
  Calendar, 
  CheckCircle2, 
  FileText, 
  Loader2 
} from "lucide-react";

export default function NewsletterForm({ 
  isOpen, 
  onClose, 
  onPublish, 
  selectedArticles = [], 
  isPublishing = false 
}) {
  const [newsletterData, setNewsletterData] = useState({
    title: `Banking Sector Newsletter - ${new Date().toLocaleDateString()}`,
    description: "Latest news and insights from the banking sector across Asia-Pacific."
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewsletterData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onPublish({
      ...newsletterData,
      publishDate: new Date().toISOString(),
      articles: selectedArticles.map(article => article.id)
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Book className="h-5 w-5 text-indigo-600" />
            Create Newsletter
          </DialogTitle>
          <DialogDescription>
            You are about to publish {selectedArticles.length} selected articles to a newsletter.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Newsletter Title</Label>
            <Input
              id="title"
              name="title"
              value={newsletterData.title}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={newsletterData.description}
              onChange={handleChange}
              rows={3}
              required
            />
          </div>
          
          <div className="rounded-md bg-indigo-50 p-4">
            <div className="flex gap-2">
              <FileText className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-indigo-900">Selected Articles</h4>
                <p className="text-sm text-indigo-700">
                  {selectedArticles.length} articles will be published
                </p>
                <div className="mt-2 text-xs text-indigo-600 space-y-1">
                  {selectedArticles.slice(0, 3).map((article, index) => (
                    <div key={index} className="flex items-start gap-1">
                      <CheckCircle2 className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <span className="truncate">{article.title}</span>
                    </div>
                  ))}
                  {selectedArticles.length > 3 && (
                    <div className="text-indigo-600">
                      +{selectedArticles.length - 3} more articles
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center text-sm text-gray-500 gap-1">
            <Calendar className="h-4 w-4" />
            Will be published immediately with today's date
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isPublishing}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-indigo-600 hover:bg-indigo-700"
              disabled={isPublishing}
            >
              {isPublishing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : (
                "Publish Newsletter"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}