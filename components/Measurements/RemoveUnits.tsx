// components/Measurements/RemoveUnitsFromMeasurement.tsx
"use client";

import { useGenericMutation } from "@/hooks/generic/useGenericMutation";
import { useGenericQuery } from "@/hooks/generic/useGenericQuery";
import { gql } from "@apollo/client";
import { Button } from "@/components/UI/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/UI/dialog";
import { useState, useEffect } from "react";
import { Label } from "@/components/UI/label";

const REMOVE_UNITS_FROM_MEASUREMENT = gql`
  mutation RemoveUnitsFromMeasurement($updateMeasurementInput: UpdateMeasurementInput!) {
    removeUnitsFromMeasurement(updateMeasurementInput: $updateMeasurementInput) {
      _id
    }
  }
`;

const GET_MEASUREMENT_UNITS = gql`
  query GetMeasurementUnits($id: ID!) {
    measurement(id: $id) {
      _id
      units {
        _id
        name
      }
    }
  }
`;

type RemoveUnitsFromMeasurementProps = {
  selectedMeasurement: any;
  onSuccess: () => void;
  onClose: () => void;
};

const RemoveUnitsFromMeasurement = ({
  selectedMeasurement,
  onSuccess,
  onClose,
}: RemoveUnitsFromMeasurementProps) => {
  const [units, setUnits] = useState<{ _id: string; name: string }[]>([]);
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // يمكنك استخدام هذا لجلب الوحدات إذا كانت متوفرة
  /*
  const { data, loading } = useGenericQuery({
    query: GET_MEASUREMENT_UNITS,
    variables: {
      id: selectedMeasurement._id,
    },
    onCompleted: (data) => {
      if (data?.measurement?.units) {
        setUnits(data.measurement.units);
      }
    },
    onError: (error) => {
      console.log("Error fetching units:", error);
    },
  });
  */

  const { execute: removeUnits } = useGenericMutation({
    mutation: REMOVE_UNITS_FROM_MEASUREMENT,
    onSuccess: () => {
      onSuccess();
      onClose();
    },
    onError: (error) => {
      console.log("Error removing units:", error);
      setIsLoading(false);
    },
  });

  const handleRemoveUnits = () => {
    if (selectedUnits.length === 0) return;
    
    setIsLoading(true);
    removeUnits({
      updateMeasurementInput: {
        id: selectedMeasurement._id,
        subChapterIds: selectedUnits.join(",")
      }
    });
  };

  const toggleUnitSelection = (unitId: string) => {
    setSelectedUnits((prev) =>
      prev.includes(unitId)
        ? prev.filter((id) => id !== unitId)
        : [...prev, unitId]
    );
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>إزالة الوحدات من المقياس</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">
              اختر الوحدات التي تريد إزالتها من "{selectedMeasurement.unitNameAr}"
            </h3>
            
            {/* استخدام ادخال نصي بسيط بدلاً من الاختيارات المتعددة */}
            <div className="space-y-2">
              <Label htmlFor="unitIds">أدخل معرفات الوحدات (مفصولة بفواصل)</Label>
              <input
                id="unitIds"
                className="w-full p-2 border rounded"
                placeholder="مثال: id1,id2,id3"
                onChange={(e) => setSelectedUnits(e.target.value.split(',').map(id => id.trim()).filter(id => id))}
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          <Button 
            onClick={handleRemoveUnits} 
            disabled={selectedUnits.length === 0 || isLoading}
          >
            {isLoading ? "جارٍ الحذف..." : "حذف الوحدات"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RemoveUnitsFromMeasurement;