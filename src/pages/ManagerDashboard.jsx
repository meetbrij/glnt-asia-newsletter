
import React, { useState, useEffect } from "react";
import { 
  BarChart3, 
  FileText, 
  Loader2, 
  Users, 
  Mail, 
  TrendingUp,
  ArrowUp
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, ResponsiveContainer, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { getAnalyticsData } from "../components/utils/supabase";

export default function ManagerDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statsData, setStatsData] = useState({
    totalArticles: 0,
    publishedArticles: 0,
    publishedNewsletters: 0,
    subscribers: 245
  });
  
  // Analytics data
  const [countriesData, setCountriesData] = useState([]);
  const [categoriesData, setCategoriesData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get analytics data from Supabase
      const data = await getAnalyticsData();
      
      if (!data) {
        throw new Error("Failed to fetch analytics data");
      }
      
      // Set stats data
      setStatsData({
        totalArticles: data.totalArticles || 0,
        publishedArticles: data.publishedArticles || 0,
        publishedNewsletters: data.publishedNewsletters || 0,
        subscribers: data.subscribers || 0
      });
      
      // Set chart data
      setCategoriesData(Array.isArray(data.categoriesData) ? data.categoriesData : []);
      setCountriesData(Array.isArray(data.countriesData) ? data.countriesData : []);
    } catch (error) {
      setError("Failed to load analytics data. Please try again.");
      console.error("Error fetching analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 mb-4 animate-spin mx-auto text-indigo-600" />
          <p className="text-gray-500">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="p-4 sm:p-6 lg:p-8 border-b bg-white">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard 
            title="Total Articles Collected"
            icon={<FileText className="w-6 h-6 text-indigo-600" />}
            value={statsData.totalArticles}
            trend="+12% vs last month"
            trendIcon={<ArrowUp className="w-3 h-3" />}
            trendColor="text-green-500"
          />
          
          <StatsCard 
            title="Articles Published"
            icon={<FileText className="w-6 h-6 text-indigo-600" />}
            value={`${statsData.publishedArticles} (${Math.round((statsData.publishedArticles / (statsData.totalArticles || 1)) * 100)}%)`}
            trend="+8% vs last month"
            trendIcon={<ArrowUp className="w-3 h-3" />}
            trendColor="text-green-500"
          />
          
          <StatsCard 
            title="Newsletters Published"
            icon={<Mail className="w-6 h-6 text-indigo-600" />}
            value={statsData.publishedNewsletters}
            trend="+2 this month"
            trendIcon={<ArrowUp className="w-3 h-3" />}
            trendColor="text-green-500"
          />
          
          <StatsCard 
            title="Newsletter Subscribers"
            icon={<Users className="w-6 h-6 text-indigo-600" />}
            value={statsData.subscribers}
            trend="+24 this month"
            trendIcon={<ArrowUp className="w-3 h-3" />}
            trendColor="text-green-500"
          />
        </div>
        
        <h2 className="text-xl font-bold mb-6">Content Analytics</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Articles by Category</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoriesData.slice(0, 10)} // Top 10 categories
                  margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={70}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Articles by Country</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={countriesData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
        
        <h2 className="text-xl font-bold mb-6">Content Distribution</h2>
        
        {/* Pie charts and more analytics would go here */}
      </div>
    </div>
  );
}

function StatsCard({ title, icon, value, trend, trendIcon, trendColor }) {
  return (
    <Card className="bg-white border">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-3xl font-bold mt-2">{value}</p>
            {trend && (
              <p className={`flex items-center text-xs mt-2 ${trendColor}`}>
                {trendIcon}
                <span className="ml-1">{trend}</span>
              </p>
            )}
          </div>
          <div className="bg-indigo-50 p-3 rounded-lg">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
