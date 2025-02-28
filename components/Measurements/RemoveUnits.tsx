"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/UI/dialog";
import { Button } from "@/components/UI/button";
import { Label } from "@/components/UI/label";
import { useGenericQuery } from "@/hooks/generic/useGenericQuery";
import { gql } from "@apollo/client";

const GET_UNITS_BY_MEASUREMENT = gql`
  query GetUnitsByMeasurement($id: ID!) {
    unitsByMeasurement(id: $id) {
      _id
      nameEn
      nameAr
    }
  }
`;

type Unit = {
  _id: string;
  nameEn: string;
  nameAr: string;
};

type Measurement = {
  id: string;
  _id: string;
  unitNameEn: string;
  unitNameAr: string;
};

type RemoveUnitsFromMeasurementProps = {
  selectedMeasurement: Measurement;
  onSuccess: () => void;
  onClose: () => void;
  onRemoveUnits: (measurementId: string, subChapterIds: string) => void;
};

const RemoveUnitsFromMeasurement = ({
  selectedMeasurement,
  onSuccess,
  onClose,
  onRemoveUnits,
}: RemoveUnitsFromMeasurementProps) => {
  const [selectedUnit, setSelectedUnit] = useState<string>("");

  const { data, loading, error } = useGenericQuery({
    query: GET_UNITS_BY_MEASUREMENT,
    variables: {
      id: selectedMeasurement._id,
    },
    onError: (error) => {
      console.log("Error fetching units:", error);
    },
  });

  const units: Unit[] = data?.unitsByMeasurement || [];

  const handleRemove = () => {
    if (selectedUnit) {
      onRemoveUnits(selectedMeasurement._id, selectedUnit);
      onSuccess();
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            Remove units from measurement: {selectedMeasurement.unitNameAr} ({selectedMeasurement.unitNameEn})
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {loading ? (
            <p>Loading ...</p>
          ) : error ? (
            <p className="text-red-500">An error occurred while fetching units.</p>
          ) : units.length === 0 ? (
            <p>There are no units to remove.</p>
          ) : (
            <div className="grid gap-2">
              <Label htmlFor="unit">choose unit to remove:</Label>
              <select
                id="unit"
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">choose unit ...</option>
                {units.map((unit) => (
                  <option key={unit._id} value={unit._id}>
                    {unit.nameAr} ({unit.nameEn})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleRemove}
            disabled={!selectedUnit || loading}
            className="bg-red-500 text-white hover:bg-red-600"
          >
            Remove Unit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RemoveUnitsFromMeasurement;