import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, AlertCircle, Upload } from "lucide-react";
import { PhotoUpload } from "@/components/PhotoUpload";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface VerificationItem {
  name: string;
  status: "verified" | "pending" | "required" | "failed";
  description: string;
  uploadable?: boolean;
}

interface VerificationStatusProps {
  userData?: {
    is_verified?: boolean;
    business_license?: string | null;
  };
  financialData?: {
    government_id_image?: string | null;
    void_cheque?: string | null;
  };
  onDocumentUpload: (type: string, url: string) => Promise<void>;
}

export function VerificationStatus({ userData, financialData, onDocumentUpload }: VerificationStatusProps) {
  const { toast } = useToast();
  const [voidCheque, setVoidCheque] = useState<string>(financialData?.void_cheque || "");
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <XCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge variant="default" className="bg-green-100 text-green-800">Verified</Badge>;
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Required</Badge>;
    }
  };

  const verificationItems: VerificationItem[] = [
    {
      name: "Email Verification",
      status: "verified", // Assuming user is logged in
      description: "Your email address has been confirmed"
    },
    {
      name: "Government ID",
      status: financialData?.government_id_image ? "verified" : "required",
      description: "Government-issued photo ID for identity verification"
    },
    {
      name: "Bank Account",
      status: voidCheque ? "verified" : "required",
      description: "Void cheque or bank letter for account verification",
      uploadable: true
    },
    {
      name: "Business License",
      status: userData?.business_license ? "verified" : "required",
      description: "Required for business accounts only"
    }
  ];

  const handleVoidChequeUpload = async (photos: string[]) => {
    const newUrl = photos[0];
    if (newUrl) {
      try {
        await onDocumentUpload("void_cheque", newUrl);
        setVoidCheque(newUrl);
        toast({
          title: "Success",
          description: "Void cheque uploaded successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to upload void cheque",
          variant: "destructive",
        });
      }
    }
  };

  const overallStatus = verificationItems.every(item => item.status === "verified") ? "verified" : "pending";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon(overallStatus)}
          Account Verification
        </CardTitle>
        <CardDescription>
          Complete verification to receive payments and unlock all features
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h4 className="font-medium">Overall Status</h4>
            <p className="text-sm text-muted-foreground">
              {overallStatus === "verified" 
                ? "Your account is fully verified" 
                : "Complete all items below to verify your account"
              }
            </p>
          </div>
          {getStatusBadge(overallStatus)}
        </div>

        <div className="space-y-3">
          {verificationItems.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(item.status)}
                <div>
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(item.status)}
                {item.uploadable && item.status === "required" && (
                  <Button size="sm" variant="outline">
                    <Upload className="h-3 w-3 mr-1" />
                    Upload
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {!voidCheque && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Upload Void Cheque</h4>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <div className="space-y-2">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click to upload void cheque
                </p>
                <Button variant="outline" size="sm">
                  Choose File
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Upload a void cheque or bank letter to verify your account details
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}