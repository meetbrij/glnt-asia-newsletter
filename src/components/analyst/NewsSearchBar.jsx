import React, { useState } from "react";
import { 
  Search, 
  Filter, 
  Clock, 
  RefreshCw, 
  Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const COUNTRIES = ["Australia", "Japan", "Hong Kong", "Singapore", "Malaysia", "Indonesia", "Thailand", "Philippines"];
const CATEGORIES = ["Wealth Management", "Private Banking", "Global Markets", "Capital Markets", "Risk Management", "AML/KYC", "Core Banking", "Transaction Banking", "Cash Management", "Payments"];

export default function NewsSearchBar({ 
  filters, 
  setFilters, 
  onSearch, 
  onPublish, 
  refreshInterval,
  setRefreshInterval,
  selectedCount = 0,
  isSearching = false
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleFilterChange = (type, value) => {
    setFilters(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      country: "all",
      category: "all"
    });
    setSearchTerm("");
  };

  return (
    <div className="bg-white border-b sticky top-0 z-20 mb-6">
      <div className="container px-4 py-4">
        <form onSubmit={handleSearch} className="flex flex-col space-y-4">
          {/* Search and publish row */}
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                className="pl-10"
                placeholder="Search for banking news..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="bg-indigo-600 hover:bg-indigo-700"
                    disabled={!selectedCount}
                    onClick={onPublish}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Publish Newsletter
                    {selectedCount > 0 && (
                      <Badge variant="secondary" className="ml-2 bg-white text-indigo-700">
                        {selectedCount}
                      </Badge>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {selectedCount ? 
                    `Publish ${selectedCount} selected articles to newsletter` : 
                    "Select articles first to publish newsletter"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Filters row */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center">
              <Filter className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-sm font-medium mr-2">Filters:</span>
            </div>
            
            <Select
              value={filters.country}
              onValueChange={(value) => handleFilterChange("country", value)}
            >
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {COUNTRIES.map((country) => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select
              value={filters.category}
              onValueChange={(value) => handleFilterChange("category", value)}
            >
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <Clock className="h-4 w-4 mr-2" />
                  {refreshInterval === 'daily' ? 'Daily Refresh' : 
                   refreshInterval === 'weekly' ? 'Weekly Refresh' : 'Monthly Refresh'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Refresh Interval</h4>
                  <p className="text-xs text-gray-500">Set how often news search is run</p>
                  <Separator />
                  <div className="flex flex-col gap-2 pt-1">
                    {['daily', 'weekly', 'monthly'].map((interval) => (
                      <Button
                        key={interval}
                        variant={refreshInterval === interval ? "default" : "ghost"}
                        className={refreshInterval === interval ? "bg-indigo-600 hover:bg-indigo-700" : ""}
                        size="sm"
                        onClick={() => setRefreshInterval(interval)}
                      >
                        {interval.charAt(0).toUpperCase() + interval.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <div className="flex gap-2 ml-auto">
              <Button 
                type="submit" 
                size="sm" 
                className="h-9 bg-indigo-600 hover:bg-indigo-700"
                disabled={isSearching}
              >
                {isSearching ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                className="h-9"
                onClick={clearFilters}
              >
                Clear
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}