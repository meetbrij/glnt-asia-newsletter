import React from "react";
import { 
  Building, 
  MapPin,
  Tag,
  Calendar,
  ExternalLink
} from "lucide-react";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function NewsCard({ article, onSelect, isSelected, hideCheckbox=false }) {
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString || new Date()), "MMM d, yyyy");
    } catch (e) {
      return "Recently";
    }
  };

  const getCountryColor = (country) => {
    const colors = {
      "Australia": "bg-emerald-100 text-emerald-800 border-emerald-200",
      "Japan": "bg-red-100 text-red-800 border-red-200",
      "Hong Kong": "bg-purple-100 text-purple-800 border-purple-200",
      "Singapore": "bg-blue-100 text-blue-800 border-blue-200",
      "Malaysia": "bg-yellow-100 text-yellow-800 border-yellow-200",
      "Indonesia": "bg-orange-100 text-orange-800 border-orange-200",
      "Thailand": "bg-pink-100 text-pink-800 border-pink-200",
      "Philippines": "bg-indigo-100 text-indigo-800 border-indigo-200"
    };
    
    return colors[country] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getCategoryColor = (category) => {
    const colors = {
      "Wealth Management": "bg-violet-100 text-violet-800",
      "Private Banking": "bg-blue-100 text-blue-800",
      "Global Markets": "bg-green-100 text-green-800",
      "Capital Markets": "bg-cyan-100 text-cyan-800",
      "Risk Management": "bg-red-100 text-red-800",
      "AML/KYC": "bg-amber-100 text-amber-800",
      "Core Banking": "bg-indigo-100 text-indigo-800",
      "Transaction Banking": "bg-purple-100 text-purple-800",
      "Cash Management": "bg-teal-100 text-teal-800",
      "Payments": "bg-rose-100 text-rose-800"
    };
    
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className={`bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border ${isSelected ? 'border-indigo-300 bg-indigo-50/20' : ''}`}>
      <div className="flex items-start gap-3">

        {!hideCheckbox && (
          <Checkbox
            id={`article-${article.id}`}
            checked={isSelected || article.selected_for_newsletter}
            onCheckedChange={() => onSelect(article)}
            className="mt-1 h-5 w-5 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
          />
        )}
        
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-2">{article.title}</h3>
          
          <div className="flex items-center gap-1 mb-3">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-500">{formatDate(article.date)}</span>
          </div>
          
          <div className="flex items-center gap-1 mb-3">
            <Building className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium">{article.company}</span>
          </div>
          
          <p className="text-gray-700 mb-4">{article.summary}</p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="outline" className={`${getCountryColor(article.country)}`}>
              <MapPin className="h-3 w-3 mr-1" />
              {article.country.toUpperCase()}
            </Badge>
            
            {article.category && (
              <Badge className={`${getCategoryColor(article.category)}`}>
                <Tag className="h-3 w-3 mr-1" />
                {article.category}
              </Badge>
            )}
          </div>
          
          <div className="flex justify-end items-center">
            {/* <span className="text-sm text-gray-500">
              Source: {article.source || "Financial Times"}
            </span> */}
            
            {article.source && (
              <Button 
                variant="outline" 
                size="sm"
                className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                asChild
              >
                <a 
                  href={article.source} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  Read Article <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}