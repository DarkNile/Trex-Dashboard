import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/UI/dialog";
import { Button } from "@/components/UI/button";

interface ChapterSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chaptersData: any;
  chaptersLoading: boolean;
  onChapterSelect: (chapter: any, type: "chapter" | "subChapter") => void;
}

const ChapterSelectionDialog: React.FC<ChapterSelectionDialogProps> = ({
  open,
  onOpenChange,
  chaptersData,
  chaptersLoading,
  onChapterSelect,
}) => {
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>
            Select Chapter
            {!chaptersLoading &&
              chaptersData?.getChapters?.totalSize &&
              ` (${chaptersData.getChapters.totalSize} total)`}
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          {chaptersLoading ? (
            <div className="p-4 text-center">Loading chapters...</div>
          ) : (
            <>
              {chaptersData?.getChapters?.data.map((chapter: any) => {
                const isExpanded = expandedChapter === chapter._id;
                return (
                  <div key={chapter._id} className="border-b last:border-b-0">
                    <div
                      className="flex items-center justify-between py-3 px-4 cursor-pointer hover:bg-secondary text-foreground dark:text-white"
                      onClick={() => {
                        if (isExpanded) {
                          onChapterSelect(chapter, "chapter");
                        } else {
                          setExpandedChapter(chapter._id);
                        }
                      }}
                    >
                      <span className="font-medium text-right flex-grow group-hover:text-black dark:group-hover:text-white">
                        {chapter.nameAr}
                      </span>
                      <div className="group-hover:bg-gray-100 dark:group-hover:bg-gray-700 absolute inset-0 -z-10"></div>
                      <ChevronDown
                        className={`w-5 h-5 transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                    {isExpanded && chapter.subChapters?.length > 0 && (
                      <div className="bg-gray-50 dark:bg-gray-800">
                        {chapter.subChapters.map((subChapter: any) => (
                          <div
                            key={subChapter._id}
                            className="flex items-center py-2 px-6 border-t cursor-pointer relative hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200"
                            onClick={() =>
                              onChapterSelect(subChapter, "subChapter")
                            }
                          >
                            <span className="text-right flex-grow ">
                              {subChapter.nameAr}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              {chaptersData?.getChapters?.totalPages > 1 && (
                <div className="flex justify-between items-center mt-4 border-t pt-4">
                  <Button
                    type="button"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(0, prev - 1))
                    }
                    disabled={currentPage === 0}
                    variant="outline"
                    size="sm"
                  >
                    Previous
                  </Button>
                  <span className="dark:text-white">
                    Page {chaptersData.getChapters.pageNumber + 1} of{" "}
                    {chaptersData.getChapters.totalPages}
                  </span>
                  <Button
                    type="button"
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    disabled={
                      currentPage >= chaptersData.getChapters.totalPages - 1
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

export default ChapterSelectionDialog;