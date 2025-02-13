"use client";
import { useGenericQuery } from "@/hooks/generic/useGenericQuery";
import { gql } from "@apollo/client";
import React, { useState } from "react";
import { Pen, Trash } from "lucide-react";
import GenericTable from "@/components/UI/Table/GenericTable";
import Pagination from "@/components/UI/pagination/Pagination";
import { useGenericMutation } from "@/hooks/generic/useGenericMutation";
import CreateProductModal from "@/components/product/CreateProductModal";
import UpdateProductModal from "@/components/product/UpdateProductModal";

const GET_PRODUCTS = gql`
  query GetProducts($page: Int!) {
    allProducts(pageable: { page: $page }) {
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
        measurementUnit {
          _id
          unitName
          note
        }
        subChapterId {
          _id
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
  adVAT: boolean;
  subChapterId: {
    _id: string;
  };
  measurementUnit: {
    _id: string;
    unitName: string;
    note: string;
  };
};

// Extend the API type to include the required 'id' field for GenericTable
type Product = ProductFromAPI & { id: string };

const Page = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  );
  const [selectedProductData, setSelectedProductData] = useState<{
    HSCode: string;
    nameEn: string;
    nameAr: string;
    defaultDutyRate: number;
    agreementId: string;
    serviceTax: boolean;
    adVAT: boolean;
    subChapterId: string;
  }>({
    HSCode: "",
    nameEn: "",
    nameAr: "",
    defaultDutyRate: 0,
    agreementId: "",
    serviceTax: false,
    adVAT: false,
    subChapterId: "",
  });
  const [open, setOpen] = useState(false);

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

  const handleUpdate = (product: Product) => {
    setSelectedProductId(product._id);
    setSelectedProductData({
      HSCode: product.HSCode,
      nameEn: product.nameEn,
      nameAr: product.nameAr,
      defaultDutyRate: product.defaultDutyRate,
      agreementId: "", // You might need to adjust this based on your data structure
      serviceTax: product.serviceTax,
      adVAT: product.adVAT,
      subChapterId: product.subChapterId._id,
    });
    setOpen(true);
  };

  // Transform the API data to include the required 'id' field
  const transformedData: Product[] = (data?.allProducts?.data || []).map(
    (item: ProductFromAPI) => ({
      ...item,
      id: item._id, // Add the required 'id' field
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
      render: (_, item) => item.measurementUnit?.unitName || "N/A",
    },
    {
      header: "Note",
      key: "note",
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
      label: "Edit",
      onClick: handleUpdate,
      className: "text-blue-500",
      icon: <Pen className="w-4 h-4" />,
    },
  ];

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="">
      <div className="flex justify-between items-center mb-3 px-8 pt-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Products
        </h1>
        <CreateProductModal onSuccess={refetch} />

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
      <GenericTable
        data={transformedData}
        columns={columns}
        actions={actions}
        subtitle={`Total Products: ${data?.allProducts?.totalSize || 0}`}
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
    </div>
  );
};
export default Page;
