import { useState } from "react";
import { Plus, X, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

export interface AddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  required: boolean;
  available_count: number;
}

interface AddOnsManagerProps {
  addOns: AddOn[] | undefined;
  onChange: (addOns: AddOn[]) => void;
  isBusinessUser?: boolean;
}

interface AddOnFormData {
  name: string;
  description: string;
  price: string;
  category: string;
  required: boolean;
  available_count: string;
}

const defaultFormData: AddOnFormData = {
  name: "",
  description: "",
  price: "",
  category: "optional",
  required: false,
  available_count: "1",
};

export const AddOnsManager = ({ addOns = [], onChange, isBusinessUser = false }: AddOnsManagerProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<AddOnFormData>(defaultFormData);

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.price) return;

    const newAddOn: AddOn = {
      id: editingId || generateId(),
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: parseFloat(formData.price),
      category: formData.category,
      required: formData.required,
      available_count: parseInt(formData.available_count) || 1,
    };

    if (editingId) {
      onChange(addOns.map(addon => addon.id === editingId ? newAddOn : addon));
    } else {
      onChange([...addOns, newAddOn]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData(defaultFormData);
    setIsAdding(false);
    setEditingId(null);
  };

  const handleEdit = (addon: AddOn) => {
    setFormData({
      name: addon.name,
      description: addon.description,
      price: addon.price.toString(),
      category: addon.category,
      required: addon.required,
      available_count: addon.available_count.toString(),
    });
    setEditingId(addon.id);
    setIsAdding(true);
  };

  const handleDelete = (id: string) => {
    onChange(addOns.filter(addon => addon.id !== id));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Optional Add-ons
          {!isAdding && (
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => setIsAdding(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Add-on
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {addOns.length > 0 && (
          <div className="space-y-3">
            {addOns.map((addon) => (
              <div key={addon.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{addon.name}</h4>
                    <Badge variant={addon.required ? "default" : "secondary"}>
                      {addon.required ? "Required" : "Optional"}
                    </Badge>
                    <span className="text-sm font-semibold">${addon.price}/day</span>
                  </div>
                  {addon.description && (
                    <p className="text-sm text-muted-foreground mb-1">{addon.description}</p>
                  )}
                  {isBusinessUser && (
                    <p className="text-xs text-muted-foreground">
                      Available: {addon.available_count}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(addon)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(addon.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {isAdding && (
          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">
                {editingId ? "Edit Add-on" : "Add New Add-on"}
              </h4>
              <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="addon-name">Name *</Label>
                <Input
                  id="addon-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Sleeping Bag"
                />
              </div>
              
              <div>
                <Label htmlFor="addon-price">Price per day *</Label>
                <Input
                  id="addon-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="addon-description">Description</Label>
              <Textarea
                id="addon-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the add-on"
                rows={2}
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="addon-required"
                  checked={formData.required}
                  onCheckedChange={(checked) => setFormData({ ...formData, required: checked })}
                />
                <Label htmlFor="addon-required">Required add-on</Label>
              </div>

              {isBusinessUser && (
                <div className="flex items-center gap-2">
                  <Label htmlFor="addon-count">Available:</Label>
                  <Input
                    id="addon-count"
                    type="number"
                    min="1"
                    value={formData.available_count}
                    onChange={(e) => setFormData({ ...formData, available_count: e.target.value })}
                    className="w-20"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button type="button" onClick={handleSubmit} size="sm">
                {editingId ? "Update" : "Add"} Add-on
              </Button>
              <Button type="button" variant="outline" onClick={resetForm} size="sm">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {addOns.length === 0 && !isAdding && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No add-ons yet. Click "Add Add-on" to create optional extras for your listing.
          </p>
        )}
      </CardContent>
    </Card>
  );
};