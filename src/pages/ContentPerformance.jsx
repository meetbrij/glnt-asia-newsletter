import React, { useState, useEffect } from "react";
import { Article } from "@/api/entities";
import { Newsletter } from "@/api/entities";
import { format } from "date-fns";
import { BarChart3, Download, ExternalLink, Filter, Loader2, SortAsc, SortDesc } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import BarChart from "../components/manager/BarChart";
import PieChart from "../components/manager/PieChart";

export default function ContentPerformance() {
  const [isLoading, setIsLoading] = useState(true);
  const [articles, setArticles] = useState([]);
  const [newsletters, setNewsletters] = useState([]);
  const [activeTab, setActiveTab] = useState("articles");
  const [sortBy, setSortBy] = useState("created_date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [filterBy, setFilterBy] = useState("all");
  
  // Data for charts
  const [viewsByCategory, setViewsByCategory] = useState([]);
  const [viewsByCountry, setViewsByCountry] = useState([]);
  const [publishDistribution, setPublishDistribution] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    
    try {
      // Fetch articles and newsletters
      const articlesData = await Article.list();
      const newslettersData = await Newsletter.list();
      
      setArticles(articlesData);
      setNewsletters(newslettersData);
      
      // Process data for analytics
      processAnalyticsData(articlesData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const processAnalyticsData = (articlesData) => {
    // Process views by category
    const categoryViews = {};
    articlesData.forEach(article => {
      if (!article.category) return;
      const views = article.views || 0;
      categoryViews[article.category] = (categoryViews[article.category] || 0) + views;
    });
    
    const categoryViewsArray = Object.entries(categoryViews)
      .map(([name, views]) => ({ 
        name: name.replace(/_/g, ' '),
        views
      }))
      .sort((a, b) => b.views - a.views);
    
    setViewsByCategory(categoryViewsArray);

    // Process views by country
    const countryViews = {};
    articlesData.forEach(article => {
      if (!article.country) return;
      const views = article.views || 0;
      countryViews[article.country] = (countryViews[article.country] || 0) + views;
    });
    
    const countryViewsArray = Object.entries(countryViews)
      .map(([name, views]) => ({ name, views }))
      .sort((a, b) => b.views - a.views);
    
    setViewsByCountry(countryViewsArray);

    // Process publish distribution
    const published = articlesData.filter(a => a.publishedInNewsletter).length;
    const selected = articlesData.filter(a => a.selected_for_newsletter && !a.publishedInNewsletter).length;
    const notSelected = articlesData.filter(a => !a.selected_for_newsletter).length;
    
    setPublishDistribution([
      { name: 'Published', value: published },
      { name: 'Selected', value: selected },
      { name: 'Not Selected', value: notSelected }
    ]);
  };

  const sortedArticles = () => {
    let filtered = [...articles];
    
    // Apply filters
    if (filterBy === "published") {
      filtered = filtered.filter(a => a.publishedInNewsletter);
    } else if (filterBy === "selected") {
      filtered = filtered.filter(a => a.selected_for_newsletter && !a.publishedInNewsletter);
    } else if (filterBy === "not_selected") {
      filtered = filtered.filter(a => !a.selected_for_newsletter);
    }
    
    // Apply sorting
    return filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      // Handle nullish values
      if (aValue === null || aValue === undefined) aValue = 0;
      if (bValue === null || bValue === undefined) bValue = 0;
      
      // Handle string vs number comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const sortedNewsletters = () => {
    return [...newsletters].sort((a, b) => {
      if (sortBy === 'publishDate') {
        return sortOrder === 'asc' 
          ? new Date(a.publishDate) - new Date(b.publishDate)
          : new Date(b.publishDate) - new Date(a.publishDate);
      }
      
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      // Handle nullish values
      if (aValue === null || aValue === undefined) aValue = 0;
      if (bValue === null || bValue === undefined) bValue = 0;
      
      // Handle string comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (e) {
      return "Unknown";
    }
  };

  if (isLoading) {
    return (
      <div className="container p-4 md:p-6 flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 mb-4 animate-spin mx-auto text-indigo-600" />
          <p className="text-gray-500">Loading content performance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Content Performance</h1>
        <p className="text-gray-500">Analyze article and newsletter performance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Views by Category</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <BarChart
              title=""
              data={viewsByCategory}
              dataKey="views"
              nameKey="name"
              color="#8b5cf6"
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Views by Country</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <BarChart
              title=""
              data={viewsByCountry}
              dataKey="views"
              nameKey="name"
              color="#3b82f6"
            />
          </CardContent>
        </Card>
      </div>

      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="articles">Articles</TabsTrigger>
            <TabsTrigger value="newsletters">Newsletters</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={toggleSortOrder}>
              {sortOrder === 'asc' ? (
                <SortAsc className="h-4 w-4 mr-1" />
              ) : (
                <SortDesc className="h-4 w-4 mr-1" />
              )}
              {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            </Button>
            
            <Button variant="outline" size="sm" asChild>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  // In a real app, this would generate and download a CSV/Excel file
                  alert("Export functionality would be implemented here");
                }}
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </a>
            </Button>
          </div>
        </div>
        
        <TabsContent value="articles" className="m-0">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Sort by:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_date">Date Added</SelectItem>
                  <SelectItem value="views">Views</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                  <SelectItem value="country">Country</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Filter:</span>
              <Select value={filterBy} onValueChange={setFilterBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Articles</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="selected">Selected Only</SelectItem>
                  <SelectItem value="not_selected">Not Selected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Title</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="text-right">Views</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedArticles().map((article) => (
                  <TableRow key={article.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <span className="truncate max-w-[250px]">{article.title}</span>
                        {article.url && (
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{article.company}</TableCell>
                    <TableCell>{article.country}</TableCell>
                    <TableCell>
                      {article.publishedInNewsletter ? (
                        <Badge className="bg-green-100 text-green-800">Published</Badge>
                      ) : article.selected_for_newsletter ? (
                        <Badge className="bg-blue-100 text-blue-800">Selected</Badge>
                      ) : (
                        <Badge variant="outline">Not Selected</Badge>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(article.created_date)}</TableCell>
                    <TableCell className="text-right">{article.views || 0}</TableCell>
                  </TableRow>
                ))}
                
                {sortedArticles().length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No articles found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        <TabsContent value="newsletters" className="m-0">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Sort by:</span>
              <Select 
                value={sortBy} 
                onValueChange={setSortBy}
                defaultValue="publishDate"
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="publishDate">Publish Date</SelectItem>
                  <SelectItem value="views">Views</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Title</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead>Articles</TableHead>
                  <TableHead className="text-right">Views</TableHead>
                  <TableHead className="text-right">Unique Readers</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedNewsletters().map((newsletter) => (
                  <TableRow key={newsletter.id}>
                    <TableCell className="font-medium">{newsletter.title}</TableCell>
                    <TableCell>{formatDate(newsletter.publishDate)}</TableCell>
                    <TableCell>
                      {newsletter.articles ? (
                        Array.isArray(newsletter.articles) ? newsletter.articles.length : 0
                      ) : 0}
                    </TableCell>
                    <TableCell className="text-right">{newsletter.views || 0}</TableCell>
                    <TableCell className="text-right">{newsletter.uniqueReaders || 0}</TableCell>
                  </TableRow>
                ))}
                
                {newsletters.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No newsletters found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Content Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2">
              <PieChart
                title=""
                data={publishDistribution}
                dataKey="value"
                nameKey="name"
                colors={["#10b981", "#6366f1", "#d1d5db"]}
              />
            </div>
            <div className="lg:w-1/2 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-emerald-600">
                    {Math.round((publishDistribution[0]?.value / articles.length || 0) * 100)}%
                  </div>
                  <div className="text-sm text-gray-500 mt-1">Published</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-indigo-600">
                    {Math.round((publishDistribution[1]?.value / articles.length || 0) * 100)}%
                  </div>
                  <div className="text-sm text-gray-500 mt-1">Selected</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-gray-600">
                    {Math.round((publishDistribution[2]?.value / articles.length || 0) * 100)}%
                  </div>
                  <div className="text-sm text-gray-500 mt-1">Not Selected</div>
                </div>
              </div>
              <p className="text-gray-600">
                Out of {articles.length} total articles collected, {publishDistribution[0]?.value || 0} have been published in newsletters, 
                while {publishDistribution[1]?.value || 0} are selected but not yet published. 
                {publishDistribution[2]?.value || 0} articles have not been selected for any newsletter.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}