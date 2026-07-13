"use client";

import { useState, useRef } from "react";
import { Upload, X, FileText, Image as ImageIcon, Film, File as FileIcon } from "lucide-react";
import gsap from "gsap";

export default function FileUploader({ onUploadComplete, isUploading, setIsUploading, caseId }) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const dropRef = useRef(null);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const triggerInput = () => {
    inputRef.current.click();
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`/api/cases/${caseId}/documents`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }
      
      const data = await res.json();
      setFile(null);
      if (onUploadComplete) onUploadComplete();
    } catch (err) {
      alert("Failed to upload file.");
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (type) => {
    if (type.startsWith("image/")) return <ImageIcon className="w-8 h-8 text-ink" />;
    if (type.startsWith("video/")) return <Film className="w-8 h-8 text-ink" />;
    if (type === "application/pdf") return <FileText className="w-8 h-8 text-ink" />;
    return <FileIcon className="w-8 h-8 text-ink" />;
  };

  return (
    <div className="w-full">
      {!file ? (
        <div
          ref={dropRef}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={triggerInput}
          className={`w-full h-32 border-2 border-dashed flex flex-col items-center justify-center p-4 cursor-pointer transition-all duration-300 ${
            dragActive ? "border-seal-crimson bg-seal-crimson/5" : "border-ink/20 bg-ink/5 hover:border-ink/40"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept="image/*,video/*,application/pdf"
            onChange={handleChange}
          />
          <Upload className={`w-8 h-8 mb-2 ${dragActive ? "text-seal-crimson" : "text-ink/40"}`} />
          <p className="text-sm font-mono text-ink/60 text-center">
            {dragActive ? "Drop file here" : "Drag & Drop or Click to Upload"}
          </p>
          <p className="text-xs text-ink/40 mt-1">Supports PDF, Image, Video</p>
        </div>
      ) : (
        <div className="w-full border border-ink/20 p-4 bg-ink/5 flex items-center justify-between">
          <div className="flex items-center space-x-4 overflow-hidden">
            {getFileIcon(file.type)}
            <div className="flex flex-col overflow-hidden">
              <span className="font-mono text-sm font-semibold truncate max-w-[200px]">{file.name}</span>
              <span className="text-xs text-ink/60">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFile(null)}
              disabled={isUploading}
              className="p-2 hover:bg-seal-crimson/10 text-seal-crimson transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="px-4 py-2 bg-ink text-paper font-mono text-xs tracking-wider hover:bg-ink/80 transition-colors disabled:opacity-50"
            >
              {isUploading ? "UPLOADING..." : "UPLOAD"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
