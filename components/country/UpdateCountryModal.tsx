import React, { useState, useEffect } from "react";
import { Button } from "@/components/UI/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/UI/dialog";
import { Input } from "@/components/UI/input";
import { Label } from "@/components/UI/label";
import { gql } from "@apollo/client";
import { useGenericMutation } from "@/hooks/generic/useGenericMutation";
import { useGenericQuery } from "@/hooks/generic/useGenericQuery";
import { toast } from "react-hot-toast";

// Query to get country by ID
const GET_COUNTRY_BY_ID = gql`
  query Country($id: ID!) {
    country(id: $id) {
      _id
      nameEn
      nameAr
      code
    }
  }
`;

// Mutation to update country
const UPDATE_COUNTRY = gql`
  mutation UpdateCountry($updateCountryInput: UpdateCountryDTO!) {
    updateCountry(updateCountryInput: $updateCountryInput) {
      _id
      nameEn
      nameAr
      code
    }
  }
`;

interface UpdateCountryModalProps {
  countryId: string; // ID of the country to be updated
  onSuccess?: () => void;
  onClose: () => void;
}

const UpdateCountryModal: React.FC<UpdateCountryModalProps> = ({
  countryId,
  onSuccess,
  onClose,
}) => {
  const { data, loading: queryLoading } = useGenericQuery({
    query: GET_COUNTRY_BY_ID,
    variables: { id: String(countryId) },
  });

  const [formData, setFormData] = useState({
    nameEn: "",
    nameAr: "",
    code: "",
  });

  const { execute: updateCountry, isLoading: mutationLoading } =
    useGenericMutation({
      mutation: UPDATE_COUNTRY,
      onSuccess: () => {
        toast.success("Country updated successfully!");
        onSuccess?.(); // Optionally refetch or update UI
        onClose(); // Close the modal after success
      },
      onError: (error) => {
        toast.error(`${error.message}`);
      },
    });

  // Populate form data when country data is fetched
  useEffect(() => {
    if (data?.country) {
      setFormData({
        nameEn: data.country.nameEn,
        nameAr: data.country.nameAr,
        code: data.country.code,
      });
    }
  }, [data]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const updatedCountry = {
      id: countryId,
      nameEn: formData.nameEn,
      nameAr: formData.nameAr,
      code: formData.code,
    };

    updateCountry({
      updateCountryInput: updatedCountry,
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
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Country</DialogTitle>
        </DialogHeader>
        {queryLoading ? (
          <p>Loading...</p>
        ) : (
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
            <Button type="submit" className="w-full" disabled={mutationLoading}>
              {mutationLoading ? "Updating..." : "Update Country"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UpdateCountryModal;
