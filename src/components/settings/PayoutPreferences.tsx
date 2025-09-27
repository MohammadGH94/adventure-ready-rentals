import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, DollarSign, Calendar } from "lucide-react";

interface PayoutPreferencesProps {
  initialData?: {
    payout_method_id?: string | null;
  };
  onSave: (data: {
    payout_schedule: string;
    minimum_payout: number;
    auto_payout: boolean;
  }) => Promise<void>;
  isLoading?: boolean;
}

export function PayoutPreferences({ initialData, onSave, isLoading }: PayoutPreferencesProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [payoutSchedule, setPayoutSchedule] = useState("weekly");
  const [minimumPayout, setMinimumPayout] = useState("50");
  const [autoPayout, setAutoPayout] = useState(true);

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      await onSave({
        payout_schedule: payoutSchedule,
        minimum_payout: parseFloat(minimumPayout),
        auto_payout: autoPayout,
      });
      toast({
        title: "Success",
        description: "Payout preferences saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save payout preferences",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          Payout Preferences
        </CardTitle>
        <CardDescription>
          Configure how and when you receive your rental earnings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Payout Schedule</Label>
          <Select value={payoutSchedule} onValueChange={setPayoutSchedule}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly (Fridays)</SelectItem>
              <SelectItem value="bi-weekly">Bi-weekly (Every 2 weeks)</SelectItem>
              <SelectItem value="monthly">Monthly (1st of month)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Minimum Payout Amount (CAD)</Label>
          <Input
            type="number"
            value={minimumPayout}
            onChange={(e) => setMinimumPayout(e.target.value)}
            placeholder="50.00"
            min="25"
            max="1000"
            step="25"
          />
          <p className="text-sm text-muted-foreground">
            Minimum: $25 CAD. Earnings below this amount will accumulate until the threshold is met.
          </p>
        </div>

        <div className="space-y-2">
          <Label>Automatic Payouts</Label>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={autoPayout}
              onChange={(e) => setAutoPayout(e.target.checked)}
              className="rounded border-input"
            />
            <span className="text-sm">
              Automatically process payouts when conditions are met
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            When disabled, you'll need to manually request payouts from your dashboard
          </p>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
          <h4 className="font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Current Settings Summary
          </h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• Payouts every {payoutSchedule}</p>
            <p>• Minimum amount: ${minimumPayout} CAD</p>
            <p>• {autoPayout ? "Automatic" : "Manual"} processing</p>
          </div>
        </div>

        <Button 
          onClick={handleSave}
          disabled={isLoading || isSubmitting}
          className="w-full"
        >
          {(isLoading || isSubmitting) && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Save Payout Preferences
        </Button>
      </CardContent>
    </Card>
  );
}