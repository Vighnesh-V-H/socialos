"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import type QuillType from "quill";

import "quill/dist/quill.snow.css";

export default function LinkedInPostEditor() {
  const editorContainerRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<QuillType | null>(null);

  const [isReady, setIsReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [htmlContent, setHtmlContent] = useState("");

  useEffect(() => {
    let isMounted = true;

    const initializeEditor = async () => {
      if (!editorContainerRef.current || quillRef.current) return;

      const { default: Quill } = await import("quill");

      // Verify ref again after await
      if (!editorContainerRef.current) return;

      // Clear any existing content to prevent duplicates (especially in strict mode)
      editorContainerRef.current.innerHTML = "";

      // Create a dedicated container for the editor
      const editorElement = document.createElement("div");
      editorContainerRef.current.appendChild(editorElement);

      const quill = new Quill(editorElement, {
        theme: "snow",
        placeholder: "Write your LinkedIn post...",
        modules: {
          toolbar: [
            [{ header: [1, 2, false] }],
            ["bold", "italic", "underline"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["blockquote", "link"],
            ["clean"],
          ],
        },
      });

      quill.on("text-change", () => {
        const plainText = quill.getText().trim();
        setHtmlContent(plainText.length > 0 ? quill.root.innerHTML : "");
      });

      quillRef.current = quill;

      if (isMounted) {
        setIsReady(true);
      }
    };

    void initializeEditor();

    return () => {
      isMounted = false;
      quillRef.current = null;
      if (editorContainerRef.current) {
        editorContainerRef.current.innerHTML = "";
      }
      setIsReady(false);
    };
  }, []);

  const handleSubmit = async () => {
    const trimmedContent = htmlContent.trim();

    if (!trimmedContent) {
      toast.error("Please add post content before publishing.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/v1/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: "linkedin",
          content: trimmedContent,
        }),
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(errorData.error ?? "Failed to publish post");
      }

      quillRef.current?.setContents([]);
      setHtmlContent("");
      toast.success("LinkedIn post saved successfully.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to publish post";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className='w-full max-w-3xl border dark:bg-[#1b1b1d]'>
      <CardHeader>
        <CardTitle>LinkedIn Post Composer</CardTitle>
        <CardDescription className='dark:text-[#d3d3d3]'>
          Draft a post with rich formatting, then publish it to your SocialOS
          posts API.
        </CardDescription>
      </CardHeader>

      <CardContent className='space-y-4'>
        <Label htmlFor='linkedin-post-editor'>Post Content</Label>

        <div
          className='
          [&_.ql-toolbar]:border-border [&_.ql-toolbar]:bg-[#f4f4f5] [&_.ql-toolbar]:dark:bg-[#242426] [&_.ql-toolbar]:rounded-t-md [&_.ql-toolbar]:font-sans
          [&_.ql-container]:border-border [&_.ql-container]:rounded-b-md [&_.ql-container]:text-foreground [&_.ql-container]:min-h-50 [&_.ql-container]:text-base [&_.ql-container]:font-sans
          [&_.ql-editor]:min-h-50
          [&_.ql-stroke]:stroke-foreground 
          [&_.ql-fill]:fill-foreground 
          [&_.ql-picker]:text-foreground 
          [&_.ql-picker-options]:bg-background [&_.ql-picker-options]:border-border
        '>
          <div id='linkedin-post-editor' ref={editorContainerRef} />
        </div>
      </CardContent>

      <CardFooter className='justify-end'>
        <Button
          type='button'
          onClick={handleSubmit}
          disabled={!isReady || isSubmitting}
          className='rounded-md hover:dark:bg-[#272728] dark:bg-[#242426] text-[#d3d3d3] border px-3 py-1 text-sm'>
          {isSubmitting ? "Publishing..." : "Publish"}
        </Button>
      </CardFooter>
    </Card>
  );
}
