import React from "react";
import { ChevronDown } from "lucide-react";
import { Label } from "@/components/UI/label";
import { Input } from "@/components/UI/input";
import Textarea from "@/components/UI/textArea";
import { Button } from "@/components/UI/button";

interface BasicProductInfoFieldsProps {
  formData: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  selectedChapter: { id: string; nameAr: string; type: "chapter" | "subChapter" } | null;
  onChapterSelect: () => void;
}

const BasicProductInfoFields: React.FC<BasicProductInfoFieldsProps> = ({
  formData,
  handleInputChange,
  selectedChapter,
  onChapterSelect
}) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="HSCode">HS Code</Label>
        <Input
          id="HSCode"
          name="HSCode"
          value={formData.HSCode}
          onChange={handleInputChange}
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
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="nameAr">Arabic Name</Label>
        <Input
          id="nameAr"
          name="nameAr"
          value={formData.nameAr}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="defaultDutyRate">Default Duty Rate (%)</Label>
        <Input
          id="defaultDutyRate"
          name="defaultDutyRate"
          type="number"
          value={formData.defaultDutyRate}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="adVAT">VAT Rate (%)</Label>
        <Input
          id="adVAT"
          name="adVAT"
          type="number"
          value={formData.adVAT}
          onChange={handleInputChange}
          min="0"
          max="100"
          step="0.1"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="noteAr">Arabic Note</Label>
        <Textarea
          id="noteAr"
          name="noteAr"
          value={formData.noteAr}
          onChange={handleInputChange}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="noteEn">English Note</Label>
        <Textarea
          id="noteEn"
          name="noteEn"
          value={formData.noteEn}
          onChange={handleInputChange}
        />
      </div>
      <div className="space-y-2">
        <Label>Chapter</Label>
        <Button
          type="button"
          variant="outline"
          className="w-full min-h-[40px] h-auto py-2 px-4"
          onClick={onChapterSelect}
        >
          <div className="flex w-full items-start gap-2">
            <span className="flex-grow text-right whitespace-normal break-words leading-normal">
              {selectedChapter
                ? selectedChapter.nameAr
                : "Choose Chapter"}
            </span>
            <ChevronDown className="w-4 h-4 flex-shrink-0 mt-1" />
          </div>
        </Button>
      </div>
    </>
  );
};

export default BasicProductInfoFields;