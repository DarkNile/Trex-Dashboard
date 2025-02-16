"use client";
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
import { toast } from "react-hot-toast";

const UPDATE_INCOTERM = gql`
  mutation UpdateIncoterm($UpdateIncotermInput: UpdateIncotermDTO!) {
    updateIncoterm(UpdateIncotermInput: $UpdateIncotermInput) {
      _id
      name
      code
      createdAt
      updatedAt
      deletedAt
      isDeleted
      insurance
      internalUnloading
      externalUnloading
      internalFreight
      externalFreight
      createdBy {
        _id
        firstName
        lastName
        email
      }
    }
  }
`;

interface Incoterm {
  _id: string;
  name: string;
  code: string;
  insurance: number;
  internalUnloading: number;
  externalUnloading: number;
  internalFreight: number;
  externalFreight: number;
  createdBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  updatedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface UpdateIncotermModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  incotermData: any | null;
  onSuccess?: () => void;
}

const UpdateIncotermModal: React.FC<UpdateIncotermModalProps> = ({
  open,
  onOpenChange,
  incotermData,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    insurance: "0",
    internalUnloading: "0",
    externalUnloading: "0",
    internalFreight: "0",
    externalFreight: "0",
  });

  useEffect(() => {
    if (incotermData) {
      console.log("Setting form data from:", incotermData);
      setFormData({
        name: incotermData.name || "",
        code: incotermData.code || "",
        insurance: incotermData.insurance?.toString() || "0",
        internalUnloading: incotermData.internalUnloading?.toString() || "0",
        externalUnloading: incotermData.externalUnloading?.toString() || "0",
        internalFreight: incotermData.internalFreight?.toString() || "0",
        externalFreight: incotermData.externalFreight?.toString() || "0",
      });
    }
  }, [incotermData]);

  const { execute: updateIncoterm, isLoading } = useGenericMutation({
    mutation: UPDATE_INCOTERM,
    onSuccess: () => {
      onOpenChange(false);
      setFormData({
        name: "",
        code: "",
        insurance: "0",
        internalUnloading: "0",
        externalUnloading: "0",
        internalFreight: "0",
        externalFreight: "0",
      });
      toast.success("Incoterm updated successfully! ✅");
      onSuccess?.();
    },
    onError: (error) => {
      console.error("Error updating incoterm:", error);
      toast.error(error.message || "Failed to update incoterm ❌");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!incotermData?._id) {
      toast.error("No incoterm ID provided");
      return;
    }

    const numericFormData = {
      id: incotermData._id,
      name: formData.name.trim(),
      code: formData.code.trim(),
      insurance: parseFloat(formData.insurance) || 0,
      internalUnloading: parseFloat(formData.internalUnloading) || 0,
      externalUnloading: parseFloat(formData.externalUnloading) || 0,
      internalFreight: parseFloat(formData.internalFreight) || 0,
      externalFreight: parseFloat(formData.externalFreight) || 0,
    };

    // Validate required fields
    if (!numericFormData.name || !numericFormData.code) {
      toast.error("Name and Code are required fields");
      return;
    }

    console.log("Submitting update with data:", numericFormData);

    updateIncoterm({
      UpdateIncotermInput: numericFormData,
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Incoterm</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter incoterm name"
              className="w-full"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="code">Code</Label>
            <Input
              id="code"
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              placeholder="Enter incoterm code"
              className="w-full"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="insurance">Insurance Rate</Label>
            <Input
              id="insurance"
              name="insurance"
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={formData.insurance}
              onChange={handleInputChange}
              placeholder="Enter insurance rate"
              className="w-full"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="internalUnloading">Internal Unloading Rate</Label>
            <Input
              id="internalUnloading"
              name="internalUnloading"
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={formData.internalUnloading}
              onChange={handleInputChange}
              placeholder="Enter internal unloading rate"
              className="w-full"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="externalUnloading">External Unloading Rate</Label>
            <Input
              id="externalUnloading"
              name="externalUnloading"
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={formData.externalUnloading}
              onChange={handleInputChange}
              placeholder="Enter external unloading rate"
              className="w-full"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="internalFreight">Internal Freight Rate</Label>
            <Input
              id="internalFreight"
              name="internalFreight"
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={formData.internalFreight}
              onChange={handleInputChange}
              placeholder="Enter internal freight rate"
              className="w-full"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="externalFreight">External Freight Rate</Label>
            <Input
              id="externalFreight"
              name="externalFreight"
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={formData.externalFreight}
              onChange={handleInputChange}
              placeholder="Enter external freight rate"
              className="w-full"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Incoterm"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateIncotermModal;
