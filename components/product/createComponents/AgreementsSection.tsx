import React from "react";
import { ChevronDown } from "lucide-react";
import { Label } from "@/components/UI/label";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";

interface AgreementsSectionProps {
  formData: any;
  agreementsData: any;
  getAgreementName: (id: string) => string;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onAgreementSelect: () => void;
}

const AgreementsSection: React.FC<AgreementsSectionProps> = ({
  formData,
  agreementsData,
  getAgreementName,
  setFormData,
  onAgreementSelect
}) => {
  return (
    <div className="space-y-2">
      <Label>Agreements</Label>
      <div className="space-y-2">
        <Button
          type="button"
          variant="outline"
          className="w-full justify-between"
          onClick={onAgreementSelect}
        >
          <span>Select Agreements</span>
          <ChevronDown className="w-4 h-4 ml-2" />
        </Button>
        {formData.agreements.length > 0 && (
          <div className="mt-4 space-y-4">
            {formData.agreements.map((agreement: any) => {
              const agreementName = getAgreementName(agreement.agreementId);
              return (
                <div
                  key={agreement.agreementId}
                  className="space-y-2 p-4 border rounded-md"
                >
                  <div className="font-medium">{agreementName}</div>
                  <div className="space-y-2">
                    <Label htmlFor={`dutyRate-${agreement.agreementId}`}>
                      Reduced Duty Rate (%)
                    </Label>
                    <Input
                      id={`dutyRate-${agreement.agreementId}`}
                      type="number"
                      value={agreement.reducedDutyRate}
                      onChange={(e) => {
                        const newAgreements = formData.agreements.map(
                          (a: any) =>
                            a.agreementId === agreement.agreementId
                              ? {
                                  ...a,
                                  reducedDutyRate: Number(e.target.value),
                                }
                              : a
                        );
                        setFormData((prev: any) => ({
                          ...prev,
                          agreements: newAgreements,
                        }));
                      }}
                      min="0"
                      max="100"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`global-${agreement.agreementId}`}
                      checked={agreement.applyGlobal}
                      onChange={(e) => {
                        const newAgreements = formData.agreements.map(
                          (a: any) =>
                            a.agreementId === agreement.agreementId
                              ? { ...a, applyGlobal: e.target.checked }
                              : a
                        );
                        setFormData((prev: any) => ({
                          ...prev,
                          agreements: newAgreements,
                        }));
                      }}
                      className="w-4 h-4"
                    />
                    <Label htmlFor={`global-${agreement.agreementId}`}>
                      Apply Globally
                    </Label>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgreementsSection;