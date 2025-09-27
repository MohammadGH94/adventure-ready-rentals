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
import { Loader2, Lock } from "lucide-react";

const bankAccountSchema = z.object({
  institution_number: z.string()
    .min(3, "Institution number must be 3 digits")
    .max(3, "Institution number must be 3 digits")
    .regex(/^\d{3}$/, "Must be 3 digits"),
  transit_number: z.string()
    .min(5, "Transit number must be 5 digits")
    .max(5, "Transit number must be 5 digits")
    .regex(/^\d{5}$/, "Must be 5 digits"),
  account_number: z.string()
    .min(7, "Account number must be at least 7 digits")
    .max(12, "Account number must be at most 12 digits")
    .regex(/^\d+$/, "Must contain only digits"),
});

type BankAccountData = z.infer<typeof bankAccountSchema>;

interface BankAccountFormProps {
  initialData?: Partial<BankAccountData>;
  onSave: (data: BankAccountData) => Promise<void>;
  isLoading?: boolean;
}

export function BankAccountForm({ initialData, onSave, isLoading }: BankAccountFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<BankAccountData>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: {
      institution_number: initialData?.institution_number || "",
      transit_number: initialData?.transit_number || "",
      account_number: initialData?.account_number || "",
    },
  });

  const handleSubmit = async (data: BankAccountData) => {
    try {
      setIsSubmitting(true);
      await onSave(data);
      toast({
        title: "Success",
        description: "Bank account information saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save bank account information",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatAccountNumber = (value: string) => {
    // Mask all but last 4 digits
    if (value.length <= 4) return value;
    return "*".repeat(value.length - 4) + value.slice(-4);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-4 w-4" />
          Bank Account Information
        </CardTitle>
        <CardDescription>
          Secure bank details for receiving payments (Canadian banking format)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="institution_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Institution Number</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="000" 
                        maxLength={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="transit_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transit Number</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="00000" 
                        maxLength={5}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="account_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Number</FormLabel>
                  <FormControl>
                    <Input 
                      type="password"
                      placeholder="Enter your account number"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  {field.value && (
                    <p className="text-sm text-muted-foreground">
                      Saved: {formatAccountNumber(field.value)}
                    </p>
                  )}
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              disabled={isLoading || isSubmitting}
              className="w-full"
            >
              {(isLoading || isSubmitting) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Bank Account
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}