"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import FileUploader from "@/components/FileUploader";
import DateRangePicker from "@/components/DateRangPicker";
import FileDownload from "@/components/FileDownload";
import Papa from "papaparse";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

const Index = () => {
  const [file, setFile] = useState<File | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedFile, setProcessedFile] = useState<{
    name: string;
    content: string;
    type: string;
    size: number;
  } | null>(null);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [parsedData, setParsedData] = useState<string[][] | null>(null);
  const [originalFileName, setOriginalFileName] = useState<string>("");
  const { toast } = useToast();

  const handleFileUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
    setProcessedFile(null);
    setProcessingError(null);
    setOriginalFileName(uploadedFile.name.replace(/\.csv$/i, ""));

    // Parse file with PapaParse
    Papa.parse(uploadedFile, {
      complete: (result) => {
        setParsedData(result.data as string[][]);
        toast({
          title: "File parsed",
          description: `"${uploadedFile.name}" has been parsed successfully.`,
        });
      },
      error: (err) => {
        setProcessingError(err.message);
        toast({
          title: "Parse error",
          description: err.message,
          variant: "destructive",
        });
      },
    });
  };

  // Transform CSV data with date filtering
  const transformCsvData = (
    data: string[][],
    startDate?: Date,
    endDate?: Date
  ): string[][] => {
    const header = data[0];
    const noIndex = header.indexOf("No.");
    const dateIndex = header.findIndex((col) =>
      col.toLowerCase().includes("date")
    );

    if (noIndex === -1 || dateIndex === -1) return data;

    const filtered = data.filter((row, idx) => {
      if (idx === 0) return true; // Keep header row

      const dateString = row[dateIndex];
      const rowDate = new Date(dateString);

      if (startDate && rowDate < startDate) return false;
      if (endDate && rowDate > endDate) return false;

      return true;
    });

    const transformed = filtered.map((row, idx) => {
      if (idx === 0) return row;

      const newRow = [...row];
      const cell = newRow[noIndex];

      if (typeof cell === "string") {
        newRow[noIndex] = cell.replace(/^(100|200)/, "");
      }

      return newRow;
    });

    return transformed;
  };

  const processFile = async () => {
    if (!file || !parsedData) {
      toast({
        title: "No file selected",
        description: "Please upload a file first.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProcessingError(null);
    setProgress(0);

    try {
      // Simulate processing progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + (100 - prev) * 0.1;
          return newProgress >= 98 ? 98 : newProgress;
        });
      }, 150);

      // Process the data with a small delay to show the progress bar animation
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Apply the transformation with date filtering
      const cleaned = transformCsvData(parsedData, startDate, endDate);

      const csv = Papa.unparse(cleaned);

      // Create the processed file object
      const timestamp = Math.floor(Date.now() / 1000);
      const finalFileName = `${originalFileName}_${timestamp}.csv`;

      setProcessedFile({
        name: finalFileName,
        content: csv,
        type: "text/csv",
        size: new Blob([csv]).size,
      });

      clearInterval(progressInterval);
      setProgress(100);
      setIsProcessing(false);

      toast({
        title: "Processing complete",
        description: "Your file has been processed successfully.",
      });
    } catch (e) {
      console.log(e);
      setProcessingError("An error occurred during processing");
      setIsProcessing(false);
      toast({
        title: "Processing failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const clearForm = () => {
    setFile(null);
    setStartDate(undefined);
    setEndDate(undefined);
    setProcessedFile(null);
    setProcessingError(null);
    setParsedData(null);
  };

  return (
    <div className="h-screen flex items-center justify-center bg-white p-2">
      <Card className="w-full max-w-3xl shadow-sm border-gray-100">
        <div className="p-4">
          <h1 className="text-2xl font-medium text-center mb-4">
            File Processor
          </h1>

          <div className="">
            <ScrollArea className="h-[calc(100vh-220px)] overflow-auto pr-2">
              <div className="">
                <div>
                  <h2 className="text-sm font-medium mb-2">
                    Select Date Range
                  </h2>
                  <DateRangePicker
                    startDate={startDate}
                    endDate={endDate}
                    onStartDateChange={setStartDate}
                    onEndDateChange={setEndDate}
                  />
                </div>
              </div>
              <div className="mt-3">
                <div>
                  <h2 className="text-sm font-medium mb-2">Upload File</h2>
                  <FileUploader
                    onFileUpload={handleFileUpload}
                    currentFile={file}
                  />
                </div>
              </div>

              {file && (
                <div className="space-y-3 mt-5">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Status:</span>
                      <span className="font-medium">
                        {isProcessing
                          ? "Processing..."
                          : processedFile
                          ? "Completed"
                          : processingError
                          ? "Failed"
                          : "Ready to process"}
                      </span>
                    </div>
                    <Progress value={progress} className="h-1.5" />
                  </div>

                  {processingError && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-2">
                      <p className="text-xs text-red-700">{processingError}</p>
                    </div>
                  )}

                  <div className="flex justify-between flex-row-reverse items-center pt-1">
                    <Button
                      onClick={processFile}
                      disabled={isProcessing || !parsedData}
                      size="sm"
                    >
                      {isProcessing
                        ? "Processing..."
                        : processedFile
                        ? "Process Again"
                        : "Process File"}
                    </Button>

                    {(file || startDate || endDate || processedFile) && (
                      <Button variant="outline" onClick={clearForm} size="sm">
                        Reset
                      </Button>
                    )}
                  </div>
                </div>
              )}

              <Separator className="mt-5" />

              {processedFile ? (
                <FileDownload processedFile={processedFile} />
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm">
                    No processed file available for download
                  </p>
                  <p className="text-xs mt-1">
                    Please upload and process a file first
                  </p>
                </div>
              )}
            </ScrollArea>
          </div>

          {/* <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-2">
              <TabsTrigger value="upload">Upload & Process</TabsTrigger>
              <TabsTrigger value="download">Download Result</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[calc(100vh-220px)] overflow-auto pr-2">
              <TabsContent
                value="upload"
                className="space-y-4 mt-2 pb-2"
              ></TabsContent>

              <TabsContent value="download">
                {processedFile ? (
                  <FileDownload processedFile={processedFile} />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-sm">
                      No processed file available for download
                    </p>
                    <p className="text-xs mt-1">
                      Please upload and process a file first
                    </p>
                  </div>
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs> */}
        </div>
      </Card>
    </div>
  );
};

export default Index;
