import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNav } from "@/components/layout/top-nav";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Post, Comment } from "@shared/schema";
import { FileText, Eye, MessageSquare, PieChart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  // Fetch posts
  const { data: posts, isLoading: postsLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts", user?.id],
    enabled: !!user,
  });

  // Fetch comments
  const { data: comments, isLoading: commentsLoading } = useQuery<Comment[]>({
    queryKey: ["/api/comments"],
    enabled: !!user,
  });

  // Calculate statistics
  const totalPosts = posts?.length || 0;
  const totalViews = posts?.reduce((sum, post) => sum + (post.views || 0), 0) || 0;
  const totalComments = comments?.length || 0;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 overflow-auto">
        <TopNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="p-4 md:p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
                <Link href="/">
                  <Button variant="ghost" size="sm" className="rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Home
                  </Button>
                </Link>
              </div>
              <Link href="/new-post">
                <Button>
                  <FileText className="mr-2 h-4 w-4" />
                  New Post
                </Button>
              </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {postsLoading ? (
                <>
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="p-5 bg-white rounded-lg shadow">
                      <div className="flex items-center justify-between">
                        <div>
                          <Skeleton className="h-4 w-24 mb-2" />
                          <Skeleton className="h-8 w-16" />
                        </div>
                        <Skeleton className="h-12 w-12 rounded-full" />
                      </div>
                      <Skeleton className="h-4 w-32 mt-4" />
                    </div>
                  ))}
                </>
              ) : (
                <>
                  <StatCard
                    title="Total Posts"
                    value={totalPosts}
                    icon={FileText}
                    iconColor="text-primary"
                    iconBgColor="bg-blue-100"
                    trend={{ value: "12%", direction: "up" }}
                  />

                  <StatCard
                    title="Total Views"
                    value={totalViews}
                    icon={Eye}
                    iconColor="text-green-600"
                    iconBgColor="bg-green-100"
                    trend={{ value: "18%", direction: "up" }}
                  />

                  <StatCard
                    title="Comments"
                    value={totalComments}
                    icon={MessageSquare}
                    iconColor="text-purple-600"
                    iconBgColor="bg-purple-100"
                    trend={{ value: "7%", direction: "up" }}
                  />

                  <StatCard
                    title="Avg. Engagement"
                    value={totalPosts ? `${((totalComments / totalPosts) * 100).toFixed(1)}%` : "0%"}
                    icon={PieChart}
                    iconColor="text-amber-500"
                    iconBgColor="bg-yellow-100"
                    trend={{ value: "3%", direction: "down" }}
                  />
                </>
              )}
            </div>

            {/* Recent Activity and Popular Posts */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Activity Chart */}
              <div className="p-5 bg-white rounded-lg shadow">
                <h2 className="text-lg font-medium text-gray-800">Activity Overview</h2>
                <div className="mt-4 h-64 bg-gray-50 rounded flex items-center justify-center">
                  <p className="text-gray-500">Analytics chart will be displayed here</p>
                </div>
              </div>

              {/* Popular Posts */}
              <div className="p-5 bg-white rounded-lg shadow">
                <h2 className="text-lg font-medium text-gray-800">Popular Posts</h2>
                <div className="mt-4 space-y-4">
                  {postsLoading ? (
                    <>
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center p-3 rounded-lg">
                          <Skeleton className="w-12 h-12 rounded" />
                          <div className="ml-4 flex-1">
                            <Skeleton className="h-4 w-48 mb-2" />
                            <Skeleton className="h-3 w-32" />
                          </div>
                          <Skeleton className="h-6 w-16 rounded-full" />
                        </div>
                      ))}
                    </>
                  ) : posts && posts.length > 0 ? (
                    posts
                      .sort((a, b) => (b.views || 0) - (a.views || 0))
                      .slice(0, 3)
                      .map((post) => (
                        <div key={post.id} className="flex items-center p-3 rounded-lg hover:bg-gray-50">
                          <div className="flex-shrink-0 w-12 h-12 overflow-hidden rounded bg-gray-200 flex items-center justify-center">
                            {post.featuredImage ? (
                              <div
                                className="w-full h-full bg-center bg-cover"
                                style={{ backgroundImage: `url(${post.featuredImage})` }}
                              />
                            ) : (
                              <FileText className="text-gray-400" />
                            )}
                          </div>
                          <div className="ml-4">
                            <h3 className="text-sm font-medium text-gray-800">{post.title}</h3>
                            <div className="flex items-center mt-1 text-xs text-gray-500">
                              <span>{post.views || 0} views</span>
                              <span className="mx-1">•</span>
                              <span>
                                {comments?.filter((c) => c.postId === post.id).length || 0} comments
                              </span>
                            </div>
                          </div>
                          <div className="ml-auto">
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                              +12%
                            </span>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No posts found. Create your first post to see stats.</p>
                      <Link href="/new-post">
                        <Button variant="outline" className="mt-4">
                          Create Post
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
                {posts && posts.length > 0 && (
                  <div className="mt-4 text-center">
                    <Link href="/posts">
                      <span className="text-sm font-medium text-primary hover:text-blue-700 cursor-pointer">
                        View all posts
                      </span>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Comments */}
            <div className="p-5 bg-white rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-800">Recent Comments</h2>
                <Link href="/comments">
                  <span className="text-sm font-medium text-primary hover:text-blue-700 cursor-pointer">View all</span>
                </Link>
              </div>
              <div className="space-y-4">
                {commentsLoading ? (
                  <>
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-start">
                          <Skeleton className="w-10 h-10 rounded-full" />
                          <div className="ml-3 flex-1">
                            <div className="flex items-center justify-between">
                              <Skeleton className="h-4 w-32 mb-2" />
                              <Skeleton className="h-6 w-20 rounded-full" />
                            </div>
                            <Skeleton className="h-4 w-full mb-1" />
                            <Skeleton className="h-4 w-2/3" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : comments && comments.length > 0 ? (
                  comments
                    .sort(
                      (a, b) =>
                        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    )
                    .slice(0, 3)
                    .map((comment) => {
                      const post = posts?.find((p) => p.id === comment.postId);
                      return (
                        <div key={comment.id} className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-start">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                              {comment.authorId === user?.id ? user.username[0] : "U"}
                            </div>
                            <div className="ml-3 flex-1">
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="text-sm font-medium text-gray-800">
                                    {comment.authorId === user?.id
                                      ? `${user.firstName || ""} ${user.lastName || ""}`
                                      : "User"}
                                  </span>
                                  <span className="mx-1 text-gray-500">•</span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(comment.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="flex">
                                  <span
                                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                                      comment.status === "approved"
                                        ? "bg-green-100 text-green-800"
                                        : comment.status === "rejected"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-yellow-100 text-yellow-800"
                                    }`}
                                  >
                                    {comment.status.charAt(0).toUpperCase() + comment.status.slice(1)}
                                  </span>
                                </div>
                              </div>
                              <p className="mt-1 text-sm text-gray-600">{comment.content}</p>
                              {post && (
                                <div className="mt-1">
                                  <Link href={`/posts/${post.id}`}>
                                    <span className="text-xs font-medium text-primary hover:text-blue-700 cursor-pointer">
                                      On: {post.title}
                                    </span>
                                  </Link>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No comments yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
