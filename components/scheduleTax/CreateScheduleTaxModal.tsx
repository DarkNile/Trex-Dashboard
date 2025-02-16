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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/UI/select";
import { Plus } from "lucide-react";
import { gql } from "@apollo/client";
import { useGenericMutation } from "@/hooks/generic/useGenericMutation";
import { useGenericQuery } from "@/hooks/generic/useGenericQuery";
import toast from "react-hot-toast";
import { CreateScheduleTaxInput, MeasurementType } from "@/types/schedule-tax";

const CREATE_SCHEDULE_TAX = gql`
  mutation CreateScheduleTax($createScheduleTaxInput: CreateScheduleTaxInput!) {
    createScheduleTax(createScheduleTaxInput: $createScheduleTaxInput)
  }
`;

const GET_MEASUREMENTS = gql`
  query GetMeasurements($page: Int!) {
    measurements(filter: { deleted: false }, pageable: { page: $page }) {
      totalSize
      totalPages
      pageSize
      pageNumber
      data {
        _id
        unitNameEn
        unitNameAr
        note
        createdAt
        updatedAt
        createdBy {
          firstName
          lastName
          email
        }
        updatedBy {
          firstName
          lastName
          email
        }
      }
    }
  }
`;

interface CreateScheduleTaxModalProps {
  refetch: () => void;
}

const CreateScheduleTaxModal: React.FC<CreateScheduleTaxModalProps> = ({
  refetch,
}) => {
  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState<CreateScheduleTaxInput>({
    note: "",
    measurementId: "",
    fee: 0,
    max: 0,
    min: 0,
  });

  const { data: measurementsData, loading: loadingMeasurements } =
    useGenericQuery({
      query: GET_MEASUREMENTS,
      variables: { page: currentPage },
    });

  const { execute: createScheduleTax, isLoading } = useGenericMutation({
    mutation: CREATE_SCHEDULE_TAX,
    onSuccess: () => {
      setOpen(false);
      setFormData({
        note: "",
        measurementId: "",
        fee: 0,
        max: 0,
        min: 0,
      });
      toast.success("Schedule tax created successfully! ✅");
      refetch();
    },
    onError: (error) => {
      console.log("Error creating schedule tax:", error);
      toast.error(error.message, { position: "top-right", duration: 3000 });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createScheduleTax({
      createScheduleTaxInput: formData,
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mb-4">
          <Plus className="w-4 h-4 mr-2" />
          Add New
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Schedule Tax</DialogTitle>
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
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateScheduleTaxModal;
