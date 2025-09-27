import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2, FileText, Upload } from "lucide-react";
import { PhotoUpload } from "@/components/PhotoUpload";

const taxInfoSchema = z.object({
  tax_id: z.string()
    .min(9, "Tax ID must be at least 9 characters")
    .max(15, "Tax ID must be at most 15 characters")
    .regex(/^[\d\s-]+$/, "Tax ID can only contain numbers, spaces, and dashes"),
});

type TaxInfoData = z.infer<typeof taxInfoSchema>;

interface TaxInformationFormProps {
  initialData?: {
    tax_id?: string | null;
    government_id_image?: string | null;
  };
  onSave: (data: TaxInfoData & { government_id_image?: string }) => Promise<void>;
  isLoading?: boolean;
}

export function TaxInformationForm({ initialData, onSave, isLoading }: TaxInformationFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [governmentIdImage, setGovernmentIdImage] = useState<string | null>(
    initialData?.government_id_image || null
  );
  
  const form = useForm<TaxInfoData>({
    resolver: zodResolver(taxInfoSchema),
    defaultValues: {
      tax_id: initialData?.tax_id || "",
    },
  });

  const handleSubmit = async (data: TaxInfoData) => {
    try {
      setIsSubmitting(true);
      await onSave({
        ...data,
        government_id_image: governmentIdImage || undefined,
      });
      toast({
        title: "Success",
        description: "Tax information saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save tax information",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTaxId = (value: string) => {
    // Mask all but last 4 characters
    if (value.length <= 4) return value;
    return "*".repeat(value.length - 4) + value.slice(-4);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Tax Information
        </CardTitle>
        <CardDescription>
          Required for tax reporting and compliance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="tax_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Social Insurance Number (SIN) / Tax ID</FormLabel>
                  <FormControl>
                    <Input 
                      type="password"
                      placeholder="Enter your SIN or Tax ID"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  {field.value && (
                    <p className="text-sm text-muted-foreground">
                      Saved: {formatTaxId(field.value)}
                    </p>
                  )}
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <Label>Government ID Upload</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                {governmentIdImage ? (
                  <div className="space-y-2">
                    <img 
                      src={governmentIdImage} 
                      alt="Government ID" 
                      className="max-h-32 mx-auto rounded"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setGovernmentIdImage(null)}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload government ID
                    </p>
                    <Button variant="outline" size="sm">
                      Choose File
                    </Button>
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Upload a clear photo of your government-issued ID for verification
              </p>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading || isSubmitting}
              className="w-full"
            >
              {(isLoading || isSubmitting) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Tax Information
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}