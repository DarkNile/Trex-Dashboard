"use client";
import React from "react";
import CreateProductModal from "@/components/product/CreateProductModal";
import ArchiveProductModal from "@/components/product/ArchiveProductModal";
import UpdateProductModal from "@/components/product/UpdateProductModal";

interface ProductHeaderProps {
  refetch: () => void;
  selectedProductId: string | null;
  open: boolean;
  selectedProductData: any;
  setOpen: (open: boolean) => void;
  setSelectedProductId: (id: string | null) => void;
}

const ProductHeader: React.FC<ProductHeaderProps> = ({
  refetch,
  selectedProductId,
  open,
  selectedProductData,
  setOpen,
  setSelectedProductId,
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center md:items-start px-8 pt-8 mt-5">
      <h1 className="text-3xl md:text-4xl font-bold text-foreground">
        Products
      </h1>
      <div className="flex flex-row gap-2 md:gap-0 md:flex-col items-center mt-5 md:mt-0">
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
  );
};

export default ProductHeader;