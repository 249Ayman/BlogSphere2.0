import { useState } from "react";
import { Post } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
import { FileText, Edit, Eye, Trash2, MoreHorizontal } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PostItemProps {
  post: Post;
  compact?: boolean;
  onEdit?: (postId: number) => void;
  onDelete?: (postId: number) => void;
}

export function PostItem({ post, compact = false, onEdit, onDelete }: PostItemProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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
      if (onDelete) {
        onDelete(post.id);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete post: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    deletePostMutation.mutate(post.id);
    setShowDeleteDialog(false);
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(post.id);
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      case "archived":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Render a compact version of the post item (for lists)
  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 border-b border-gray-100 hover:bg-gray-50">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            {post.featuredImage ? (
              <img
                className="h-10 w-10 rounded object-cover"
                src={post.featuredImage}
                alt={post.title}
              />
            ) : (
              <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center">
                <FileText className="h-5 w-5 text-gray-400" />
              </div>
            )}
          </div>
          <div className="ml-4">
            <Link href={`/posts/${post.id}`}>
              <a className="text-sm font-medium text-gray-800 hover:text-primary">
                {post.title}
              </a>
            </Link>
            <div className="text-xs text-gray-500 truncate max-w-xs">
              {post.excerpt || post.content.substring(0, 100) + "..."}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className={getStatusClass(post.status)}>
            {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            className="text-primary"
            onClick={handleEdit}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-red-500">
                <Trash2 className="h-4 w-4" />
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
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    );
  }

  // Render a full card for the post
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {post.featuredImage && (
        <div className="h-40 w-full overflow-hidden bg-gray-200">
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <Badge variant="outline" className={getStatusClass(post.status)}>
            {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
          </Badge>
          <div className="text-xs text-gray-500">
            {post.publishedAt
              ? `Published: ${new Date(post.publishedAt).toLocaleDateString()}`
              : "Not published"}
          </div>
        </div>
        <Link href={`/posts/${post.id}`}>
          <a className="block">
            <h3 className="text-xl font-semibold text-gray-800 mb-2 hover:text-primary">
              {post.title}
            </h3>
          </a>
        </Link>
        <p className="text-gray-600 mb-4 line-clamp-3">
          {post.excerpt || post.content.substring(0, 150) + "..."}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Eye className="h-4 w-4 mr-1" />
              <span>{post.views || 0}</span>
            </div>
            <div>
              {post.category && (
                <Badge variant="secondary" className="font-normal">
                  {post.category}
                </Badge>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" /> Edit
              </DropdownMenuItem>
              <Link href={`/posts/${post.id}`}>
                <DropdownMenuItem>
                  <Eye className="h-4 w-4 mr-2" /> View
                </DropdownMenuItem>
              </Link>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem className="text-red-600" onSelect={(e) => e.preventDefault()}>
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </DropdownMenuItem>
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
                      onClick={handleDelete}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
