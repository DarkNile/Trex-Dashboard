import React, { useState } from "react";
import { Button } from "@/components/UI/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/UI/dialog";
import { Input } from "@/components/UI/input";
import { Label } from "@/components/UI/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/UI/select";
import { gql } from "@apollo/client";
import { useGenericMutation } from "@/hooks/generic/useGenericMutation";
import { useGenericQuery } from "@/hooks/generic/useGenericQuery";
import toast from "react-hot-toast";

const UPDATE_SCHEDULE_TAX = gql`
  mutation UpdateScheduleTax($updateScheduleTaxInput: UpdateScheduleTaxInput!) {
    updateScheduleTax(createScheduleTaxInput: $updateScheduleTaxInput)
  }
`;

const GET_MEASUREMENTS = gql`
  query GetMeasurements($page: Int!) {
    measurements(filter: { deleted: false }, pageable: { page: $page }) {
      data {
        _id
        unitNameEn
        unitNameAr
        note
        createdBy {
          firstName
          lastName
          email
        }
      }
    }
  }
`;

interface MeasurementType {
  _id: string;
  unitNameEn: string;
  unitNameAr: string;
  note?: string;
}

interface ScheduleTaxType {
  _id: string;
  note?: string;
  fee: number;
  max: number;
  min: number;
  measurementId?: {
    _id: string;
    unitNameEn: string;
    unitNameAr: string;
  };
}

interface UpdateScheduleTaxModalProps {
  refetch: () => void;
  scheduleTax: ScheduleTaxType;
  onClose: () => void;
}

const UpdateScheduleTaxModal: React.FC<UpdateScheduleTaxModalProps> = ({
  refetch,
  scheduleTax,
  onClose,
}) => {
  const [currentPage] = useState(1);
  const [formData, setFormData] = useState({
    _id: scheduleTax._id,
    note: scheduleTax.note || "",
    measurementId: scheduleTax.measurementId?._id || "",
    fee: scheduleTax.fee || 0,
    max: scheduleTax.max || 0,
    min: scheduleTax.min || 0,
  });

  const { data: measurementsData, loading: loadingMeasurements } =
    useGenericQuery({
      query: GET_MEASUREMENTS,
      variables: { page: currentPage },
    });

  const { execute: updateScheduleTax, isLoading } = useGenericMutation({
    mutation: UPDATE_SCHEDULE_TAX,
    onSuccess: () => {
      onClose();
      toast.success("Schedule tax updated successfully! ");
      refetch();
    },
    onError: (error) => {
      console.error("Error updating schedule tax:", error);
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateScheduleTax({
      updateScheduleTaxInput: formData,
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "fee" || name === "max" || name === "min"
          ? Number(value)
          : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Schedule Tax</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="note" className="text-right">
              Note
            </Label>
            <Input
              id="note"
              name="note"
              value={formData.note}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="fee" className="text-right">
              Fee
            </Label>
            <Input
              id="fee"
              name="fee"
              type="number"
              value={formData.fee}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="min" className="text-right">
              Min
            </Label>
            <Input
              id="min"
              name="min"
              type="number"
              value={formData.min}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="max" className="text-right">
              Max
            </Label>
            <Input
              id="max"
              name="max"
              type="number"
              value={formData.max}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="measurementId" className="text-right">
              Measurement
            </Label>
            <Select
              value={formData.measurementId}
              onValueChange={(value) =>
                handleSelectChange("measurementId", value)
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select measurement" />
              </SelectTrigger>
              <SelectContent>
                {measurementsData?.measurements?.data.map(
                  (measurement: MeasurementType) => (
                    <SelectItem key={measurement._id} value={measurement._id}>
                      {measurement.unitNameEn}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-4">
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

export default UpdateScheduleTaxModal;
