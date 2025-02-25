// "use client";
// import { useGenericQuery } from "@/hooks/generic/useGenericQuery";
// import { gql } from "@apollo/client";
// import React, { useEffect, useState } from "react";
// import { EyeIcon, Pen, Trash } from "lucide-react";
// import GenericTable from "@/components/UI/Table/GenericTable";
// import Pagination from "@/components/UI/pagination/Pagination";
// import { useGenericMutation } from "@/hooks/generic/useGenericMutation";
// import CreateProductModal from "@/components/product/CreateProductModal";
// import UpdateProductModal from "@/components/product/UpdateProductModal";
// import ArchiveProductModal from "@/components/product/ArchiveProductModal";
// import { useRouter } from "next/navigation";

// const GET_PRODUCTS = gql`
//   query AllProducts($page: Int!) {
//     allProducts(pageable: { page: $page }, deleted: { deleted: false }) {
//       totalSize
//       totalPages
//       pageSize
//       pageNumber
//       data {
//         _id
//         HSCode
//         nameEn
//         nameAr
//         note
//         defaultDutyRate
//         serviceTax
//         adVAT
//         deletedAt
//         createdAt
//         updatedAt
//         agreements {
//           _id
//           reducedDutyRate
//           agreementId {
//             _id
//             name
//             note
//             deletedAt
//             createdAt
//             updatedAt
//             countryIds {
//               _id
//               nameEn
//               nameAr
//               code
//               deletedAt
//             }
//           }
//           applyGlobal
//         }
//         subChapterId {
//           _id
//           nameEn
//           nameAr
//           deletedAt
//           createdAt
//           updatedAt
//           chapterId {
//             _id
//             nameEn
//             nameAr
//             deletedAt
//             createdAt
//             updatedAt
//           }
//         }
//       }
//     }
//   }
// `;

// const DELETE_PRODUCT = gql`
//   mutation DeleteProduct($id: String!) {
//     deleteProduct(id: $id) {
//       _id
//       HSCode
//       nameEn
//       nameAr
//       note
//       defaultDutyRate
//       serviceTax
//       adVAT
//       deletedAt
//       createdAt
//       updatedAt
//     }
//   }
// `;

// type ProductFromAPI = {
//   _id: string;
//   HSCode: string;
//   nameEn: string;
//   nameAr: string;
//   note: string;
//   defaultDutyRate: number;
//   serviceTax: boolean;
//   adVAT: number;
//   subChapterId: {
//     _id: string;
//   };
//   measurementUnit: {
//     _id: string;
//     unitNameEn: string;
//     unitNameAr: string;
//     note: string;
//   };
// };

// interface AgreementData {
//   _id: string;
//   reducedDutyRate: number;
//   agreementId: {
//     _id: string;
//     name: string;
//   };
//   applyGlobal: boolean;
// }

// interface ProductData {
//   HSCode: string;
//   nameEn: string;
//   nameAr: string;
//   note: string;
//   defaultDutyRate: number;
//   agreements: AgreementData[];
//   serviceTax: boolean;
//   adVAT: number;
//   subChapterId: string;
//   type: "regural" | "car";
// }

// type Product = ProductFromAPI & { id: string };

// const Page = () => {
//   const router = useRouter();
//   const [currentPage, setCurrentPage] = useState(0);
//   const pageSize = 10;
//   const [selectedProductId, setSelectedProductId] = useState<string | null>(
//     null
//   );
//   const [selectedProductData, setSelectedProductData] = useState<ProductData>({
//     HSCode: "",
//     nameEn: "",
//     nameAr: "",
//     note: "",
//     defaultDutyRate: 0,
//     agreements: [],
//     serviceTax: false,
//     adVAT: 0,
//     subChapterId: "",
//     type: "regural",
//   });
//   const [open, setOpen] = useState(false);

//   const { data, loading, error, refetch } = useGenericQuery({
//     query: GET_PRODUCTS,
//     variables: {
//       page: currentPage,
//       size: pageSize,
//     },
//     onError: (error) => {
//       console.log("Error details:", {
//         message: error.message,
//         stack: error.stack,
//         graphQLErrors: error,
//       });
//     },
//   });

//   useEffect(() => {
//     if (data?.allProducts?.data) {
//       console.log("All Products:", data.allProducts.data);
//     }
//   }, [data]);

//   const { execute: deleteProduct } = useGenericMutation({
//     mutation: DELETE_PRODUCT,
//     onSuccess: () => {
//       refetch();
//     },
//     onError: (error) => {
//       console.log("Error deleting product:", error);
//     },
//   });

//   const handleDelete = (product: Product) => {
//     deleteProduct({ id: product._id });
//   };

//   const handleUpdate = (product: Product) => {
//     setSelectedProductId(product._id);
//     setSelectedProductData({
//       HSCode: product.HSCode,
//       nameEn: product.nameEn,
//       nameAr: product.nameAr,
//       note: product.note,
//       defaultDutyRate: product.defaultDutyRate,
//       agreements: [],
//       serviceTax: product.serviceTax,
//       adVAT: product.adVAT,
//       subChapterId: product.subChapterId._id,
//       type: "regural",
//     });
//     setOpen(true);
//   };
//   const transformedData: Product[] = (data?.allProducts?.data || []).map(
//     (item: ProductFromAPI) => ({
//       ...item,
//       id: item._id,
//     })
//   );

//   const columns: {
//     header: string;
//     key: keyof Product;
//     render?: (value: unknown, item: Product) => React.ReactNode;
//   }[] = [
//     { header: "HS Code", key: "HSCode" },
//     { header: "Arabic Name", key: "nameAr" },
//     { header: "English Name", key: "nameEn" },
//     {
//       header: "Duty Rate",
//       key: "defaultDutyRate",
//       render: (value) => `${value}%`,
//     },
//     {
//       header: "Service Tax",
//       key: "serviceTax",
//       render: (value) => `${value}%`,
//     },
//     {
//       header: "VAT",
//       key: "adVAT",
//       render: (value) => `${value}%`,
//     },
//     {
//       header: "Measurement Unit",
//       key: "measurementUnit",
//       render: (_, item) => item.measurementUnit?.unitNameEn || "N/A",
//     },
//     {
//       header: "Note",
//       key: "note",
//       render: (value) => `${value}` || "N/A",
//     },
//   ];

//   const actions = [
//     {
//       label: "Delete",
//       onClick: handleDelete,
//       icon: <Trash className="w-4 h-4" />,
//       className: "text-red-500",
//     },
//     {
//       label: "Edit",
//       onClick: handleUpdate,
//       className: "text-blue-500",
//       icon: <Pen className="w-4 h-4" />,
//     },
//     {
//       label: "View Product",
//       onClick: (item: Product) => {
//         router.push(`products/${item._id}`);
//       },
//       icon: <EyeIcon className="w-4 h-4" />,
//       className: "text-green-500",
//     },
//   ];

//   const handlePageChange = (newPage: number) => {
//     setCurrentPage(newPage);
//   };

//   return (
//     <div className="">
//       <div className="flex justify-between items-start px-8 pt-8 mt-5">
//         <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
//           Products
//         </h1>
//         <div className="flex flex-col items-center">
//           <CreateProductModal onSuccess={refetch} />
//           <ArchiveProductModal />
//         </div>

//         {selectedProductId && open && (
//           <UpdateProductModal
//             productId={selectedProductId}
//             productData={selectedProductData}
//             onSuccess={() => {
//               setOpen(false);
//               setSelectedProductId(null);
//               refetch();
//             }}
//             onClose={() => setOpen(false)}
//           />
//         )}
//       </div>
//       <GenericTable
//         data={transformedData}
//         columns={columns}
//         actions={actions}
//         subtitle={`Total Products: ${
//           data?.allProducts?.totalSize || transformedData.length
//         }`}
//         isLoading={loading}
//         error={error || null}
//       />
//       {!loading && !error && (
//         <Pagination
//           currentPage={data?.allProducts?.pageNumber}
//           totalPages={data?.allProducts?.totalPages || 1}
//           totalItems={data?.allProducts?.totalSize || 0}
//           pageSize={data?.allProducts?.pageSize}
//           onPageChange={handlePageChange}
//         />
//       )}
//     </div>
//   );
// };
// export default Page;



"use client";
import { useGenericQuery } from "@/hooks/generic/useGenericQuery";
import { gql } from "@apollo/client";
import React, { useEffect, useState } from "react";
import { EyeIcon, Pen, Trash, Search } from "lucide-react";
import GenericTable from "@/components/UI/Table/GenericTable";
import Pagination from "@/components/UI/pagination/Pagination";
import { useGenericMutation } from "@/hooks/generic/useGenericMutation";
import CreateProductModal from "@/components/product/CreateProductModal";
import UpdateProductModal from "@/components/product/UpdateProductModal";
import ArchiveProductModal from "@/components/product/ArchiveProductModal";
import { useRouter } from "next/navigation";

const SEARCH_PRODUCTS = gql`
  query SearchProduct($page: Int!, $chapterId: ID!, $keyword: String) {
    searchProduct(
      pageable: { page: $page }
      chapterId: $chapterId
      keyword: $keyword
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
        note
        defaultDutyRate
        serviceTax
        adVAT
        deletedAt
        createdAt
        updatedAt
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
      note
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
  note: string;
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
};

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
  note: string;
  defaultDutyRate: number;
  agreements: AgreementData[];
  serviceTax: boolean;
  adVAT: number;
  subChapterId: string;
  type: "regural" | "car";
}

type Product = ProductFromAPI & { id: string };

const Page = () => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState("");
  const pageSize = 10;
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedProductData, setSelectedProductData] = useState<ProductData>({
    HSCode: "",
    nameEn: "",
    nameAr: "",
    note: "",
    defaultDutyRate: 0,
    agreements: [],
    serviceTax: false,
    adVAT: 0,
    subChapterId: "",
    type: "regural",
  });
  const [open, setOpen] = useState(false);

  const { data, loading, error, refetch } = useGenericQuery({
    query: SEARCH_PRODUCTS,
    variables: {
      page: currentPage,
      chapterId: "67a7a9b5bda4138d28f95954",
      keyword: searchKeyword || undefined,
    },
    onError: (error) => {
      console.log("Error details:", {
        message: error.message,
        stack: error.stack,
        graphQLErrors: error,
      });
    },
  });

  useEffect(() => {
    if (data?.searchProduct?.data) {
      console.log("Search Products:", data.searchProduct.data);
    }
  }, [data]);

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
      note: product.note,
      defaultDutyRate: product.defaultDutyRate,
      agreements: [],
      serviceTax: product.serviceTax,
      adVAT: product.adVAT,
      subChapterId: product.subChapterId._id,
      type: "regural",
    });
    setOpen(true);
  };

  const transformedData: Product[] = (data?.searchProduct?.data || []).map(
    (item: ProductFromAPI) => ({
      ...item,
      id: item._id,
    })
  );

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
      render: (value) => (typeof value === 'number' ? `${value}%` : 'N/A'),
    },
    {
      header: "Service Tax",
      key: "serviceTax",
      render: (value) => (typeof value === 'boolean' ? (value ? 'Yes' : 'No') : 'N/A'),
    },
    {
      header: "VAT",
      key: "adVAT",
      render: (value) => (typeof value === 'number' ? `${value}%` : 'N/A'),
    },
    {
      header: "Measurement Unit",
      key: "measurementUnit",
      render: (_, item) => item.measurementUnit?.unitNameEn || "N/A",
    },
    {
      header: "Note",
      key: "note",
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
        router.push(`products/${item._id}`);
      },
      icon: <EyeIcon className="w-4 h-4" />,
      className: "text-green-500",
    },
  ];

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="">
      <div className="flex justify-between items-start px-8 pt-8 mt-5">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Products
        </h1>
        <div className="flex flex-col items-center">
          <CreateProductModal onSuccess={refetch} />
          <ArchiveProductModal />
        </div>

        {selectedProductId && open && (
          <UpdateProductModal
            productId={selectedProductId}
            productData={selectedProductData}
            onSuccess={() => {
              setOpen(false);
              setSelectedProductId(null);
              refetch();
            }}
            onClose={() => setOpen(false)}
          />
        )}
      </div>

      {/* Search Bar */}
      <div className="px-8 py-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by HS Code, Arabic Name, or English Name..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        </div>
      </div>

      <GenericTable
        data={transformedData}
        columns={columns}
        actions={actions}
        subtitle={`Total Products: ${
          data?.searchProduct?.totalSize || transformedData.length
        }`}
        isLoading={loading}
        error={error || null}
      />
      {!loading && !error && (
        <Pagination
          currentPage={data?.searchProduct?.pageNumber}
          totalPages={data?.searchProduct?.totalPages || 1}
          totalItems={data?.searchProduct?.totalSize || 0}
          pageSize={data?.searchProduct?.pageSize}
          onPageChange={handlePageChange} 
        />
      )}
    </div>
  );
};

export default Page;









// "use client";
// import { useGenericQuery } from "@/hooks/generic/useGenericQuery";
// import { gql } from "@apollo/client";
// import React, { useEffect, useState } from "react";
// import { EyeIcon, Pen, Trash, Search, Filter } from "lucide-react";
// import GenericTable from "@/components/UI/Table/GenericTable";
// import Pagination from "@/components/UI/pagination/Pagination";
// import { useGenericMutation } from "@/hooks/generic/useGenericMutation";
// import CreateProductModal from "@/components/product/CreateProductModal";
// import UpdateProductModal from "@/components/product/UpdateProductModal";
// import ArchiveProductModal from "@/components/product/ArchiveProductModal";
// import { useRouter } from "next/navigation";

// const GET_CHAPTERS = gql`
//   query GetAllChapters {
//     chapters {
//       data {
//         _id
//         nameEn
//         nameAr
//         code
//         subChapters {
//           _id
//           nameEn
//           nameAr
//           code
//         }
//       }
//       totalSize
//       pageSize
//       pageNumber
//       totalPages
//     }
//   }
// `;

// const SEARCH_PRODUCTS = gql`
//   query SearchProduct($page: Int!, $chapterId: ID!, $subChapterId: ID, $keyword: String) {
//     searchProduct(
//       pageable: { page: $page }
//       chapterId: $chapterId
//       subChapterId: $subChapterId
//       keyword: $keyword
//     ) {
//       totalSize
//       totalPages
//       pageSize
//       pageNumber
//       data {
//         _id
//         HSCode
//         nameEn
//         nameAr
//         note
//         defaultDutyRate
//         serviceTax
//         adVAT
//         deletedAt
//         createdAt
//         updatedAt
//       }
//     }
//   }
// `;


// const DELETE_PRODUCT = gql`
//   mutation DeleteProduct($id: String!) {
//     deleteProduct(id: $id) {
//       _id
//       HSCode
//       nameEn
//       nameAr
//       note
//       defaultDutyRate
//       serviceTax
//       adVAT
//       deletedAt
//       createdAt
//       updatedAt
//     }
//   }
// `;

// type Chapter = {
//   _id: string;
//   nameEn: string;
//   nameAr: string;
//   subChapters: {
//     _id: string;
//     nameEn: string;
//     nameAr: string;
//   }[];
// };

// type ProductFromAPI = {
//   _id: string;
//   HSCode: string;
//   nameEn: string;
//   nameAr: string;
//   note: string;
//   defaultDutyRate: number;
//   serviceTax: boolean;
//   adVAT: number;
//   subChapterId: {
//     _id: string;
//   };
//   measurementUnit: {
//     _id: string;
//     unitNameEn: string;
//     unitNameAr: string;
//     note: string;
//   };
// };

// interface AgreementData {
//   _id: string;
//   reducedDutyRate: number;
//   agreementId: {
//     _id: string;
//     name: string;
//   };
//   applyGlobal: boolean;
// }

// interface ProductData {
//   HSCode: string;
//   nameEn: string;
//   nameAr: string;
//   note: string;
//   defaultDutyRate: number;
//   agreements: AgreementData[];
//   serviceTax: boolean;
//   adVAT: number;
//   subChapterId: string;
//   type: "regural" | "car";
// }

// type Product = ProductFromAPI & { id: string };

// const Page = () => {
//   const router = useRouter();
//   const [currentPage, setCurrentPage] = useState(0);
//   const [searchKeyword, setSearchKeyword] = useState("");
//   const [selectedChapterId, setSelectedChapterId] = useState("67a7a9b5bda4138d28f95954");
//   const [selectedSubChapterId, setSelectedSubChapterId] = useState<string | undefined>();
//   const pageSize = 10;
//   const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
//   const [selectedProductData, setSelectedProductData] = useState<ProductData>({
//     HSCode: "",
//     nameEn: "",
//     nameAr: "",
//     note: "",
//     defaultDutyRate: 0,
//     agreements: [],
//     serviceTax: false,
//     adVAT: 0,
//     subChapterId: "",
//     type: "regural",
//   });
//   const [open, setOpen] = useState(false);
//   const [showFilters, setShowFilters] = useState(false);

//   const { data: chaptersData, loading: chaptersLoading, error: chaptersError } = useGenericQuery({
//     query: GET_CHAPTERS,
//     onError: (error) => {
//       console.log("Error fetching chapters:", error);
//     },
//   });

//   useEffect(() => {
//     if (chaptersData) {
//       console.log("Chapters data:", chaptersData);
//     }
//   }, [chaptersData]);
  

//   const { data, loading, error, refetch } = useGenericQuery({
//     query: SEARCH_PRODUCTS,
//     variables: {
//       page: currentPage,
//       chapterId: selectedChapterId,
//       subChapterId: selectedSubChapterId,
//       keyword: searchKeyword || undefined,
//     },
//     onError: (error) => {
//       console.log("Error details:", {
//         message: error.message,
//         stack: error.stack,
//         graphQLErrors: error,
//       });
//     },
//   });

//   useEffect(() => {
//     if (data?.searchProduct?.data) {
//       console.log("Search Products:", data.searchProduct.data);
//     }
//   }, [data]);

//   const { execute: deleteProduct } = useGenericMutation({
//     mutation: DELETE_PRODUCT,
//     onSuccess: () => {
//       refetch();
//     },
//     onError: (error) => {
//       console.log("Error deleting product:", error);
//     },
//   });

//   const handleDelete = (product: Product) => {
//     deleteProduct({ id: product._id });
//   };

//   const handleUpdate = (product: Product) => {
//     setSelectedProductId(product._id);
//     setSelectedProductData({
//       HSCode: product.HSCode,
//       nameEn: product.nameEn,
//       nameAr: product.nameAr,
//       note: product.note,
//       defaultDutyRate: product.defaultDutyRate,
//       agreements: [],
//       serviceTax: product.serviceTax,
//       adVAT: product.adVAT,
//       subChapterId: product.subChapterId._id,
//       type: "regural",
//     });
//     setOpen(true);
//   };

//   const transformedData: Product[] = (data?.searchProduct?.data || []).map(
//     (item: ProductFromAPI) => ({
//       ...item,
//       id: item._id,
//     })
//   );

//   const columns: {
//     header: string;
//     key: keyof Product;
//     render?: (value: unknown, item: Product) => React.ReactNode;
//   }[] = [
//     { header: "HS Code", key: "HSCode" },
//     { header: "Arabic Name", key: "nameAr" },
//     { header: "English Name", key: "nameEn" },
//     {
//       header: "Duty Rate",
//       key: "defaultDutyRate",
//       render: (value) => (typeof value === 'number' ? `${value}%` : 'N/A'),
//     },
//     {
//       header: "Service Tax",
//       key: "serviceTax",
//       render: (value) => (typeof value === 'boolean' ? (value ? 'Yes' : 'No') : 'N/A'),
//     },
//     {
//       header: "VAT",
//       key: "adVAT",
//       render: (value) => (typeof value === 'number' ? `${value}%` : 'N/A'),
//     },
//     {
//       header: "Measurement Unit",
//       key: "measurementUnit",
//       render: (_, item) => item.measurementUnit?.unitNameEn || "N/A",
//     },
//     {
//       header: "Note",
//       key: "note",
//       render: (value) => value?.toString() || "N/A",
//     },
//   ];

//   const actions = [
//     {
//       label: "Delete",
//       onClick: handleDelete,
//       icon: <Trash className="w-4 h-4" />,
//       className: "text-red-500",
//     },
//     {
//       label: "Edit",
//       onClick: handleUpdate,
//       className: "text-blue-500",
//       icon: <Pen className="w-4 h-4" />,
//     },
//     {
//       label: "View Product",
//       onClick: (item: Product) => {
//         router.push(`products/${item._id}`);
//       },
//       icon: <EyeIcon className="w-4 h-4" />,
//       className: "text-green-500",
//     },
//   ];

//   const handlePageChange = (newPage: number) => {
//     setCurrentPage(newPage);
//   };

//   const chapters = chaptersData?.chapters?.data || [];
//   const selectedChapter = chapters.find(
//     (chapter: Chapter) => chapter._id === selectedChapterId
//   );

//   return (
//     <div className="">
//       <div className="flex justify-between items-start px-8 pt-8 mt-5">
//         <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
//           Products
//         </h1>
//         <div className="flex flex-col items-center">
//           <CreateProductModal onSuccess={refetch} />
//           <ArchiveProductModal />
//         </div>

//         {selectedProductId && open && (
//           <UpdateProductModal
//             productId={selectedProductId}
//             productData={selectedProductData}
//             onSuccess={() => {
//               setOpen(false);
//               setSelectedProductId(null);
//               refetch();
//             }}
//             onClose={() => setOpen(false)}
//           />
//         )}
//       </div>

//       {/* Search and Filter Bar */}
//       <div className="px-8 py-4 space-y-4">
//         <div className="relative">
//           <input
//             type="text"
//             placeholder="Search by HS Code, Arabic Name, or English Name..."
//             value={searchKeyword}
//             onChange={(e) => setSearchKeyword(e.target.value)}
//             className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
//         </div>

//         <div className="flex items-center space-x-4">
//         <button
//             onClick={() => setShowFilters(!showFilters)}
//             className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
//           >
//             <Filter className="h-5 w-5" />
//             <span>Filters</span>
//           </button>

//           {showFilters && (
//             <div className="flex space-x-4">
//               {chaptersLoading ? (
//                 <div className="text-gray-500">Loading chapters...</div>
//               ) : chaptersError ? (
//                 <div className="text-red-500">Error loading chapters</div>
//               ) : (
//                 <>
//                   <select
//                     value={selectedChapterId}
//                     onChange={(e) => {
//                       setSelectedChapterId(e.target.value);
//                       setSelectedSubChapterId(undefined);
//                     }}
//                     className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   >
//                     <option value="">Select Chapter</option>
//                     {chapters.map((chapter: Chapter) => (
//                       <option key={chapter._id} value={chapter._id}>
//                         {chapter._id} - {chapter.nameEn}
//                       </option>
//                     ))}
//                   </select>

//                   {selectedChapter && (
//                     <select
//                       value={selectedSubChapterId}
//                       onChange={(e) => setSelectedSubChapterId(e.target.value)}
//                       className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     >
//                       <option value="">All Subchapters</option>
//                       {selectedChapter.subChapters.map((subChapter: Chapter) => (
//                         <option key={subChapter._id} value={subChapter._id}>
//                           {subChapter._id} - {subChapter.nameEn}
//                         </option>
//                       ))}
//                     </select>
//                   )}
//                 </>
//               )}
//             </div>
//           )}
//         </div>
//       </div>

//       <GenericTable
//         data={transformedData}
//         columns={columns}
//         actions={actions}
//         subtitle={`Total Products: ${
//           data?.searchProduct?.totalSize || transformedData.length
//         }`}
//         isLoading={loading}
//         error={error || null}
//       />
//       {!loading && !error && (
//         <Pagination
//           currentPage={data?.searchProduct?.pageNumber}
//           totalPages={data?.searchProduct?.totalPages || 1}
//           totalItems={data?.searchProduct?.totalSize || 0}
//           pageSize={data?.searchProduct?.pageSize}
//           onPageChange={handlePageChange}
//         />
//       )}
//     </div>
//   );
// };

// export default Page;


