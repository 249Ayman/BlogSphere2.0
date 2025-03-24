import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Post } from "@shared/schema";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { PostItem } from "@/components/posts/post-item";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter } from "lucide-react";

export default function AllPostsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { user } = useAuth();

  // Fetch all posts (regardless of author)
  const { data: posts, isLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts/all"],
    retry: 1,
  });

  // Filter posts based on selected category and search query
  const filteredPosts = posts
    ?.filter((post) => {
      // Only show published posts
      if (post.status !== "published") return false;
      
      const matchesCategory = selectedCategory === "all" || post.category === selectedCategory;
      const matchesSearch =
        searchQuery === "" ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (post.excerpt && post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime());

  // Extract unique categories with a manual approach to avoid Set issues
  const uniqueCategories: string[] = [];
  if (posts) {
    posts.forEach(post => {
      const category = post.category;
      if (category && !uniqueCategories.includes(category)) {
        uniqueCategories.push(category);
      }
    });
  }
  const categories = ["all", ...uniqueCategories];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between mb-8">
            <div>
              <Link href="/">
                <a className="flex items-center">
                  <svg className="w-10 h-10 text-primary mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                  </svg>
                  <span className="text-2xl font-bold text-gray-800">BlogWave</span>
                </a>
              </Link>
            </div>
            <div className="flex items-center mt-4 md:mt-0">
              {user ? (
                <Link href="/dashboard">
                  <Button>Dashboard</Button>
                </Link>
              ) : (
                <Link href="/auth">
                  <Button>Sign In</Button>
                </Link>
              )}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4 sm:mb-0">Latest Articles</h1>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative w-full sm:w-auto">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
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
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow overflow-hidden">
                <Skeleton className="h-40 w-full" />
                <div className="p-5 space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                  <Skeleton className="h-8 w-4/5" />
                  <Skeleton className="h-20 w-full" />
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredPosts && filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <div key={post.id}>
                <PostItem 
                  post={post} 
                  compact={false}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
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
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
            <h2 className="mt-4 text-2xl font-semibold text-gray-800">No Posts Found</h2>
            <p className="mt-2 text-gray-600">
              {searchQuery
                ? "No posts match your search criteria."
                : selectedCategory !== "all"
                ? `No posts found in the ${selectedCategory} category.`
                : "There are no published posts yet."}
            </p>
            <div className="mt-6">
              {searchQuery && (
                <Button
                  variant="outline"
                  onClick={() => setSearchQuery("")}
                  className="mx-2"
                >
                  Clear Search
                </Button>
              )}
              {selectedCategory !== "all" && (
                <Button
                  variant="outline"
                  onClick={() => setSelectedCategory("all")}
                  className="mx-2"
                >
                  Show All Categories
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white py-12 border-t">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center">
                <svg className="w-8 h-8 text-primary mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                </svg>
                <span className="text-xl font-semibold text-gray-800">BlogWave</span>
              </div>
              <p className="text-gray-600 mt-2">
                © {new Date().getFullYear()} BlogWave. All rights reserved.
              </p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-600 hover:text-primary">
                About
              </a>
              <a href="#" className="text-gray-600 hover:text-primary">
                Features
              </a>
              <a href="#" className="text-gray-600 hover:text-primary">
                Pricing
              </a>
              <a href="#" className="text-gray-600 hover:text-primary">
                Contact
              </a>
              <a href="#" className="text-gray-600 hover:text-primary">
                Privacy
              </a>
              <a href="#" className="text-gray-600 hover:text-primary">
                Terms
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}