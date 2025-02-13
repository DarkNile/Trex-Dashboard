import React, { useEffect, useState } from "react";
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
import toast from "react-hot-toast";

const UPDATE_AGREEMENT = gql`
  mutation UpdateAgreement($updateAgreementInput: UpdateAgreementInput!) {
    updateAgreement(updateAgreementInput: $updateAgreementInput) {
      _id
      name
      note
      reducedDutyRate
      deletedAt
      createdAt
      updatedAt
    }
  }
`;

const GET_COUNTRIES = gql`
  query CountryList($page: Int!) {
    countryList(pageable: { page: $page }) {
      data {
        _id
        nameEn
      }
    }
  }
`;

interface UpdateAgreementModalProps {
  agreementId: string;
  initialData: {
    name: string;
    reducedDutyRate: number;
    countryId: string;
    note: string;
  };
  onSuccess?: () => void;
  onClose: () => void;
}

const UpdateAgreementModal: React.FC<UpdateAgreementModalProps> = ({
  agreementId,
  initialData,
  onSuccess,
  onClose,
}) => {
  const [formData, setFormData] = useState(initialData);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const { data: countriesData, loading: loadingCountries } = useGenericQuery({
    query: GET_COUNTRIES,
    variables: { page: 1 },
  });

  const { execute: updateAgreement, isLoading } = useGenericMutation({
    mutation: UPDATE_AGREEMENT,
    onSuccess: () => {
      toast.success("Agreement updated successfully! ✅");
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      console.log("Error updating agreement:", error);
      toast.error(error.message, { position: "top-right", duration: 3000 });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateAgreement({
      updateAgreementInput: {
        id: agreementId,
        name: formData.name,
        reducedDutyRate: Number(formData.reducedDutyRate),
        countryId: formData.countryId,
        note: formData.note,
      },
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
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
          <DialogTitle>Update Agreement</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reducedDutyRate">Reduced Duty Rate</Label>
            <Input
              id="reducedDutyRate"
              name="reducedDutyRate"
              type="number"
              value={formData.reducedDutyRate}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="countryId">Select Country</Label>
            <select
              id="countryId"
              name="countryId"
              value={formData.countryId}
              onChange={handleInputChange}
              className="w-full border border-gray-300 p-2 rounded-md"
              required
              disabled={loadingCountries}
            >
              <option value="" disabled>
                {loadingCountries ? "Loading countries..." : "Select a country"}
              </option>
              {countriesData?.countryList?.data.map(
                (country: { _id: string; nameEn: string }) => (
                  <option key={country._id} value={country._id}>
                    {country.nameEn}
                  </option>
                )
              )}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="note">Note</Label>
            <Input
              id="note"
              name="note"
              value={formData.note}
              onChange={handleInputChange}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Updating..." : "Update Agreement"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateAgreementModal;
