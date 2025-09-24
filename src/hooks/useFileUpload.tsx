import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UploadedFile {
  file: File;
  preview: string;
  uploaded: boolean;
  url?: string;
  path?: string;
}

export const useFileUpload = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    
    const validFiles = fileArray.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not an image file`,
          variant: "destructive",
        });
        return false;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: `${file.name} is larger than 5MB`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    const uploadedFiles: UploadedFile[] = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      uploaded: false,
    }));

    setFiles(prev => [...prev, ...uploadedFiles]);
  }, [toast]);

  const removeFile = useCallback((index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  }, []);

  const uploadFiles = useCallback(async (userId: string) => {
    if (!files.length) return [];
    
    setUploading(true);
    const uploadedPaths: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.uploaded) {
          uploadedPaths.push(file.path!);
          continue;
        }

        const fileExt = file.file.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from('gear-photos')
          .upload(fileName, file.file);

        if (error) {
          toast({
            title: "Upload failed",
            description: `Failed to upload ${file.file.name}`,
            variant: "destructive",
          });
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('gear-photos')
          .getPublicUrl(data.path);

        uploadedPaths.push(data.path);
        
        setFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, uploaded: true, url: publicUrl, path: data.path } : f
        ));
      }
    } catch (error) {
      toast({
        title: "Upload error",
        description: "An error occurred during upload",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }

    return uploadedPaths;
  }, [files, toast]);

  const clearFiles = useCallback(() => {
    files.forEach(file => URL.revokeObjectURL(file.preview));
    setFiles([]);
  }, [files]);

  return {
    files,
    uploading,
    addFiles,
    removeFile,
    uploadFiles,
    clearFiles,
  };
};