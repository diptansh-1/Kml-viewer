import { ChangeEvent, useState, DragEvent } from 'react';

interface FileUploaderProps {
  onFileUpload: (content: string) => void;
}

const FileUploader = ({ onFileUpload }: FileUploaderProps) => {
  const [fileName, setFileName] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    if (!file || !file.name.toLowerCase().endsWith('.kml')) {
      alert('Please select a KML file');
      return;
    }

    setFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onFileUpload(content);
    };
    reader.readAsText(file);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  return (
    <div className="file-uploader">
      <h2>Upload KML File</h2>
      <div 
        className={`drop-zone ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="drop-zone-content">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <p>Drag and drop your KML file here</p>
          <span>or</span>
          <input
            type="file"
            id="kml-file"
            accept=".kml"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <label htmlFor="kml-file" className="upload-button">
            Choose File
          </label>
          {fileName && (
            <div className="file-info">
              <span className="file-name">{fileName}</span>
              <button 
                className="remove-file" 
                onClick={() => {
                  setFileName('');
                }}
              >
                ×
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUploader; 