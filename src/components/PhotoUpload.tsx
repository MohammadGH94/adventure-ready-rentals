import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Upload, Camera, Star, GripVertical, Loader2 } from 'lucide-react';
import { UploadedFile } from '@/hooks/useFileUpload';

interface PhotoUploadProps {
  files: UploadedFile[];
  onAddFiles: (files: FileList | File[]) => void;
  onRemoveFile: (index: number) => void;
  onReorderFiles?: (fromIndex: number, toIndex: number) => void;
  coverPhotoIndex?: number;
  onSetCoverPhoto?: (index: number) => void;
  uploading?: boolean;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  files,
  onAddFiles,
  onRemoveFile,
  onReorderFiles,
  coverPhotoIndex = 0,
  onSetCoverPhoto,
  uploading = false,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    onAddFiles(acceptedFiles);
  }, [onAddFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: true,
  });

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== toIndex && onReorderFiles) {
      onReorderFiles(draggedIndex, toIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25 hover:border-primary/50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-2">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <Camera className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">Drop photos here or click to browse</p>
            <p className="text-sm text-muted-foreground">
              Support JPEG, PNG, WebP (max 5MB each)
            </p>
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <>
          <p className="text-sm text-muted-foreground mb-2">
            {onReorderFiles ? 'Drag photos to reorder • ' : ''}First photo is the cover photo
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {files.map((file, index) => (
              <Card
                key={index}
                draggable={onReorderFiles !== undefined}
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={`relative group overflow-hidden transition-all ${
                  draggedIndex === index ? 'opacity-50' : ''
                } ${dragOverIndex === index ? 'ring-2 ring-primary' : ''} ${
                  index === coverPhotoIndex ? 'ring-2 ring-primary' : ''
                }`}
              >
                <div className="aspect-square">
                  <img
                    src={file.preview}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Drag Handle */}
                  {onReorderFiles && (
                    <div className="absolute top-2 left-2 bg-background/80 rounded p-1 cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
                      <GripVertical className="h-4 w-4 text-foreground" />
                    </div>
                  )}
                  
                  {/* Cover Photo Badge */}
                  {index === coverPhotoIndex && (
                    <Badge className="absolute top-2 left-2 bg-primary">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      Cover
                    </Badge>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {onSetCoverPhoto && index !== coverPhotoIndex && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => onSetCoverPhoto(index)}
                        disabled={uploading}
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => onRemoveFile(index)}
                      disabled={uploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Upload Status */}
                  {uploading && !file.uploaded && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 text-white animate-spin" />
                    </div>
                  )}
                  {file.uploaded && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {files.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {files.length} photo{files.length !== 1 ? 's' : ''} selected
        </p>
      )}
    </div>
  );
};