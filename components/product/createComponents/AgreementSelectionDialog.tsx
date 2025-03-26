import { Button } from "@/components/UI/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/UI/dialog";
import { Label } from "@/components/UI/label";


interface AgreementSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agreementsData: any;
  agreementsLoading: boolean;
  formData: any;
  onAgreementToggle: (agreement: { _id: string; name: string }) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
}

const AgreementSelectionDialog: React.FC<AgreementSelectionDialogProps> = ({
  open,
  onOpenChange,
  agreementsData,
  agreementsLoading,
  formData,
  onAgreementToggle,
  currentPage,
  setCurrentPage,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>
            Select Agreements
            {!agreementsLoading &&
              agreementsData?.AgreementList?.totalSize &&
              ` (${agreementsData.AgreementList.totalSize} total)`}
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          {agreementsLoading ? (
            <div className="p-4 text-center">Loading agreements...</div>
          ) : (
            <>
              {agreementsData?.AgreementList?.data.map(
                (agreement: { _id: string; name: string }) => (
                  <div
                    key={agreement._id}
                    className="flex items-center space-x-2 py-2 border-b last:border-b-0"
                  >
                    <input
                      type="checkbox"
                      id={`agreement-${agreement._id}`}
                      checked={formData.agreements.some(
                        (a: any) => a.agreementId === agreement._id
                      )}
                      onChange={() => onAgreementToggle(agreement)}
                      className="w-4 h-4"
                    />
                    <Label
                      htmlFor={`agreement-${agreement._id}`}
                      className="flex-grow cursor-pointer"
                    >
                      {agreement.name}
                    </Label>
                  </div>
                )
              )}
              {agreementsData?.AgreementList?.totalPages > 1 && (
                <div className="flex justify-between items-center mt-4 border-t pt-4">
                  <Button
                    type="button"
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                    variant="outline"
                    size="sm"
                  >
                    Previous
                  </Button>
                  <span>
                    Page {agreementsData.AgreementList.pageNumber + 1} of {agreementsData.AgreementList.totalPages}
                  </span>
                  <Button
                    type="button"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={
                      currentPage >= agreementsData.AgreementList.totalPages - 1
                    }
                    variant="outline"
                    size="sm"
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
        <div className="flex justify-end">
          <Button type="button" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AgreementSelectionDialog;