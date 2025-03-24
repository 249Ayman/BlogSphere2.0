import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNav } from "@/components/layout/top-nav";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertPostSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

// Extend the insertPostSchema for client-side validation
const postSchema = insertPostSchema.extend({
  // We need the slug to be unique, add basic validation
  slug: z.string().min(3, "Slug must be at least 3 characters").regex(/^[a-z0-9-]+$/, {
    message: "Slug can only contain lowercase letters, numbers, and hyphens",
  }),
  // Make sure title is not empty
  title: z.string().min(3, "Title must be at least 3 characters"),
  // Content validation
  content: z.string().min(10, "Content must be at least 10 characters"),
});

// Define the type for our form values
type PostFormValues = z.infer<typeof postSchema>;

export default function NewPostPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const [_, navigate] = useLocation();

  // Default values for the form
  const defaultValues: Partial<PostFormValues> = {
    title: "",
    content: "",
    excerpt: "",
    slug: "",
    authorId: user?.id,
    status: "draft",
    category: "uncategorized",
    tags: "",
    metaTitle: "",
    metaDescription: "",
    allowComments: true,
  };

  // Initialize the form
  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues,
  });

  // Create a mutation for submitting the post
  const createPostMutation = useMutation({
    mutationFn: async (data: PostFormValues) => {
      return await apiRequest("POST", "/api/posts", data);
    },
    onSuccess: () => {
      toast({
        title: "Post created",
        description: "Your post has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      navigate("/posts");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create post: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Submit handler
  const onSubmit = (data: PostFormValues) => {
    // Make sure author ID is set
    data.authorId = user?.id;
    createPostMutation.mutate(data);
  };

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  // Update slug when title changes
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    form.setValue("title", title);
    
    // Only auto-generate slug if it hasn't been manually edited
    if (!form.getValues("slug")) {
      const slug = generateSlug(title);
      form.setValue("slug", slug);
    }
  };

  // Handler for saving as draft or publishing
  const handleSaveAction = (status: "draft" | "published") => {
    form.setValue("status", status);
    form.handleSubmit(onSubmit)();
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 overflow-auto">
        <TopNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="p-4 md:p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold text-gray-800">Create New Post</h1>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => handleSaveAction("draft")}
                  disabled={createPostMutation.isPending}
                >
                  Save as Draft
                </Button>
                <Button
                  onClick={() => handleSaveAction("published")}
                  disabled={createPostMutation.isPending}
                >
                  {createPostMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publishing...
                    </>
                  ) : (
                    "Publish"
                  )}
                </Button>
              </div>
            </div>

            {/* Post Form */}
            <div className="bg-white p-6 rounded-lg shadow space-y-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Title and Featured Image */}
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Post Title</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter title here..."
                              {...field}
                              onChange={handleTitleChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="featuredImage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Featured Image</FormLabel>
                          <FormControl>
                            <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                              <div className="space-y-1 text-center">
                                <svg
                                  className="mx-auto h-12 w-12 text-gray-400"
                                  stroke="currentColor"
                                  fill="none"
                                  viewBox="0 0 48 48"
                                  aria-hidden="true"
                                >
                                  <path
                                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                                <div className="flex text-sm text-gray-600 justify-center">
                                  <label
                                    htmlFor="file-upload"
                                    className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none"
                                  >
                                    <span>Upload a file</span>
                                    <Input
                                      id="file-upload"
                                      type="file"
                                      className="sr-only"
                                      onChange={(e) => {
                                        // This is a placeholder for file upload functionality
                                        // In a real implementation, you'd upload the file to a server
                                        // and set the URL in the form
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          // For now, just log the file name
                                          console.log("Selected file:", file.name);
                                          
                                          // You'd typically upload and get a URL back
                                          // field.onChange("https://example.com/images/your-image.jpg");
                                        }
                                      }}
                                    />
                                  </label>
                                  <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-gray-500">
                                  PNG, JPG, GIF up to 10MB
                                </p>
                                {field.value && (
                                  <p className="text-xs text-primary">{field.value}</p>
                                )}
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Category and Tags */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="technology">Technology</SelectItem>
                              <SelectItem value="design">Design</SelectItem>
                              <SelectItem value="development">Development</SelectItem>
                              <SelectItem value="business">Business</SelectItem>
                              <SelectItem value="writing">Writing</SelectItem>
                              <SelectItem value="marketing">Marketing</SelectItem>
                              <SelectItem value="uncategorized">Uncategorized</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tags</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter tags separated by commas..."
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Tags help categorize your content
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* URL Slug */}
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL Slug</FormLabel>
                        <FormControl>
                          <div className="flex">
                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                              blogsphere.com/posts/
                            </span>
                            <Input
                              className="rounded-l-none"
                              placeholder="your-post-slug"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          The URL-friendly version of the title
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Excerpt */}
                  <FormField
                    control={form.control}
                    name="excerpt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Excerpt</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="A brief summary of your post..."
                            className="resize-none"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          This text will be shown in previews and search results
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Rich Text Editor */}
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content</FormLabel>
                        <FormControl>
                          <RichTextEditor
                            content={field.value}
                            onChange={field.onChange}
                            height="h-[500px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* SEO Settings */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">SEO Settings</h3>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="metaTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Meta Title</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter meta title..."
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Appears in browser tabs and search results
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="metaDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Meta Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Enter meta description..."
                                className="resize-none"
                                rows={3}
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              A short description that appears in search results
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Publish Settings */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Publish Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="publishedAt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Publish Date</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                {...field}
                                value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                                onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                              />
                            </FormControl>
                            <FormDescription>
                              Schedule this post for later
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="published">Published</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="archived">Archived</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="mt-4">
                      <FormField
                        control={form.control}
                        name="allowComments"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Allow comments on this post</FormLabel>
                              <FormDescription>
                                Readers will be able to comment on your post
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </form>
              </Form>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => navigate("/posts")}
              >
                Cancel
              </Button>
              <Button
                variant="outline"
              >
                Preview
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSaveAction("draft")}
                disabled={createPostMutation.isPending}
              >
                Save as Draft
              </Button>
              <Button
                onClick={() => handleSaveAction("published")}
                disabled={createPostMutation.isPending}
              >
                {createPostMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publishing...
                  </>
                ) : (
                  "Publish"
                )}
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
