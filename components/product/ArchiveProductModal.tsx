import React, { useState } from "react";
import { ArchiveRestore, Pen, Trash } from "lucide-react";
import { gql } from "@apollo/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../UI/dialog";
import { Button } from "../UI/button";
import { useGenericQuery } from "@/hooks/generic/useGenericQuery";
import { useGenericMutation } from "@/hooks/generic/useGenericMutation";
import GenericTable from "../UI/Table/GenericTable";
import Pagination from "../UI/pagination/Pagination";


const GET_PRODUCTS = gql`
  query AllProducts($page: Int!) {
    allProducts(pageable: { page: $page }, deleted: { deleted: true }) {
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
      }
    }
  }
`;

const DELETE_PRODUCT = gql`
mutation HardDeleteProduct($id: String!) {
    hardDeleteProduct(id: $id) {
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

const RESTORE_PRODUCT = gql`
mutation RestoreProduct($id: String!) {
    restoreProduct(id: $id) {
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
    defaultDutyRate: number;
    agreements: AgreementData[];
    serviceTax: boolean;
    adVAT: number;
    subChapterId: string;
    type: "regural" | "car";
  }
  
  type Product = ProductFromAPI & { id: string };

    const ArchiveProductModal = () => {


  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  );
  const [selectedProductData, setSelectedProductData] = useState<ProductData>({
    HSCode: "",
    nameEn: "",
    nameAr: "",
    defaultDutyRate: 0,
    agreements: [],
    serviceTax: false,
    adVAT: 0,
    subChapterId: "",
    type: "regural",
  });

  const { data, loading, error, refetch } = useGenericQuery({
    query: GET_PRODUCTS,
    variables: {
      page: currentPage,
      size: pageSize,
    },
    onError: (error) => {
      console.log("Error details:", {
        message: error.message,
        stack: error.stack,
        graphQLErrors: error,
      });
    },
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



  const { execute: restoreProduct } = useGenericMutation({
    mutation: RESTORE_PRODUCT,
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      console.log("Error restoring product:", error);
    },
  });

  const handleRestore = (product: Product) => {
    restoreProduct({ id: product._id });
  };


  const transformedData: Product[] = (data?.allProducts?.data || []).map(
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
      render: (value) => `${value}%`,
    },
    {
      header: "Service Tax",
      key: "serviceTax",
      render: (value) => `${value}%`,
    },
    {
      header: "VAT",
      key: "adVAT",
      render: (value) => `${value}%`,
    },
    {
      header: "Measurement Unit",
      key: "measurementUnit",
      render: (_, item) => item.measurementUnit?.unitNameEn || "N/A",
    },
    {
      header: "Arabic Note",
      key: "noteAr",
      render: (value) => `${value}` || "N/A",
    },
    {
      header: "English Note",
      key: "noteEn",
      render: (value) => `${value}` || "N/A",
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
      label: "Restore",
      onClick: handleRestore,
      className: "text-blue-500",
      icon: <ArchiveRestore className="w-4 h-4" />,
    },
  ];

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };



  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="mb-4 bg-red-950 text-white">
            <Trash className="w-4 h-4 mr-2" />
            Deleted Products
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Deleted Products</DialogTitle>
          </DialogHeader>
          <GenericTable
        data={transformedData}
        columns={columns}
        actions={actions}
        subtitle={`Total Products: ${
            data?.allProducts?.totalSize || transformedData.length
          }`}
        isLoading={loading}
        error={error || null}
      />
      {!loading && !error && (
        <Pagination
          currentPage={data?.allProducts?.pageNumber}
          totalPages={data?.allProducts?.totalPages || 1}
          totalItems={data?.allProducts?.totalSize || 0}
          pageSize={data?.allProducts?.pageSize}
          onPageChange={handlePageChange}
        />
      )}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                className="bg-red-950 text-white"
                onClick={() => setOpen(false)}
              >
                Done
              </Button>
            </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ArchiveProductModal;
