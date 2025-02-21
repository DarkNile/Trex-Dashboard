"use client";
import { useGenericQuery } from "@/hooks/generic/useGenericQuery";
import { gql } from "@apollo/client";
import React, { useEffect, useState } from "react";
import { EyeIcon, Pen, Trash } from "lucide-react";
import GenericTable from "@/components/UI/Table/GenericTable";
import Pagination from "@/components/UI/pagination/Pagination";
import { useGenericMutation } from "@/hooks/generic/useGenericMutation";
import CreateProductModal from "@/components/product/CreateProductModal";
import UpdateProductModal from "@/components/product/UpdateProductModal";
import ArchiveProductModal from "@/components/product/ArchiveProductModal";
import { useRouter } from "next/navigation";

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
        note
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

  useEffect(() => {
    if (data?.allProducts?.data) {
      console.log("All Products:", data.allProducts.data);
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
      defaultDutyRate: product.defaultDutyRate,
      agreements: [],
      serviceTax: product.serviceTax,
      adVAT: product.adVAT,
      subChapterId: product.subChapterId._id,
      type: "regural",
    });
    setOpen(true);
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
    </div>
  );
};
export default Page;
