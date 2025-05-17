import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";

interface FileDownloadProps {
  processedFile: {
    name: string;
    content: string;
    type: string;
    size: number;
  } | null;
}

const FileDownload = ({ processedFile }: FileDownloadProps) => {
  if (!processedFile) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 text-sm">No processed file available</p>
        <p className="text-xs mt-1">Please upload and process a file first</p>
      </div>
    );
  }

  const downloadFile = () => {
    const blob = new Blob([processedFile.content], {
      type: processedFile.type,
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = processedFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="py-3 flex flex-col items-center">
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 w-full mb-4 text-center">
        <FileText className="h-8 w-8 text-blue-500 mx-auto mb-2" />
        <h3 className="font-medium text-sm">{processedFile.name}</h3>
        <p className="text-xs text-gray-600 mt-0.5">
          {(processedFile.size / 1024).toFixed(2)} KB •{" "}
          {processedFile.type || "Unknown format"}
        </p>

        <div className="mt-3 bg-white border border-blue-100 rounded p-2 max-h-24 overflow-auto text-left">
          <pre className="text-xs whitespace-pre-wrap">
            {processedFile.content.substring(0, 200)}
            {processedFile.content.length > 200 ? "..." : ""}
          </pre>
        </div>
      </div>

      <Button onClick={downloadFile} size="sm" className="gap-1.5">
        <Download className="h-3 w-3" />
        Download File
      </Button>
    </div>
  );
};

export default FileDownload;
