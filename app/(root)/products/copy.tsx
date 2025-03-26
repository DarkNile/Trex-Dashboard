"use client";
import { useGenericQuery } from "@/hooks/generic/useGenericQuery";
import { gql } from "@apollo/client";
import React, { useEffect, useState } from "react";
import { EyeIcon, Pen, Trash } from "lucide-react";
import GenericTable from "@/components/UI/Table/GenericTable";
import Pagination from "@/components/UI/pagination/Pagination";
import { useGenericMutation } from "@/hooks/generic/useGenericMutation";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { getListState, saveListState } from "@/hooks/generic/findProductPage";
import ProductHeader from "@/components/product/ProductHeader";
import ProductSearchFilter from "@/components/product/ProductSearchFilter";

const GET_PRODUCTS = gql`
  query AllProducts($page: Int!) {
    allProducts(pageable: { page: $page }, deleted: { deleted: false }) {
      totalSize
      totalPages
      pageSize
      pageNumber
      data {
        _id
        HSCode
        nameEn
        nameAr
        noteEn
        noteAr
        defaultDutyRate
        serviceTax
        adVAT
        deletedAt
        createdAt
        updatedAt
        agreements {
          _id
          reducedDutyRate
          agreementId {
            _id
            name
            note
            deletedAt
            createdAt
            updatedAt
            countryIds {
              _id
              nameEn
              nameAr
              code
              deletedAt
            }
          }
          applyGlobal
        }
        subChapterId {
          _id
          nameEn
          nameAr
          deletedAt
          createdAt
          updatedAt
          chapterId {
            _id
            nameEn
            nameAr
            deletedAt
            createdAt
            updatedAt
          }
        }
        measurementUnit {
          _id
          unitNameAr
          unitNameEn
        }
        scheduleTaxes {
          min
          max
          fee
          enhancementFee
        }
      }
    }
  }
`;

const GET_CHAPTERS = gql`
  query GetChapters($page: Int!) {
    getChapters(extraFilter: { deleted: false }, pageable: { page: $page }) {
      data {
        _id
        nameEn
        nameAr
        subChapters {
          _id
          nameEn
          nameAr
        }
      }
      totalSize
      totalPages
      pageNumber
      pageSize
    }
  }
`;
const SEARCH_PRODUCTS = gql`
  query SearchProduct(
    $keyword: String
    $chapterId: ID
    $subChapterId: ID
    $page: Int!
  ) {
    searchProduct(
      pageable: { page: $page }
      keyword: $keyword
      chapterId: $chapterId
      subChapterId: $subChapterId
    ) {
      totalSize
      totalPages
      pageSize
      pageNumber
      data {
        _id
        HSCode
        nameEn
        nameAr
        noteEn
        noteAr
        defaultDutyRate
        serviceTax
        adVAT
        deletedAt
        createdAt
        updatedAt
        agreements {
          _id
          reducedDutyRate
          agreementId {
            _id
            name
            note
            deletedAt
            createdAt
            updatedAt
            countryIds {
              _id
              nameEn
              nameAr
              code
              deletedAt
            }
          }
          applyGlobal
        }
        measurementUnit {
          _id
          unitNameAr
          unitNameEn
        }
        scheduleTaxes {
          min
          max
          fee
          enhancementFee
        }
        subChapterId {
          _id
          nameEn
          nameAr
          deletedAt
          createdAt
          updatedAt
        }
      }
    }
  }
`;

const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: String!) {
    deleteProduct(id: $id) {
      _id
      HSCode
      nameEn
      nameAr
      noteEn
      noteAr
      defaultDutyRate
      serviceTax
      adVAT
      deletedAt
      createdAt
      updatedAt
    }
  }
`;

type ProductFromAPI = {
  _id: string;
  HSCode: string;
  nameEn: string;
  nameAr: string;
  noteEn: string;
  noteAr: string;
  defaultDutyRate: number;
  serviceTax: boolean;
  adVAT: number;
  subChapterId: {
    _id: string;
  };
  measurementUnit: {
    _id: string;
    unitNameEn: string;
    unitNameAr: string;
    note: string;
  };
  scheduleTaxes: ScheduleTax[];
  agreements: AgreementData[];
};
interface ScheduleTax {
  min: number;
  max: number;
  fee: number;
  enhancementFee: number;
}
interface AgreementData {
  _id: string;
  reducedDutyRate: number;
  agreementId: {
    _id: string;
    name: string;
  };
  applyGlobal: boolean;
}

interface ProductData {
  HSCode: string;
  nameEn: string;
  nameAr: string;
  noteEn: string;
  noteAr: string;
  defaultDutyRate: number;
  agreements: AgreementData[];
  scheduleTaxes: ScheduleTax[];
  serviceTax: boolean;
  adVAT: number;
  subChapterId: string;
  type: "regural" | "car";
}

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

type Product = ProductFromAPI & { id: string };

const ProductsContent = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [currentChapterPage, setCurrentChapterPage] = useState(0);
  const [currentPage, setCurrentPage] = useState(() => {
    const pageParam = searchParams.get('page');
    if (pageParam) {
      return parseInt(pageParam);
    }
    
    const savedState = getListState();
    return savedState.page || 1;
  });
  const [searchKeyword, setSearchKeyword] = useState(() => {
    const keywordParam = searchParams.get('keyword');
    if (keywordParam) {
      return keywordParam;
    }
    
    const savedState = getListState();
    return savedState.keyword || "";
  });
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  );
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);
  const [selectedProductData, setSelectedProductData] = useState<ProductData>({
    HSCode: "",
    nameEn: "",
    nameAr: "",
    noteEn: "",
    noteAr: "",
    defaultDutyRate: 0,
    agreements: [],
    serviceTax: false,
    adVAT: 0,
    subChapterId: "",
    type: "regural",
    scheduleTaxes: [],
  });
  const [open, setOpen] = useState(false);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(() => {
    const chapterParam = searchParams.get('chapterId');
    if (chapterParam) {
      return chapterParam;
    }
    const savedState = getListState();
    return savedState.chapterId || null;
  });
  const [selectedSubChapterId, setSelectedSubChapterId] = useState<string | null>(() => {
    const subChapterParam = searchParams.get('subChapterId');
    if (subChapterParam) {
      return subChapterParam;
    }
    const savedState = getListState();
    return savedState.subChapterId || null;
  });
  const [selectedFilterName, setSelectedFilterName] = useState<string>("");
  const [selectedFilterType, setSelectedFilterType] = useState<
    "chapter" | "subChapter" | null
  >(null);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      saveListState({
        page: currentPage,
        keyword: searchKeyword,
        chapterId: selectedChapterId,
        subChapterId: selectedSubChapterId,
      });
      const params = new URLSearchParams();
      if (currentPage > 1) {
        params.set('page', currentPage.toString());
      }
      if (searchKeyword) {
        params.set('keyword', searchKeyword);
      }
      if (selectedChapterId) {
        params.set('chapterId', selectedChapterId);
      }
      if (selectedSubChapterId) {
        params.set('subChapterId', selectedSubChapterId);
      }
      const newUrl = pathname + (params.toString() ? `?${params.toString()}` : '');
      window.history.replaceState({}, '', newUrl);
    }
  }, [currentPage, searchKeyword, selectedChapterId, selectedSubChapterId, pathname]);

  const hasSearchOrFilter =
    searchKeyword || selectedChapterId || selectedSubChapterId;
  const query = hasSearchOrFilter ? SEARCH_PRODUCTS : GET_PRODUCTS;
  const variables = hasSearchOrFilter
    ? {
        page: currentPage,
        chapterId: selectedChapterId,
        subChapterId: selectedSubChapterId,
        keyword: searchKeyword,
      }
    : {
        page: currentPage,
      };

  const { data, loading, error, refetch } = useGenericQuery({
    query,
    variables,
    onError: (error) => {
      console.log("Error loading products:", error);
    },
  });
  const { data: chaptersData, loading: chaptersLoading } = useGenericQuery({
    query: GET_CHAPTERS,
    variables: {
      page: currentChapterPage,
    },
    onError: (error) => {
      console.error("chapters loading error:", error);
      toast.error(`Error loading chapters: ${error.message}`);
    },
  });
  useEffect(() => {
    if (data) {
      const productData = hasSearchOrFilter
        ? data.searchProduct?.data
        : data.allProducts?.data;

      if (productData) {
        console.log("Products data:", productData);
      }
    }
  }, [data, hasSearchOrFilter]);

  console.log("Query params:", {
    page: currentPage,
    chapterId: selectedChapterId,
    subChapterId: selectedSubChapterId,
    keyword: searchKeyword,
    hasSearchOrFilter,
  });

  const { execute: deleteProduct } = useGenericMutation({
    mutation: DELETE_PRODUCT,
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      console.log("Error deleting product:", error);
    },
  });

  const handleDelete = (product: Product) => {
    deleteProduct({ id: product._id });
  };

  const handleUpdate = (product: Product) => {
    setSelectedProductId(product._id);
    setSelectedProductData({
      HSCode: product.HSCode,
      nameEn: product.nameEn,
      nameAr: product.nameAr,
      noteEn: product.noteEn,
      noteAr: product.noteAr,
      defaultDutyRate: product.defaultDutyRate,
      agreements: product.agreements,
      scheduleTaxes: product.scheduleTaxes,
      serviceTax: product.serviceTax,
      adVAT: product.adVAT,
      subChapterId: product.subChapterId._id,
      type: "regural",
    });
    setOpen(true);
  };
  const rawData = hasSearchOrFilter
    ? data?.searchProduct?.data || []
    : data?.allProducts?.data || [];

  const transformedData: Product[] = rawData.map((item: ProductFromAPI) => ({
    ...item,
    id: item._id,
  }));

  const columns: {
    header: string;
    key: keyof Product;
    render?: (value: unknown, item: Product) => React.ReactNode;
  }[] = [
    { header: "HS Code", key: "HSCode" },
    { header: "Arabic Name", key: "nameAr" },
    { header: "English Name", key: "nameEn" },
    {
      header: "Duty Rate",
      key: "defaultDutyRate",
      render: (value) => (typeof value === "number" ? `${value}%` : "N/A"),
    },
    {
      header: "Service Tax",
      key: "serviceTax",
      render: (value) =>
        typeof value === "boolean" ? (value ? "Yes" : "No") : "N/A",
    },
    {
      header: "VAT",
      key: "adVAT",
      render: (value) => (typeof value === "number" ? `${value}%` : "N/A"),
    },
    {
      header: "Measurement Unit",
      key: "measurementUnit",
      render: (_, item) => item.measurementUnit?.unitNameEn || "N/A",
    },
    {
      header: "English Note",
      key: "noteEn",
      render: (value) => value?.toString() || "N/A",
    },
    {
      header: "Arabic Note",
      key: "noteAr",
      render: (value) => value?.toString() || "N/A",
    },
  ];

  const actions = [
    {
      label: "Delete",
      onClick: handleDelete,
      icon: <Trash className="w-4 h-4" />,
      className: "text-red-500",
    },
    {
      label: "Edit",
      onClick: handleUpdate,
      className: "text-blue-500",
      icon: <Pen className="w-4 h-4" />,
    },
    {
      label: "View Product",
      onClick: (item: Product) => {
        saveListState({
          page: currentPage,
          keyword: searchKeyword,
          chapterId: selectedChapterId,
          subChapterId: selectedSubChapterId,
        });
        
        router.push(`/products/${item._id}`);
      },
      icon: <EyeIcon className="w-4 h-4" />,
      className: "text-green-500",
    },
  ];
  
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    saveListState({
      page: newPage,
      keyword: searchKeyword,
      chapterId: selectedChapterId,
      subChapterId: selectedSubChapterId,
    });
  };
  const toggleSearch = () => {
    if (showFilter) {
      setSelectedChapterId(null);
      setSelectedSubChapterId(null);
      setSelectedFilterName("");
      setSelectedFilterType(null);
      setShowFilter(false);
    }
    setShowSearch(!showSearch);
    if (showSearch) {
      setSearchKeyword("");
    }
  };

  // Toggle filter visibility and reset search
  const toggleFilter = () => {
    if (showSearch) {
      setSearchKeyword("");
      setShowSearch(false);
    }
    setShowFilter(!showFilter);
    if (showFilter) {
      setSelectedChapterId(null);
      setSelectedSubChapterId(null);
      setSelectedFilterName("");
      setSelectedFilterType(null);
    }
  };

  const handleFilterSelect = (
    item: Chapter | SubChapter,
    type: "chapter" | "subChapter"
  ) => {
    if (type === "chapter") {
      const chapter = item as Chapter;
      setSelectedChapterId(chapter._id);
      setSelectedSubChapterId(null);
      setSelectedFilterName(chapter.nameAr);
      setSelectedFilterType("chapter");
    } else {
      const subChapter = item as SubChapter;
      setSelectedSubChapterId(subChapter._id);
      setSelectedFilterName(subChapter.nameAr);
      setSelectedFilterType("subChapter");
    }
    setIsFilterDialogOpen(false);
    setCurrentPage(1);
    setCurrentChapterPage(0);
  };

  const clearFilter = () => {
    setSelectedChapterId(null);
    setSelectedSubChapterId(null);
    setSelectedFilterName("");
    setSelectedFilterType(null);
    setCurrentPage(1);
    setCurrentChapterPage(0);
  };


  const paginationInfo = hasSearchOrFilter
    ? data?.searchProduct
    : data?.allProducts;

    const Reset = () => {
      setCurrentPage(1);
      setCurrentChapterPage(0);
      setShowSearch(false);
      setShowFilter(false);
      setSearchKeyword("");
      setSelectedChapterId(null);
      setSelectedSubChapterId(null);
      setSelectedFilterName("");
      setSelectedFilterType(null);
    };

    return (
      <div className="">
        <ProductHeader 
          refetch={refetch}
          selectedProductId={selectedProductId}
          open={open}
          selectedProductData={selectedProductData}
          setOpen={setOpen}
          setSelectedProductId={setSelectedProductId}
        />
        
        <ProductSearchFilter
          showSearch={showSearch}
          showFilter={showFilter}
          searchKeyword={searchKeyword}
          selectedFilterType={selectedFilterType || ""}
          isFilterDialogOpen={isFilterDialogOpen}
          selectedFilterName={selectedFilterName}
          chaptersLoading={chaptersLoading}
          chaptersData={chaptersData}
          expandedChapter={expandedChapter || ""}
          currentChapterPage={currentChapterPage}
          toggleSearch={toggleSearch}
          toggleFilter={toggleFilter}
          setSearchKeyword={setSearchKeyword}
          clearFilter={clearFilter}
          Reset={Reset}
          setIsFilterDialogOpen={setIsFilterDialogOpen}
          setExpandedChapter={setExpandedChapter}
          handleFilterSelect={handleFilterSelect}
          setCurrentChapterPage={setCurrentChapterPage}
        />
  
        {loading ? (
          <p className="text-center text-muted-foreground">Loading products...</p>
        ) : rawData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <p className="text-lg font-semibold">No products found</p>
            <p className="text-sm">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <GenericTable
            data={transformedData}
            columns={columns}
            actions={actions}
            subtitle={`Total Products: ${
              paginationInfo?.totalSize || transformedData.length
            }`}
            isLoading={loading}
            error={error || null}
          />
        )}
        {!loading && !error && (
          <Pagination
            currentPage={paginationInfo?.pageNumber}
            totalPages={paginationInfo?.totalPages || 1}
            totalItems={paginationInfo?.totalSize || 0}
            pageSize={paginationInfo?.pageSize}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    );
};

export default ProductsContent;
