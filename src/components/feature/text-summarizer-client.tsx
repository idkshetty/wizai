"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, FileText, CheckCircle, الكتابة } from "lucide-react"; // Assuming 'Kتابة' icon for summarize
import { summarizeArticle, type SummarizeArticleInput, type SummarizeArticleOutput } from "@/ai/flows/summarize-article";
import { useToast } from "@/hooks/use-toast";

export default function TextSummarizerClient() {
  const [inputText, setInputText] = useState("");
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!inputText.trim() || isLoading) return;

    setIsLoading(true);
    setSummary(null);

    try {
      const input: SummarizeArticleInput = { article: inputText };
      const result: SummarizeArticleOutput = await summarizeArticle(input);
      setSummary(result.summary);
      toast({
        title: "Summarization Complete",
        description: "Text summarized successfully.",
        action: <CheckCircle className="text-green-500" />,
      });
    } catch (error) {
      console.error("Error summarizing text:", error);
      setSummary("Failed to summarize text. Please try again.");
      toast({
        title: "Error",
        description: "Failed to summarize text. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-xl rounded-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center">
          <FileText className="mr-2 h-6 w-6 text-primary" />
          Text Summarization
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div>
            <label htmlFor="article-text" className="block text-sm font-medium text-foreground mb-1">
              Paste your article or text below:
            </label>
            <Textarea
              id="article-text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter the text you want to summarize..."
              className="min-h-[200px] focus-visible:ring-primary"
              disabled={isLoading}
            />
          </div>

          {isLoading && (
             <Alert variant="default" className="flex items-center">
              <Loader2 className="h-5 w-5 animate-spin mr-3" />
              <div>
                <AlertTitle>Summarizing Text</AlertTitle>
                <AlertDescription>Please wait while the AI processes the text...</AlertDescription>
              </div>
            </Alert>
          )}

          {summary && !isLoading && (
            <Alert variant={summary.startsWith("Failed") ? "destructive" : "default"}>
              {summary.startsWith("Failed") ? null : <CheckCircle className="h-4 w-4" />}
              <AlertTitle className="font-headline">Summary</AlertTitle>
              <AlertDescription className="whitespace-pre-wrap">{summary}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="border-t pt-6">
          <Button type="submit" disabled={!inputText.trim() || isLoading} className="w-full">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4 lucide lucide-book-text"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/><path d="M12 7H8"/><path d="M12 11H8"/><path d="M10 15H8"/></svg>
            )}
            Summarize Text
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
