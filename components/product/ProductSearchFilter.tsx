"use client";
import React from "react";
import { Search, Filter, ChevronDown } from "lucide-react";
import { Button } from "@/components/UI/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/UI/dialog";

interface Chapter {
    _id: string;
    nameEn: string;
    nameAr: string;
    subChapters: SubChapter[];
  }
  
  interface SubChapter {
    _id: string;
    nameEn: string;
    nameAr: string;
  }
interface ProductSearchFilterProps {
  showSearch: boolean;
  showFilter: boolean;
  searchKeyword: string;
  selectedFilterType: string;
  isFilterDialogOpen: boolean;
  selectedFilterName: string;
  chaptersLoading: boolean;
  chaptersData: any;
  expandedChapter: string;
  currentChapterPage: number;
  toggleSearch: () => void;
  toggleFilter: () => void;
  setSearchKeyword: (keyword: string) => void;
  clearFilter: () => void;
  Reset: () => void;
  setIsFilterDialogOpen: (isOpen: boolean) => void;
  setExpandedChapter: (chapterId: string) => void;
  handleFilterSelect:  (item: Chapter | SubChapter, type: "chapter" | "subChapter") => void;
  setCurrentChapterPage: (page: number | ((prev: number) => number)) => void;
}

const ProductSearchFilter: React.FC<ProductSearchFilterProps> = ({
  showSearch,
  showFilter,
  searchKeyword,
  selectedFilterType,
  isFilterDialogOpen,
  selectedFilterName,
  chaptersLoading,
  chaptersData,
  expandedChapter,
  currentChapterPage,
  toggleSearch,
  toggleFilter,
  setSearchKeyword,
  clearFilter,
  Reset,
  setIsFilterDialogOpen,
  setExpandedChapter,
  handleFilterSelect,
  setCurrentChapterPage,
}) => {
  const getFilterDisplayText = () => {
    if (selectedFilterType === "chapter") {
      return `Chapter: ${selectedFilterName}`;
    } else if (selectedFilterType === "subChapter") {
      return `Sub-Chapter: ${selectedFilterName}`;
    }
    return "Filter by Chapter/Sub-Chapter";
  };

  return (
    <>
      <div className="px-8 py-4 flex gap-4">
        <Button
          variant={showSearch ? "default" : "outline"}
          onClick={toggleSearch}
          className="flex items-center gap-2"
        >
          <Search className="h-5 w-5" />
          Search
        </Button>

        <Button
          variant={showFilter ? "default" : "outline"}
          onClick={toggleFilter}
          className="flex items-center gap-2"
        >
          <Filter className="h-5 w-5" />
          Filter
        </Button>

        {(showSearch && searchKeyword) || (showFilter && selectedFilterType) || searchKeyword || selectedFilterType ? (
          <Button
            variant="outline"
            onClick={() => {
              setSearchKeyword("");
              clearFilter();
              Reset();
            }}
            className="ml-auto"
          >
            Clear All
          </Button>
        ) : null}
      </div>

      {/* Search Bar - Only visible when showSearch is true */}
      {showSearch && (
        <div className="px-8 py-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by HS Code, Arabic Name, or English Name..."
              value={searchKeyword}
              onChange={(e) => {
                setSearchKeyword(e.target.value);
                if (e.target.value === "") {
                  // setCurrentPage(1) is handled in the parent component
                }
              }}
              className="w-full px-4 py-2 pl-10 pr-4 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          </div>
        </div>
      )}

      {/* Filter UI - Only visible when showFilter is true */}
      {showFilter && (
        <div className="px-8 py-2">
          <div className="flex items-center gap-4">
            <div className="flex-grow">
              <Button
                type="button"
                variant="outline"
                className="w-full min-h-[40px] h-auto py-2 px-4 bg-background"
                onClick={() => setIsFilterDialogOpen(true)}
              >
                <div className="flex w-full items-center gap-2">
                  <span className="flex-grow text-left whitespace-normal break-words leading-normal text-foreground">
                    {getFilterDisplayText()}
                  </span>
                  <ChevronDown className="w-4 h-4 flex-shrink-0" />
                </div>
              </Button>
            </div>
            {selectedFilterType && (
              <Button variant="outline" onClick={clearFilter}>
                Clear Filter
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Chapter/SubChapter Filter Dialog */}
      <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
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
                        className="flex items-center justify-between py-3 px-4 cursor-pointer hover:bg-muted"
                        onClick={() => {
                          if (isExpanded) {
                            handleFilterSelect(chapter, "chapter");
                          } else {
                            setExpandedChapter(chapter._id);
                          }
                        }}
                      >
                        <span className="font-medium text-right flex-grow text-foreground">
                          {chapter.nameAr}
                        </span>
                        <ChevronDown
                          className={`w-5 h-5 transition-transform ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                      {isExpanded && chapter.subChapters?.length > 0 && (
                        <div className="bg-gray-50">
                          {chapter.subChapters.map((subChapter:any) => (
                            <div
                              key={subChapter._id}
                              className="flex items-center py-2 px-6 border-t bg-card border-border cursor-pointer hover:bg-accent"
                              onClick={() =>
                                handleFilterSelect(subChapter, "subChapter")
                              }
                            >
                              <span className="text-right flex-grow text-foreground">
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
                  <div className="flex justify-between items-center mt-4 border-t border-border pt-4">
                    <Button
                      type="button"
                      onClick={() =>
                        setCurrentChapterPage((prev: number) => Math.max(0, prev - 1))
                      }
                      disabled={currentChapterPage === 0}
                      variant="outline"
                      size="sm"
                    >
                      Previous
                    </Button>
                    <span className="text-foreground">
                      Page {chaptersData.getChapters.pageNumber + 1} of{" "}
                      {chaptersData.getChapters.totalPages}
                    </span>
                    <Button
                      type="button"
                      onClick={() => setCurrentChapterPage((prev: number) => prev + 1)}
                      disabled={
                        currentChapterPage >=
                        chaptersData.getChapters.totalPages - 1
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
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductSearchFilter;