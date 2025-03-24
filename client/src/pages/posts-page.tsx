import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNav } from "@/components/layout/top-nav";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Post } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { FileText, Edit, Eye, Trash } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function PostsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [_, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch posts
  const { data: posts, isLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts", user?.id],
    enabled: !!user,
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      await apiRequest("DELETE", `/api/posts/${postId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Post deleted",
        description: "Your post has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete post: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Filter posts
  const filteredPosts = posts
    ?.filter((post) => {
      const matchesCategory = selectedCategory === "all" || post.category === selectedCategory;
      const matchesStatus = selectedStatus === "all" || post.status === selectedStatus;
      const matchesSearch =
        searchQuery === "" ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (post.excerpt && post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesStatus && matchesSearch;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Extract unique categories
  const categories = ["all", ...new Set(posts?.map((post) => post.category).filter(Boolean))];

  // Handle post deletion
  const handleDeletePost = (postId: number) => {
    deletePostMutation.mutate(postId);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 overflow-auto">
        <TopNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="p-4 md:p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold text-gray-800">My Posts</h1>
              <Link href="/new-post">
                <Button>
                  <FileText className="mr-2 h-4 w-4" />
                  New Post
                </Button>
              </Link>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
              <div className="flex items-center space-x-2">
                <Select
                  value={selectedCategory}
                  onValueChange={(value) => setSelectedCategory(value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category === "all"
                          ? "All Categories"
                          : category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={selectedStatus}
                  onValueChange={(value) => setSelectedStatus(value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    ></path>
                  </svg>
                </div>
                <Input
                  type="text"
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Posts Table */}
            <div className="overflow-x-auto">
              <div className="min-w-full bg-white rounded-lg overflow-hidden shadow">
                <div className="bg-gray-50 border-b border-gray-200">
                  <div className="grid grid-cols-12 py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="col-span-5">Title</div>
                    <div className="col-span-1">Status</div>
                    <div className="col-span-1">Category</div>
                    <div className="col-span-1">Views</div>
                    <div className="col-span-1">Comments</div>
                    <div className="col-span-2">Published</div>
                    <div className="col-span-1">Actions</div>
                  </div>
                </div>
                <div className="divide-y divide-gray-200">
                  {isLoading ? (
                    [...Array(5)].map((_, i) => (
                      <div key={i} className="grid grid-cols-12 py-4 px-4 hover:bg-gray-50">
                        <div className="col-span-5 flex items-center">
                          <Skeleton className="h-10 w-10 rounded mr-4" />
                          <div>
                            <Skeleton className="h-4 w-48 mb-2" />
                            <Skeleton className="h-3 w-64" />
                          </div>
                        </div>
                        <div className="col-span-1">
                          <Skeleton className="h-6 w-16 rounded-full" />
                        </div>
                        <div className="col-span-1">
                          <Skeleton className="h-4 w-16" />
                        </div>
                        <div className="col-span-1">
                          <Skeleton className="h-4 w-10" />
                        </div>
                        <div className="col-span-1">
                          <Skeleton className="h-4 w-8" />
                        </div>
                        <div className="col-span-2">
                          <Skeleton className="h-4 w-24" />
                        </div>
                        <div className="col-span-1">
                          <Skeleton className="h-8 w-20" />
                        </div>
                      </div>
                    ))
                  ) : filteredPosts && filteredPosts.length > 0 ? (
                    filteredPosts.map((post) => (
                      <div key={post.id} className="grid grid-cols-12 py-4 px-4 hover:bg-gray-50">
                        <div className="col-span-5">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {post.featuredImage ? (
                                <img
                                  className="h-10 w-10 rounded object-cover"
                                  src={post.featuredImage}
                                  alt="Post thumbnail"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center">
                                  <FileText className="h-5 w-5 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-800">{post.title}</div>
                              <div className="text-xs text-gray-500 truncate max-w-xs">
                                {post.excerpt || "No excerpt available"}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-span-1 py-4">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              post.status === "published"
                                ? "bg-green-100 text-green-800"
                                : post.status === "draft"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                          </span>
                        </div>
                        <div className="col-span-1 py-4 text-sm text-gray-600">
                          {post.category || "Uncategorized"}
                        </div>
                        <div className="col-span-1 py-4 text-sm text-gray-600">{post.views || 0}</div>
                        <div className="col-span-1 py-4 text-sm text-gray-600">0</div>
                        <div className="col-span-2 py-4 text-sm text-gray-600">
                          {post.publishedAt
                            ? new Date(post.publishedAt).toLocaleDateString()
                            : "Not published"}
                        </div>
                        <div className="col-span-1 py-4 text-sm text-gray-600">
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/posts/edit/${post.id}`)}
                              className="text-primary"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/posts/${post.id}`)}
                              className="text-gray-500"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-red-500">
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete your
                                    post and all of its data.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeletePost(post.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center">
                      <p className="text-gray-500">No posts found. Create your first post!</p>
                      <Link href="/new-post">
                        <Button className="mt-4">Create Post</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Pagination */}
            {filteredPosts && filteredPosts.length > 0 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing <span className="font-medium">1</span> to{" "}
                  <span className="font-medium">{filteredPosts.length}</span> of{" "}
                  <span className="font-medium">{filteredPosts.length}</span> results
                </div>
                <div className="flex space-x-1">
                  <Button variant="outline" size="sm" disabled={true}>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" className="bg-primary text-white">
                    1
                  </Button>
                  <Button variant="outline" size="sm" disabled={true}>
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
