"use client";
import React, { useState, useEffect } from "react";
import { gql } from "@apollo/client";
import { useGenericMutation } from "@/hooks/generic/useGenericMutation";
import { Button } from "@/components/UI/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/UI/dialog";
import { Input } from "@/components/UI/input";
import { Label } from "@/components/UI/label";
import { toast } from "react-hot-toast";

const UPDATE_MEASUREMENT = gql`
  mutation UpdateMeasurement($updateMeasurementInput: UpdateMeasurementName!) {
    updateMeasurement(updateMeasurementInput: $updateMeasurementInput)
  }
`;

interface Measurement {
  _id: string;
  unitName: string;
}

interface UpdateMeasurementModalProps {
  selectedMeasurement: Measurement;
  onSuccess: () => void;
  onClose: () => void;
}

const UpdateMeasurementModal: React.FC<UpdateMeasurementModalProps> = ({
  selectedMeasurement,
  onSuccess,
  onClose,
}) => {
  const [unitName, setUnitName] = useState(selectedMeasurement.unitName);

  useEffect(() => {
    setUnitName(selectedMeasurement.unitName);
  }, [selectedMeasurement]);

  const { execute: updateMeasurement, isLoading } = useGenericMutation({
    mutation: UPDATE_MEASUREMENT,
    onSuccess: () => {
      toast.success("Measurement updated successfully!");
      onSuccess();
      onClose();
    },
    onError: (error) => {
      toast.error(`Error updating measurement: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    updateMeasurement({
      updateMeasurementInput: {
        id: selectedMeasurement._id,
        unitName: unitName,
      },
    });
  };

  return (
    <Dialog open={!!selectedMeasurement._id} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Measurement Name</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="unitName">Unit Name</Label>
            <Input
              id="unitName"
              name="unitName"
              value={unitName}
              onChange={(e) => setUnitName(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateMeasurementModal;
