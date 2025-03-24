import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading,
  Quote,
  Code,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image,
  Video,
} from "lucide-react";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: string;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Start writing your post content here...",
  height = "h-[300px]",
}: RichTextEditorProps) {
  const [tab, setTab] = useState<string>("write");
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const formatText = (format: string) => {
    // This is a simplified version. In a real implementation,
    // you'd use a library like Tiptap or Draft.js for a true rich text editor
    switch (format) {
      case "bold":
        onChange(`${content}**bold text**`);
        break;
      case "italic":
        onChange(`${content}*italic text*`);
        break;
      case "link":
        onChange(`${content}[link text](https://example.com)`);
        break;
      case "heading":
        onChange(`${content}\n# Heading\n`);
        break;
      case "quote":
        onChange(`${content}\n> Quote\n`);
        break;
      case "code":
        onChange(`${content}\n\`\`\`\ncode block\n\`\`\`\n`);
        break;
      case "ul":
        onChange(`${content}\n- List item\n- Another item\n`);
        break;
      case "ol":
        onChange(`${content}\n1. First item\n2. Second item\n`);
        break;
      case "image":
        onChange(`${content}\n![Alt text](https://example.com/image.jpg)\n`);
        break;
      default:
        break;
    }
  };

  return (
    <div className="rounded-md border border-gray-300 overflow-hidden">
      <Tabs value={tab} onValueChange={setTab}>
        <div className="flex items-center border-b border-gray-300 bg-gray-50 px-3">
          <TabsList className="p-0 bg-transparent border-0 h-10">
            <TabsTrigger value="write" className="border-0 rounded-none">
              Write
            </TabsTrigger>
            <TabsTrigger value="preview" className="border-0 rounded-none">
              Preview
            </TabsTrigger>
          </TabsList>
          
          <div className="ml-auto flex items-center border-l border-gray-300 pl-3">
            <div className="flex space-x-1 mr-6">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => formatText("bold")}
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => formatText("italic")}
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => formatText("underline")}
              >
                <Underline className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => formatText("strikethrough")}
              >
                <Strikethrough className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex space-x-1 mr-6">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => formatText("heading")}
              >
                <Heading className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => formatText("quote")}
              >
                <Quote className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => formatText("code")}
              >
                <Code className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex space-x-1 mr-6">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => formatText("ul")}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => formatText("ol")}
              >
                <ListOrdered className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex space-x-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => formatText("link")}
              >
                <LinkIcon className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => formatText("image")}
              >
                <Image className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <Video className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <TabsContent value="write" className="p-0 m-0">
          <textarea
            className={`w-full p-4 text-gray-800 resize-none outline-none ${height}`}
            placeholder={placeholder}
            value={content}
            onChange={handleChange}
          ></textarea>
        </TabsContent>
        
        <TabsContent value="preview" className="p-0 m-0">
          <div className={`w-full p-4 prose max-w-none overflow-auto ${height}`}>
            {content ? (
              <div className="whitespace-pre-wrap">{content}</div>
            ) : (
              <p className="text-gray-400">Nothing to preview</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
