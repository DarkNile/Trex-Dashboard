"use client";
import { formatDate } from "@/lib/utils";

const DocumentSection = ({
  title,
  serial,
  issuedAt,
  expiresAt,
  fileUrl,
}: {
  title: string;
  serial: string;
  issuedAt: string;
  expiresAt: string;
  fileUrl: string;
}) => {
  const handleDownload = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // Extract the filename from the fileUrl
    const fileName = fileUrl.split(": ")[1];

    // You might want to make an API call to get the actual file
    // For now, we'll just show how we would handle it
    console.log(`Downloading file: ${fileName}`);
    // Here you would typically make an API call to get the file
    // window.open(`/api/documents/${fileName}`, '_blank');
  };

  return (
    <div className="mb-6">
      <h3 className="font-semibold text-lg mb-3">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-4">
        <div>
          <p className="text-sm text-gray-500">Serial Number</p>
          <p className="font-medium">{serial}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Issued Date</p>
          <p className="font-medium">{formatDate(issuedAt)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Expiry Date</p>
          <p className="font-medium">{formatDate(expiresAt)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">File</p>
          <button
            onClick={handleDownload}
            className="text-blue-600 hover:underline cursor-pointer"
          >
            {fileUrl.split(": ")[1] || "View Document"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentSection;
