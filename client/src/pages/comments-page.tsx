import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNav } from "@/components/layout/top-nav";
import { CommentItem } from "@/components/comments/comment-item";
import { useAuth } from "@/hooks/use-auth";
import { Comment, Post } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Search, Filter } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function CommentsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch posts authored by the user
  const { data: posts, isLoading: postsLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts", user?.id],
    enabled: !!user,
  });

  // Fetch all comments for user's posts
  const { data: comments, isLoading: commentsLoading } = useQuery<Comment[]>({
    queryKey: ["/api/comments"],
    enabled: !!user && !!posts,
  });

  // Update comment status mutation
  const updateCommentStatusMutation = useMutation({
    mutationFn: async ({ commentId, status }: { commentId: number; status: string }) => {
      await apiRequest("PUT", `/api/comments/${commentId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comments"] });
      toast({
        title: "Comment updated",
        description: "Comment status has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update comment: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: number) => {
      await apiRequest("DELETE", `/api/comments/${commentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comments"] });
      toast({
        title: "Comment deleted",
        description: "Comment has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete comment: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Filter comments based on selected status and search query
  const filteredComments = comments
    ?.filter((comment) => {
      const matchesStatus = selectedStatus === "all" || comment.status === selectedStatus;
      const matchesSearch =
        searchQuery === "" ||
        comment.content.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Handler for updating comment status
  const handleUpdateStatus = (commentId: number, status: string) => {
    updateCommentStatusMutation.mutate({ commentId, status });
  };

  // Handler for deleting a comment
  const handleDeleteComment = (commentId: number) => {
    deleteCommentMutation.mutate(commentId);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 overflow-auto">
        <TopNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="p-4 md:p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold text-gray-800">Comments</h1>
              <div className="flex items-center space-x-2">
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Comments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Comments</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="spam">Spam</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </div>
            </div>

            {/* Comments List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing <span className="font-medium">{filteredComments?.length || 0}</span> comments
                  </div>
                  <div className="relative w-64">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Search className="w-4 h-4 text-gray-400" />
                    </div>
                    <Input
                      type="text"
                      placeholder="Search comments..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {commentsLoading || postsLoading ? (
                  [...Array(4)].map((_, i) => (
                    <div key={i} className="p-4">
                      <div className="flex items-start">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center">
                              <Skeleton className="h-4 w-24 mr-2" />
                              <Skeleton className="h-3 w-16" />
                            </div>
                            <Skeleton className="h-6 w-20 rounded-full" />
                          </div>
                          <Skeleton className="h-4 w-full mb-1" />
                          <Skeleton className="h-4 w-3/4 mb-2" />
                          <Skeleton className="h-3 w-32" />
                          <div className="mt-2 flex space-x-2">
                            <Skeleton className="h-6 w-12" />
                            <Skeleton className="h-6 w-12" />
                            <Skeleton className="h-6 w-12" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : filteredComments && filteredComments.length > 0 ? (
                  filteredComments.map((comment) => {
                    const post = posts?.find((p) => p.id === comment.postId);
                    return (
                      <CommentItem
                        key={comment.id}
                        comment={comment}
                        post={post}
                        onUpdateStatus={handleUpdateStatus}
                        onDelete={handleDeleteComment}
                      />
                    );
                  })
                ) : (
                  <div className="py-12 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1"
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                      />
                    </svg>
                    <p className="mt-2 text-gray-500">No comments found</p>
                    <p className="text-sm text-gray-400">
                      {selectedStatus !== "all" ? (
                        <>
                          No {selectedStatus} comments found.{" "}
                          <Button
                            variant="link"
                            className="p-0 h-auto"
                            onClick={() => setSelectedStatus("all")}
                          >
                            View all comments
                          </Button>
                        </>
                      ) : searchQuery ? (
                        <>
                          No comments match your search query.{" "}
                          <Button
                            variant="link"
                            className="p-0 h-auto"
                            onClick={() => setSearchQuery("")}
                          >
                            Clear search
                          </Button>
                        </>
                      ) : (
                        "Your posts don't have any comments yet."
                      )}
                    </p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {filteredComments && filteredComments.length > 10 && (
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious href="#" />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink href="#" isActive>1</PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink href="#">2</PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink href="#">3</PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationNext href="#" />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
