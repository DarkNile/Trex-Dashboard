import React, { JSX, useState } from "react";
import { ArchiveRestore, Pen, Trash } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../UI/dialog";
import { Button } from "../UI/button";

import { useGenericQuery } from "@/hooks/generic/useGenericQuery";
import { gql } from "@apollo/client";
import GenericTable from "@/components/UI/Table/GenericTable";
import Pagination from "@/components/UI/pagination/Pagination";
import { useGenericMutation } from "@/hooks/generic/useGenericMutation";
import toast from "react-hot-toast";
import { ShippingPort, ShippingPortFromAPI } from "@/types/shipping";

const GET_SHIPPING_PORTS = gql`
  query GetShippingPorts($page: Int!) {
    getShippingPortList(
      pageable: { page: $page }
      extraFilter: { deleted: true }
    ) {
      totalSize
      totalPages
      pageSize
      pageNumber
      data {
        _id
        nameEn
        nameAr
        port
        createdBy {
          _id
          firstName
          lastName
          email
        }
      }
    }
  }
`;

const DELETE_SHIPPING_PORT = gql`
  mutation HardDeleteShippingPort($id: ID!) {
    hardDeleteShippingPort(id: $id) {
      _id
      nameEn
      nameAr
      port
    }
  }
`;


const RESTORE_SHIPPING_PORT = gql`
  mutation RestoreShippingPort($id: ID!) {
    restoreShippingPort(id: $id) {
      _id
      nameEn
      nameAr
      port
    }
  }
`;

const ArchiveShippingPortModal = () => {
  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  // Keep track of which ports are being edited
  const [editingPorts, setEditingPorts] = useState<Record<string, boolean>>({});

  const { data, loading, error, refetch } = useGenericQuery({
      query: GET_SHIPPING_PORTS,
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

  const { execute: deleteShippingPort } = useGenericMutation({
    mutation: DELETE_SHIPPING_PORT,
    onSuccess: () => {
      refetch();
      toast.success("Shipping port deleted successfully");
    },
    onError: (error) => {
      console.log("Error deleting shipping port:", error);
      toast.error("Error deleting shipping port");
    },
  });

  const handleDelete = (port: ShippingPort) => {
    deleteShippingPort({ id: port._id });
  };

  const { execute: restoreShippingPort } = useGenericMutation({
    mutation: RESTORE_SHIPPING_PORT,
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      console.log("Error restoring Agreement:", error);
    },
  });

  const handleRestore = (port: ShippingPort) => {
    restoreShippingPort({ id: port._id });
  };

  const transformedData: ShippingPort[] = (
      data?.getShippingPortList?.data || []
    ).map((item: ShippingPortFromAPI) => ({
      ...item,
      id: item._id,
    }));

  const columns = [
    {
      header: "Arabic Name",
      key: "nameAr" as keyof ShippingPort,
      render: (value: unknown) => (
        <span className="font-arabic">{`${value}`}</span>
      ),
    },
    {
      header: "English Name",
      key: "nameEn" as keyof ShippingPort,
    },
    {
      header: "Port",
      key: "port" as keyof ShippingPort,
    },
    {
      header: "Country",
      key: "countryId" as keyof ShippingPort,
      render: (_: unknown, item: ShippingPort) => (
        <span>{item.countryId?.nameEn || "N/A"}</span>
      ),
    },
    {
      header: "Created By",
      key: "createdBy" as keyof ShippingPort,
      render: (_: unknown, item: ShippingPort) => (
        <span>{`${item.createdBy?.firstName} ${item.createdBy?.lastName}`}</span>
      ),
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
    // Clear editing state when changing pages
    setEditingPorts({});
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="mb-4 bg-red-950 text-white hover:text-black">
            <Trash className="w-4 h-4 mr-2" />
            Deleted shippingPorts
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Deleted shippingPorts</DialogTitle>
          </DialogHeader>

          <GenericTable
        data={transformedData}
        columns={columns}
        actions={actions}
        subtitle={`Total Shipping Ports: ${
          data?.getShippingPortList?.totalSize || transformedData.length
        }`}
        isLoading={loading}
        error={error || null}
      />

{!loading && !error && data?.getShippingPortList?.totalPages && (
        <Pagination
          currentPage={currentPage}
          totalPages={data.getShippingPortList.totalPages || 1}
          totalItems={data.getShippingPortList.totalSize || 0}
          pageSize={data.getShippingPortList.pageSize || pageSize}
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

export default ArchiveShippingPortModal;
