import React, { useState } from "react";
import { Button } from "@/components/UI/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/UI/dialog";
import { Input } from "@/components/UI/input";
import { Label } from "@/components/UI/label";
import { Plus } from "lucide-react";
import { gql } from "@apollo/client";
import { useGenericMutation } from "@/hooks/generic/useGenericMutation";
import { toast } from "react-hot-toast"; // ✅ Import toast

const CREATE_COUNTRY = gql`
  mutation CreateCountry($nameEn: String!, $nameAr: String!, $code: String!) {
    createCountry(
      createCountryInput: { nameEn: $nameEn, nameAr: $nameAr, code: $code }
    ) {
      _id
      nameEn
      nameAr
      code
    }
  }
`;

interface CreateCountryModalProps {
  onSuccess?: () => void;
}

const CreateCountryModal: React.FC<CreateCountryModalProps> = ({
  onSuccess,
}) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    nameAr: "",
    nameEn: "",
    code: "",
  });

  const { execute: createCountry, isLoading } = useGenericMutation({
    mutation: CREATE_COUNTRY,
    onSuccess: () => {
      setOpen(false);
      setFormData({ nameAr: "", nameEn: "", code: "" });
      toast.success("Country created successfully! ✅"); // ✅ Success toast
      onSuccess?.();
    },
    onError: (error) => {
      console.error("Error creating country:", error);
      toast.error(error.message || "Failed to create country ❌"); // ✅ Error toast
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createCountry({
      nameEn: formData.nameEn,
      nameAr: formData.nameAr,
      code: formData.code,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mb-4">
          <Plus className="w-4 h-4 mr-2" />
          Add New Country
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Country</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nameAr">Arabic Name</Label>
            <Input
              id="nameAr"
              name="nameAr"
              value={formData.nameAr}
              onChange={handleInputChange}
              placeholder="Enter Arabic name"
              className="w-full"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nameEn">English Name</Label>
            <Input
              id="nameEn"
              name="nameEn"
              value={formData.nameEn}
              onChange={handleInputChange}
              placeholder="Enter English name"
              className="w-full"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="code">Country Code</Label>
            <Input
              id="code"
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              placeholder="Enter country code"
              className="w-full"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Country"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCountryModal;
