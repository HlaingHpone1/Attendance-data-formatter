import React, { useCallback, useState } from "react";
import { FileUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploaderProps {
  onFileUpload: (file: File) => void;
  currentFile: File | null;
}

const FileUploader = ({ onFileUpload, currentFile }: FileUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = useCallback(
    (file: File) => {
      if (
        file.type === "text/plain" ||
        file.type === "text/csv" ||
        file.name.endsWith(".csv")
      ) {
        onFileUpload(file);
        toast({
          title: "File uploaded",
          description: `"${file.name}" has been uploaded successfully.`,
        });
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a text (.txt) or CSV (.csv) file.",
          variant: "destructive",
        });
      }
    },
    [onFileUpload, toast]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFile(file);
    }
  }, [handleFile]);

  return (
    <div>
      <div
        className={`border border-dashed rounded-lg p-3 text-center transition-colors ${
          isDragging ? "border-blue-500 bg-blue-50" : "border-gray-200"
        } cursor-pointer min-h-[120px] flex flex-col items-center justify-center`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById("fileInput")?.click()}
      >
        <FileUp className="h-8 w-5 text-blue-500 mb-1" />
        <p className="text-sm font-medium">Drag file here</p>
        <p className="text-xs text-gray-500">or click to browse</p>
        <input
          type="file"
          id="fileInput"
          className="hidden"
          accept=".txt,.csv,text/plain,text/csv"
          onChange={handleFileInput}
        />
      </div>

      {currentFile && (
        <div className="mt-2 p-2 bg-blue-50 rounded-md border border-blue-100 text-xs">
          <p className="truncate">
            <span className="font-medium">File:</span> {currentFile.name}
          </p>
          <p>
            <span className="font-medium">Size:</span>{" "}
            {(currentFile.size / 1024).toFixed(1)} KB
          </p>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
