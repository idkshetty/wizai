"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, UploadCloud, Image as ImageIconLucide, CheckCircle } from "lucide-react";
import { analyzeImage, type AnalyzeImageInput, type AnalyzeImageOutput } from "@/ai/flows/analyze-image";
import { useToast } from "@/hooks/use-toast";

const fileToDataUri = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export default function ImageAnalysisClient() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setAnalysisResult(null); // Clear previous result
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setFile(null);
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!file || isLoading) return;

    setIsLoading(true);
    setAnalysisResult(null);

    try {
      const photoDataUri = await fileToDataUri(file);
      const input: AnalyzeImageInput = { photoDataUri };
      const result: AnalyzeImageOutput = await analyzeImage(input);
      setAnalysisResult(result.description);
      toast({
        title: "Analysis Complete",
        description: "Image analysis finished successfully.",
        action: <CheckCircle className="text-green-500" />,
      });
    } catch (error) {
      console.error("Error analyzing image:", error);
      setAnalysisResult("Failed to analyze image. Please try again.");
      toast({
        title: "Error",
        description: "Failed to analyze image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl rounded-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center">
          <ImageIconLucide className="mr-2 h-6 w-6 text-primary" />
          Image Analysis
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div>
            <label htmlFor="image-upload" className="block text-sm font-medium text-foreground mb-1">Upload Image</label>
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="file:text-primary file:font-medium hover:file:bg-primary/10 focus-visible:ring-primary"
              disabled={isLoading}
            />
            <p className="mt-1 text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB.</p>
          </div>

          {previewUrl && (
            <div className="mt-4 border rounded-md p-2 bg-muted/50 aspect-video relative w-full max-h-[400px] overflow-hidden">
              <Image
                src={previewUrl}
                alt="Image preview"
                layout="fill"
                objectFit="contain"
                className="rounded"
                data-ai-hint="uploaded image"
              />
            </div>
          )}

          {isLoading && (
            <Alert variant="default" className="flex items-center">
              <Loader2 className="h-5 w-5 animate-spin mr-3" />
              <div>
                <AlertTitle>Analyzing Image</AlertTitle>
                <AlertDescription>Please wait while the AI processes the image...</AlertDescription>
              </div>
            </Alert>
          )}

          {analysisResult && !isLoading && (
            <Alert variant={analysisResult.startsWith("Failed") ? "destructive" : "default"}>
               {analysisResult.startsWith("Failed") ? null : <CheckCircle className="h-4 w-4" />}
              <AlertTitle className="font-headline">Analysis Result</AlertTitle>
              <AlertDescription className="whitespace-pre-wrap">{analysisResult}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="border-t pt-6">
          <Button type="submit" disabled={!file || isLoading} className="w-full">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <UploadCloud className="mr-2 h-4 w-4" />
            )}
            Analyze Image
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
