import { Comment, Post } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { CheckCircle2, XCircle, AlertTriangle, Trash2, MoreVertical, Reply } from "lucide-react";

interface CommentItemProps {
  comment: Comment;
  post?: Post;
  onUpdateStatus: (commentId: number, status: string) => void;
  onDelete: (commentId: number) => void;
}

export function CommentItem({ comment, post, onUpdateStatus, onDelete }: CommentItemProps) {
  const { user } = useAuth();
  const isAuthor = user?.id === comment.authorId;
  const isPostAuthor = post && user?.id === post.authorId;
  const canModerate = isPostAuthor || isAuthor;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800">
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800">
            Rejected
          </Badge>
        );
      case "spam":
        return (
          <Badge className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800">
            Spam
          </Badge>
        );
      default:
        return (
          <Badge className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800">
            Pending
          </Badge>
        );
    }
  };

  const handleApprove = () => {
    onUpdateStatus(comment.id, "approved");
  };

  const handleReject = () => {
    onUpdateStatus(comment.id, "rejected");
  };

  const handleMarkAsSpam = () => {
    onUpdateStatus(comment.id, "spam");
  };

  const handleNotSpam = () => {
    onUpdateStatus(comment.id, "pending");
  };

  const handleDelete = () => {
    onDelete(comment.id);
  };

  return (
    <div className="p-4 hover:bg-gray-50">
      <div className="flex items-start">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          {isAuthor ? user?.username[0].toUpperCase() : "U"}
        </div>
        <div className="ml-3 flex-1">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-800">
                {isAuthor ? (
                  <>
                    {user?.firstName && user?.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user?.username}
                    <span className="ml-1 text-xs text-primary">(You)</span>
                  </>
                ) : (
                  "Anonymous User"
                )}
              </span>
              <span className="mx-1 text-gray-500">•</span>
              <span className="text-xs text-gray-500">
                {format(new Date(comment.createdAt), "MMM d, yyyy")}
              </span>
              {post && (
                <>
                  <span className="mx-1 text-gray-500">•</span>
                  <Link href={`/posts/${post.id}`}>
                    <a className="text-xs text-primary hover:underline">
                      On: {post.title}
                    </a>
                  </Link>
                </>
              )}
            </div>
            <div className="flex">
              {getStatusBadge(comment.status)}
            </div>
          </div>
          <p className="mt-1 text-sm text-gray-600">{comment.content}</p>
          <div className="mt-2 flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
              <Reply className="h-3 w-3 mr-1" />
              Reply
            </Button>

            {canModerate && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                    <MoreVertical className="h-3 w-3 mr-1" />
                    Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {comment.status !== "approved" && (
                    <DropdownMenuItem onClick={handleApprove}>
                      <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                      Approve
                    </DropdownMenuItem>
                  )}
                  {comment.status !== "rejected" && (
                    <DropdownMenuItem onClick={handleReject}>
                      <XCircle className="h-4 w-4 mr-2 text-red-500" />
                      Reject
                    </DropdownMenuItem>
                  )}
                  {comment.status !== "spam" && (
                    <DropdownMenuItem onClick={handleMarkAsSpam}>
                      <AlertTriangle className="h-4 w-4 mr-2 text-orange-500" />
                      Mark as Spam
                    </DropdownMenuItem>
                  )}
                  {comment.status === "spam" && (
                    <DropdownMenuItem onClick={handleNotSpam}>
                      <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                      Not Spam
                    </DropdownMenuItem>
                  )}

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem className="text-red-600" onSelect={(e) => e.preventDefault()}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the comment.
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
