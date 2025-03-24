import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNav } from "@/components/layout/top-nav";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Analytics, Post } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Eye, Users, Clock, ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function AnalyticsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [timeRange, setTimeRange] = useState("7days");
  const { user } = useAuth();

  // Fetch user's posts
  const { data: posts, isLoading: postsLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts", user?.id],
    enabled: !!user,
  });

  // Fetch analytics data
  const { data: analytics, isLoading: analyticsLoading } = useQuery<Analytics[]>({
    queryKey: ["/api/analytics", timeRange],
    enabled: !!user,
  });

  // Calculate statistics
  const totalViews = posts?.reduce((sum, post) => sum + (post.views || 0), 0) || 0;
  const uniqueVisitors = analytics?.reduce((sum, entry) => sum + (entry.uniqueVisitors || 0), 0) || 0;
  
  // Helper function to calculate percentage change
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return { value: "100%", direction: "up" as const };
    const change = ((current - previous) / previous) * 100;
    return {
      value: `${Math.abs(change).toFixed(0)}%`,
      direction: change >= 0 ? "up" as const : "down" as const,
    };
  };

  // Demo changes - in a real app, this would be calculated from actual data
  const viewsChange = calculateChange(totalViews, totalViews * 0.85);
  const visitorsChange = calculateChange(uniqueVisitors, uniqueVisitors * 0.88);
  const timeChange = calculateChange(3.7, 3.9);
  const bounceChange = calculateChange(42, 43);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 overflow-auto">
        <TopNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="p-4 md:p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold text-gray-800">Analytics</h1>
              <div className="flex items-center space-x-2">
                <Select
                  value={timeRange}
                  onValueChange={setTimeRange}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select time range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7days">Last 7 days</SelectItem>
                    <SelectItem value="30days">Last 30 days</SelectItem>
                    <SelectItem value="3months">Last 3 months</SelectItem>
                    <SelectItem value="6months">Last 6 months</SelectItem>
                    <SelectItem value="1year">Last year</SelectItem>
                    <SelectItem value="all">All time</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <ArrowDownRight className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {postsLoading || analyticsLoading ? (
                [...Array(4)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        <Skeleton className="h-4 w-24" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        <Skeleton className="h-9 w-16" />
                      </div>
                      <Skeleton className="h-4 w-32 mt-1" />
                    </CardContent>
                  </Card>
                ))
              ) : (
                <>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                        <Eye className="mr-2 h-4 w-4 text-primary" />
                        Total Views
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{totalViews.toLocaleString()}</div>
                      <p className={`text-xs flex items-center mt-1 ${viewsChange.direction === "up" ? "text-green-500" : "text-red-500"}`}>
                        {viewsChange.direction === "up" ? 
                          <ArrowUpRight className="h-3 w-3 mr-1" /> : 
                          <ArrowDownRight className="h-3 w-3 mr-1" />
                        }
                        <span>{viewsChange.value} from previous period</span>
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                        <Users className="mr-2 h-4 w-4 text-green-500" />
                        Unique Visitors
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{uniqueVisitors.toLocaleString()}</div>
                      <p className={`text-xs flex items-center mt-1 ${visitorsChange.direction === "up" ? "text-green-500" : "text-red-500"}`}>
                        {visitorsChange.direction === "up" ? 
                          <ArrowUpRight className="h-3 w-3 mr-1" /> : 
                          <ArrowDownRight className="h-3 w-3 mr-1" />
                        }
                        <span>{visitorsChange.value} from previous period</span>
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-purple-500" />
                        Avg. Time on Page
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">3:42</div>
                      <p className={`text-xs flex items-center mt-1 ${timeChange.direction === "up" ? "text-green-500" : "text-red-500"}`}>
                        {timeChange.direction === "up" ? 
                          <ArrowUpRight className="h-3 w-3 mr-1" /> : 
                          <ArrowDownRight className="h-3 w-3 mr-1" />
                        }
                        <span>{timeChange.value} from previous period</span>
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                        <svg 
                          className="mr-2 h-4 w-4 text-amber-500" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth="2" 
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                          />
                        </svg>
                        Bounce Rate
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">42%</div>
                      <p className={`text-xs flex items-center mt-1 ${bounceChange.direction === "down" ? "text-green-500" : "text-red-500"}`}>
                        {bounceChange.direction === "down" ? 
                          <ArrowDownRight className="h-3 w-3 mr-1" /> : 
                          <ArrowUpRight className="h-3 w-3 mr-1" />
                        }
                        <span>{bounceChange.value} from previous period</span>
                      </p>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            {/* Traffic Sources & Page Views */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Traffic Sources Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Traffic Sources</CardTitle>
                </CardHeader>
                <CardContent>
                  {postsLoading || analyticsLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-64 w-full rounded-lg" />
                      <div className="grid grid-cols-2 gap-4">
                        {[...Array(4)].map((_, i) => (
                          <Skeleton key={i} className="h-4 w-full" />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="h-64 bg-gray-50 rounded flex items-center justify-center mb-4">
                        {/* In a real implementation, you'd use a charting library like Recharts */}
                        <div className="text-center">
                          <svg 
                            className="mx-auto h-24 w-24 text-gray-300" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth="1" 
                              d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" 
                            />
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth="1" 
                              d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" 
                            />
                          </svg>
                          <p className="mt-2 text-gray-500 text-sm">Traffic Sources Chart</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-primary mr-2"></div>
                          <span className="text-sm text-gray-600">Direct: 35%</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                          <span className="text-sm text-gray-600">Search: 28%</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                          <span className="text-sm text-gray-600">Social: 24%</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                          <span className="text-sm text-gray-600">Referral: 13%</span>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Page Views Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Page Views Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  {postsLoading || analyticsLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-64 w-full rounded-lg" />
                      <div className="grid grid-cols-3 gap-4">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-6 w-16" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="h-64 bg-gray-50 rounded flex items-center justify-center mb-4">
                        {/* In a real implementation, you'd use a charting library like Recharts */}
                        <div className="text-center">
                          <svg 
                            className="mx-auto h-24 w-24 text-gray-300" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth="1" 
                              d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" 
                            />
                          </svg>
                          <p className="mt-2 text-gray-500 text-sm">Page Views Chart</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <div className="text-sm font-medium text-gray-500">Total</div>
                          <div className="text-lg font-semibold text-gray-800">{totalViews.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-500">Peak Day</div>
                          <div className="text-lg font-semibold text-gray-800">
                            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-500">Avg. Daily</div>
                          <div className="text-lg font-semibold text-gray-800">
                            {Math.round(totalViews / (timeRange === '7days' ? 7 : 30)).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Top Content and Demographics */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Top Content */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Content</CardTitle>
                </CardHeader>
                <CardContent>
                  {postsLoading ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                          <div className="flex-1">
                            <Skeleton className="h-4 w-48 mb-2" />
                            <Skeleton className="h-3 w-32" />
                          </div>
                          <div className="text-right">
                            <Skeleton className="h-5 w-16 mb-1" />
                            <Skeleton className="h-3 w-12 ml-auto" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : posts && posts.length > 0 ? (
                    <div className="space-y-3">
                      {posts
                        .sort((a, b) => (b.views || 0) - (a.views || 0))
                        .slice(0, 3)
                        .map((post) => (
                          <div key={post.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                            <div className="flex-1">
                              <h3 className="text-sm font-medium text-gray-800">{post.title}</h3>
                              <div className="mt-1 text-xs text-gray-500">
                                <span>Published: {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'Draft'}</span>
                                <span className="mx-1">•</span>
                                <span>Category: {post.category || 'Uncategorized'}</span>
                              </div>
                            </div>
                            <div className="ml-4 text-right">
                              <div className="text-sm font-semibold text-gray-800">{post.views?.toLocaleString() || 0} views</div>
                              <div className="mt-1 text-xs text-green-500">
                                <ArrowUpRight className="inline-block h-3 w-3 mr-1" />
                                12%
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                      <p>No posts found. Create some content to see analytics.</p>
                      <Button variant="outline" className="mt-4" asChild>
                        <a href="/new-post">Create Post</a>
                      </Button>
                    </div>
                  )}
                  {posts && posts.length > 0 && (
                    <div className="mt-4 text-center">
                      <a href="/posts" className="text-sm font-medium text-primary hover:text-primary/80">
                        View all content
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Demographics */}
              <Card>
                <CardHeader>
                  <CardTitle>Visitor Demographics</CardTitle>
                </CardHeader>
                <CardContent>
                  {analyticsLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[...Array(2)].map((_, i) => (
                        <div key={i} className="space-y-3">
                          <Skeleton className="h-4 w-24 mb-1" />
                          <Skeleton className="h-40 w-full mb-2" />
                          <div className="grid grid-cols-3 gap-2">
                            {[...Array(3)].map((_, j) => (
                              <Skeleton key={j} className="h-3 w-full" />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Device Chart */}
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Devices</h3>
                        <div className="h-40 bg-gray-50 rounded flex items-center justify-center mb-2">
                          <div className="text-center">
                            <svg 
                              className="mx-auto h-16 w-16 text-gray-300" 
                              fill="none" 
                              viewBox="0 0 24 24" 
                              stroke="currentColor"
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth="1" 
                                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" 
                              />
                            </svg>
                            <p className="mt-1 text-gray-500 text-xs">Devices Chart</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="flex items-center">
                            <div className="w-2 h-2 rounded-full bg-primary mr-1"></div>
                            <span className="text-xs text-gray-600">Mobile: 58%</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                            <span className="text-xs text-gray-600">Desktop: 36%</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-2 h-2 rounded-full bg-purple-500 mr-1"></div>
                            <span className="text-xs text-gray-600">Tablet: 6%</span>
                          </div>
                        </div>
                      </div>

                      {/* Location Chart */}
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Location</h3>
                        <div className="h-40 bg-gray-50 rounded flex items-center justify-center mb-2">
                          <div className="text-center">
                            <svg 
                              className="mx-auto h-16 w-16 text-gray-300" 
                              fill="none" 
                              viewBox="0 0 24 24" 
                              stroke="currentColor"
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth="1" 
                                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                              />
                            </svg>
                            <p className="mt-1 text-gray-500 text-xs">Locations Chart</p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">United States</span>
                            <span className="text-xs font-medium text-gray-800">42%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">United Kingdom</span>
                            <span className="text-xs font-medium text-gray-800">15%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">Canada</span>
                            <span className="text-xs font-medium text-gray-800">8%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
