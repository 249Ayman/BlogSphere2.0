import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Post, Comment } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Calendar, Eye, MessageSquare, ArrowLeft, Clock } from "lucide-react";

export default function PostViewPage() {
  const params = useParams<{ id: string }>();
  const postId = parseInt(params.id);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch post data
  const { data: post, isLoading: isPostLoading } = useQuery<Post>({
    queryKey: [`/api/posts/${postId}`],
    queryFn: async () => {
      const res = await fetch(`/api/posts/${postId}`);
      if (!res.ok) throw new Error("Failed to fetch post");
      return res.json();
    },
    enabled: !isNaN(postId),
  });

  // Fetch comments for the post
  const { data: comments, isLoading: isCommentsLoading } = useQuery<Comment[]>({
    queryKey: [`/api/comments/${postId}`],
    queryFn: async () => {
      const res = await fetch(`/api/comments/${postId}`);
      if (!res.ok) throw new Error("Failed to fetch comments");
      return res.json();
    },
    enabled: !isNaN(postId),
  });

  // Increment post views on load
  const incrementViewMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/posts/${postId}/view`);
    },
    onError: (error: Error) => {
      console.error("Failed to increment post view:", error);
    },
  });

  useEffect(() => {
    if (postId && !isNaN(postId)) {
      incrementViewMutation.mutate();
    }
  }, [postId]);

  if (isNaN(postId)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Invalid Post ID</h1>
          <p className="mt-2 text-gray-600">The post ID provided is not valid.</p>
          <Button asChild className="mt-4">
            <Link href="/posts/explore">Back to All Posts</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with navigation */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6 max-w-5xl">
          <div className="flex justify-between items-center">
            <Link href="/posts/explore">
              <Button variant="ghost" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to All Posts
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              {user ? (
                <Button asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
              ) : (
                <Button asChild>
                  <Link href="/auth">Sign In</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {isPostLoading ? (
          <div className="bg-white rounded-lg shadow-md p-8">
            <Skeleton className="h-8 w-3/4 mb-4" />
            <div className="flex gap-4 mb-6">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-32" />
            </div>
            <Skeleton className="h-64 w-full mb-8" />
            <div className="flex justify-between items-center">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-20" />
            </div>
          </div>
        ) : post ? (
          <div>
            <article className="bg-white rounded-lg shadow-md p-8 mb-8">
              {/* Post header */}
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
                  {post.category && (
                    <Badge variant="secondary" className="font-normal">
                      {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
                    </Badge>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : new Date(post.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{post.views || 0} views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>{comments?.length || 0} comments</span>
                  </div>
                </div>
                
                {/* Post featured image */}
                {post.featuredImage && (
                  <div className="mb-8 rounded-lg overflow-hidden">
                    <img 
                      src={post.featuredImage} 
                      alt={post.title} 
                      className="w-full h-auto object-cover rounded-lg" 
                    />
                  </div>
                )}
              </div>

              {/* Post content */}
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
              
              {/* Post footer */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-500">
                      {post.publishedAt ? 'Published' : 'Last updated'} on {new Date(post.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </article>

            {/* Comments section */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-semibold mb-6">Comments ({comments?.length || 0})</h2>
              
              {isCommentsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-5 w-32 mb-2" />
                        <Skeleton className="h-16 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : comments && comments.length > 0 ? (
                <div className="space-y-6">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-4">
                      <Avatar>
                        <AvatarFallback>{comment.authorId.toString().charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium">User #{comment.authorId}</div>
                            <div className="text-sm text-gray-500">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <p className="text-gray-700">{comment.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No comments yet</h3>
                  <p className="text-gray-500 mt-1">Be the first to share your thoughts!</p>
                </div>
              )}
              
              {/* Comment form (disabled for now - future feature) */}
              {user ? (
                <div className="mt-8">
                  <div className="bg-gray-100 rounded-lg p-4 text-center">
                    <p className="text-gray-600">Commenting feature coming soon!</p>
                  </div>
                </div>
              ) : (
                <div className="mt-8 text-center">
                  <p className="text-gray-600 mb-3">Sign in to leave a comment</p>
                  <Button asChild>
                    <Link href="/auth">Sign In</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="min-h-[50vh] flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800">Post Not Found</h1>
              <p className="mt-2 text-gray-600">The post you're looking for doesn't exist or has been removed.</p>
              <Button asChild className="mt-4">
                <Link href="/posts/explore">Back to All Posts</Link>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white py-8 border-t mt-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <Link href="/">
                <div className="flex items-center">
                  <svg className="w-8 h-8 text-primary mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                  </svg>
                  <span className="text-xl font-semibold text-gray-800">BlogWave</span>
                </div>
              </Link>
              <p className="text-gray-500 mt-1">
                © {new Date().getFullYear()} BlogWave. All rights reserved.
              </p>
            </div>
            <div className="flex space-x-4">
              <Link href="/posts/explore">
                <a className="text-gray-500 hover:text-primary">Explore</a>
              </Link>
              <a href="#" className="text-gray-500 hover:text-primary">About</a>
              <a href="#" className="text-gray-500 hover:text-primary">Contact</a>
              <a href="#" className="text-gray-500 hover:text-primary">Privacy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}