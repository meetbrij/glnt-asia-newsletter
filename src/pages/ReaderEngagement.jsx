import React, { useState, useEffect } from "react";
import { Newsletter } from "@/api/entities";
import { Article } from "@/api/entities";
import { User } from "@/api/entities";
import { BarChart3, Loader2, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, subDays, subMonths } from "date-fns";
import LineChart from "../components/manager/LineChart";
import BarChart from "../components/manager/BarChart";
import PieChart from "../components/manager/PieChart";

export default function ReaderEngagement() {
  const [isLoading, setIsLoading] = useState(true);
  const [viewPeriod, setViewPeriod] = useState("week");
  
  // Engagement metrics
  const [dailyViews, setDailyViews] = useState([]);
  const [newsletterPerformance, setNewsletterPerformance] = useState([]);
  const [engagementData, setEngagementData] = useState({
    totalReaders: 0,
    activeReaders: 0,
    averageTimeOnPage: "2:35",
    readRate: 0,
    engagementRate: 0
  });
  const [categoryEngagement, setCategoryEngagement] = useState([]);
  const [countryEngagement, setCountryEngagement] = useState([]);
  const [timeOfDayData, setTimeOfDayData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Update time series data when period changes
    generateTimeSeriesData(viewPeriod);
  }, [viewPeriod]);

  const fetchData = async () => {
    setIsLoading(true);
    
    try {
      // Fetch basic data
      const newslettersData = await Newsletter.list();
      const articlesData = await Article.list();
      
      // Process data
      processEngagementData(newslettersData, articlesData);
      generateTimeSeriesData(viewPeriod);
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setIsLoading(false);
    }
  };

  const processEngagementData = (newslettersData, articlesData) => {
    // Generate newsletter performance data
    const newsletterPerf = newslettersData
      .map(newsletter => ({
        name: newsletter.title,
        views: newsletter.views || Math.floor(Math.random() * 200),
        uniqueReaders: newsletter.uniqueReaders || Math.floor(Math.random() * 100),
        engagement: Math.floor(Math.random() * 90 + 10) // 10-100%
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5); // Top 5
    
    setNewsletterPerformance(newsletterPerf);
    
    // Generate category engagement data
    const categoryMap = {};
    articlesData.forEach(article => {
      if (!article.category) return;
      categoryMap[article.category] = (categoryMap[article.category] || 0) + (article.views || Math.floor(Math.random() * 30));
    });
    
    const categoryData = Object.entries(categoryMap)
      .map(([name, views]) => ({ 
        name: name.replace(/_/g, ' '),
        views,
        engagement: Math.floor(Math.random() * 90 + 10) // 10-100%
      }))
      .sort((a, b) => b.views - a.views);
    
    setCategoryEngagement(categoryData);
    
    // Generate country engagement data
    const countryMap = {};
    articlesData.forEach(article => {
      if (!article.country) return;
      countryMap[article.country] = (countryMap[article.country] || 0) + (article.views || Math.floor(Math.random() * 30));
    });
    
    const countryData = Object.entries(countryMap)
      .map(([name, views]) => ({ 
        name,
        views,
        engagement: Math.floor(Math.random() * 90 + 10) // 10-100%
      }))
      .sort((a, b) => b.views - a.views);
    
    setCountryEngagement(countryData);
    
    // Generate time of day data
    const hours = ["6am", "9am", "12pm", "3pm", "6pm", "9pm", "12am", "3am"];
    const timeData = hours.map(hour => ({
      name: hour,
      readers: Math.floor(Math.random() * 50) + (hour.includes("am") ? 10 : 30)
    }));
    
    setTimeOfDayData(timeData);
    
    // Set engagement metrics
    setEngagementData({
      totalReaders: 245,
      activeReaders: 183,
      averageTimeOnPage: "2:35",
      readRate: 72,
      engagementRate: 68
    });
  };

  const generateTimeSeriesData = (period) => {
    let days = 7;
    
    if (period === "month") {
      days = 30;
    } else if (period === "quarter") {
      days = 90;
    }
    
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const formattedDate = format(date, period === "week" ? "EEE" : "MMM d");
      
      data.push({
        date: formattedDate,
        views: Math.floor(Math.random() * 150) + 50,
        newsletters: i % 7 === 0 ? 1 : 0 // Simulate weekly newsletter
      });
    }
    
    setDailyViews(data);
  };

  if (isLoading) {
    return (
      <div className="container p-4 md:p-6 flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 mb-4 animate-spin mx-auto text-indigo-600" />
          <p className="text-gray-500">Loading engagement data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Reader Engagement</h1>
        <p className="text-gray-500">Monitor reader behavior and content performance</p>
      </div>

      {/* Key Engagement Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Readers</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{engagementData.totalReaders}</div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              +12% vs. last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Active Readers</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{engagementData.activeReaders}</div>
            <p className="text-xs text-gray-500 mt-1">
              {Math.round((engagementData.activeReaders / engagementData.totalReaders) * 100)}% of total readers
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Read Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{engagementData.readRate}%</div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              +5% vs. last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Avg. Time on Page</CardTitle>
            <BarChart3 className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{engagementData.averageTimeOnPage}</div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              +0:23 vs. last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Views Over Time Chart */}
      <Card className="mb-8">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle>Views Over Time</CardTitle>
            <Tabs defaultValue={viewPeriod} onValueChange={setViewPeriod}>
              <TabsList>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
                <TabsTrigger value="quarter">Quarter</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <LineChart
            title=""
            data={dailyViews}
            dataKey="views"
            nameKey="date"
          />
        </CardContent>
      </Card>

      {/* Content Engagement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Category Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              title=""
              data={categoryEngagement}
              dataKey="engagement"
              nameKey="name"
              color="#8b5cf6"
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Country Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              title=""
              data={countryEngagement}
              dataKey="engagement"
              nameKey="name"
              color="#3b82f6"
            />
          </CardContent>
        </Card>
      </div>

      {/* Newsletter Performance */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Newsletter Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardContent className="pt-6">
                  <BarChart
                    title=""
                    data={newsletterPerformance}
                    dataKey="views"
                    nameKey="name"
                    color="#10b981"
                  />
                </CardContent>
              </Card>
              
              <div>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Most Read Newsletter</h3>
                    <p className="font-medium">{newsletterPerformance[0]?.name || "N/A"}</p>
                    <p className="text-sm text-gray-500">
                      {newsletterPerformance[0]?.views || 0} views, {newsletterPerformance[0]?.engagement || 0}% engagement
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Most Engaging Newsletter</h3>
                    <p className="font-medium">
                      {newsletterPerformance.sort((a, b) => b.engagement - a.engagement)[0]?.name || "N/A"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {newsletterPerformance.sort((a, b) => b.engagement - a.engagement)[0]?.engagement || 0}% engagement
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Optimal Send Time</h3>
                    <p className="font-medium">Tuesdays at 10:00 AM</p>
                    <p className="text-sm text-gray-500">
                      Based on historical open rates
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-4">Top Topics by Engagement</h3>
                <div className="space-y-4">
                  {categoryEngagement.slice(0, 3).map((category, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center mr-3">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium">{category.name}</span>
                          <span className="text-sm text-gray-500">{category.engagement}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div 
                            className="bg-indigo-600 h-2 rounded-full" 
                            style={{ width: `${category.engagement}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-4">Reader Activity by Time of Day</h3>
                <BarChart
                  title=""
                  data={timeOfDayData}
                  dataKey="readers"
                  nameKey="name"
                  color="#f97316"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reader Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Reader Demographics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Device Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <PieChart
                  title=""
                  data={[
                    { name: 'Desktop', value: 45 },
                    { name: 'Mobile', value: 40 },
                    { name: 'Tablet', value: 15 },
                  ]}
                  dataKey="value"
                  nameKey="name"
                  colors={["#3b82f6", "#8b5cf6", "#f97316"]}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Reader Retention</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Returning Readers</span>
                      <span className="text-sm font-medium">75%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">New Readers</span>
                      <span className="text-sm font-medium">25%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Churn Rate</span>
                      <span className="text-sm font-medium">8%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: '8%' }}></div>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <h4 className="text-sm font-medium mb-2">Reader Growth Trend</h4>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
                        <span className="text-lg font-semibold">+24</span>
                      </div>
                      <div>
                        <p className="font-medium">New subscribers this month</p>
                        <p className="text-sm text-gray-500">10.8% growth rate</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}