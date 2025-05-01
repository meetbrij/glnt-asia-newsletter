import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { Book, Calendar, Eye } from "lucide-react";

export default function NewsletterCard({ newsletter, onClick }) {
  const formatDate = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return "Recently";
    }
  };

  const getArticleCount = () => {
    if (!newsletter.articles) return 0;
    return Array.isArray(newsletter.articles) ? newsletter.articles.length : 0;
  };

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md cursor-pointer" onClick={onClick}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold">{newsletter.title}</CardTitle>
          <Badge className="bg-indigo-100 text-indigo-800">
            {getArticleCount()} articles
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <p className="text-gray-600 line-clamp-2">{newsletter.description}</p>
      </CardContent>
      
      <CardFooter className="pt-4 border-t flex justify-between items-center">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(newsletter.publishDate)}</span>
        </div>
        
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <Eye className="h-4 w-4" />
          <span>{newsletter.views || 0}</span>
        </div>
      </CardFooter>
    </Card>
  );
}