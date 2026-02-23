"use client";

import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type QuillType from "quill";

import "quill/dist/quill.snow.css";

export default function LinkedInPostEditor() {
  const editorContainerRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<QuillType | null>(null);

  const [isReady, setIsReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>();
  const [textContent, setTextContent] = useState("");

  const selectedDateLabel = scheduledDate
    ? format(scheduledDate, "PPP p")
    : "No date and time selected";

  const selectedDateValue = scheduledDate
    ? `${scheduledDate.getFullYear()}-${String(scheduledDate.getMonth() + 1).padStart(2, "0")}-${String(scheduledDate.getDate()).padStart(2, "0")}`
    : "";

  const selectedTimeValue = scheduledDate
    ? `${String(scheduledDate.getHours()).padStart(2, "0")}:${String(scheduledDate.getMinutes()).padStart(2, "0")}`
    : "";

  const handleDateInputChange = (value: string) => {
    if (!value) {
      setScheduledDate(undefined);
      return;
    }

    const [year, month, day] = value.split("-").map(Number);
    if (!year || !month || !day) return;

    const base = scheduledDate ?? new Date();
    setScheduledDate(
      new Date(year, month - 1, day, base.getHours(), base.getMinutes(), 0, 0),
    );
  };

  const handleTimeInputChange = (value: string) => {
    if (!value) return;

    const [hours, minutes] = value.split(":").map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return;

    const base = scheduledDate ?? new Date();
    setScheduledDate(
      new Date(
        base.getFullYear(),
        base.getMonth(),
        base.getDate(),
        hours,
        minutes,
        0,
        0,
      ),
    );
  };

  const handleCalendarSelect = (value: Date | undefined) => {
    if (!value) {
      setScheduledDate(undefined);
      return;
    }

    const base = scheduledDate ?? new Date();
    setScheduledDate(
      new Date(
        value.getFullYear(),
        value.getMonth(),
        value.getDate(),
        base.getHours(),
        base.getMinutes(),
        0,
        0,
      ),
    );
  };

  useEffect(() => {
    let isMounted = true;

    const initializeEditor = async () => {
      if (!editorContainerRef.current || quillRef.current) return;

      const { default: Quill } = await import("quill");

      if (!editorContainerRef.current) return;

      editorContainerRef.current.innerHTML = "";

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
        setTextContent(plainText);
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
    const trimmedContent = textContent.trim();

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
      setTextContent("");
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
    <Card className='w-full max-w-3xl text-white border dark:bg-[#1b1b1d]'>
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

      <CardFooter className='justify-end gap-2'>
        <Button
          type='button'
          variant='outline'
          onClick={() => setIsScheduleDialogOpen(true)}
          className='rounded-md px-3 py-1 text-sm'>
          <CalendarDays className='size-4' />
          {scheduledDate ? format(scheduledDate, "PPP p") : "Schedule"}
        </Button>

        <Button
          type='button'
          onClick={handleSubmit}
          disabled={!isReady || isSubmitting}
          className='rounded-md hover:dark:bg-[#272728] dark:bg-[#242426] text-[#d3d3d3] border px-3 py-1 text-sm'>
          {isSubmitting ? "Publishing..." : "Publish"}
        </Button>
      </CardFooter>

      <Dialog
        open={isScheduleDialogOpen}
        onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent className='sm:max-w-[420px]'>
          <DialogHeader>
            <DialogTitle>Schedule Post</DialogTitle>
            <DialogDescription>
              Pick a date and time for your scheduled post.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-3'>
            <Calendar
              mode='single'
              selected={scheduledDate}
              onSelect={handleCalendarSelect}
              className='rounded-md border'
            />

            <div className='space-y-2'>
              <Label htmlFor='schedule-date-input'>Selected Date & Time</Label>
              <p className='text-sm text-muted-foreground'>
                {selectedDateLabel}
              </p>
              <div className='grid gap-2 sm:grid-cols-2'>
                <Input
                  id='schedule-date-input'
                  type='date'
                  value={selectedDateValue}
                  onChange={(e) => handleDateInputChange(e.target.value)}
                />
                <Input
                  id='schedule-time-input'
                  type='time'
                  value={selectedTimeValue}
                  onChange={(e) => handleTimeInputChange(e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => setIsScheduleDialogOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
