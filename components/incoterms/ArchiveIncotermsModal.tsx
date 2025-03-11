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

const GET_INCOTERMS = gql`
  query AllIncoterms($page: Int!) {
    allIncoterms(filter: { deleted: true }, pageable: { page: $page }) {
      totalSize
      totalPages
      pageSize
      pageNumber
      data {
        _id
        name
        code
        createdAt
        updatedAt
        insurance
        internalUnloading
        externalUnloading
        internalFreight
        externalFreight
        updatedBy {
          _id
          firstName
          lastName
          email
        }
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

const DELETE_INCOTERM = gql`
  mutation HardDeleteIncoterm($id: ID!) {
    hardDeleteIncoterm(id: $id)
}
`;

const RESTORE_INCOTERM = gql`
  mutation RestoreIncoterm($id: ID!) {
    restoreIncoterm(id: $id) {
        _id
        name
        code
        createdAt
        updatedAt
        deletedAt
        isDeleted
        insurance
        internalUnloading
        externalUnloading
        internalFreight
        externalFreight
    }
}
`;


type IncotermFromAPI = {
  _id: string;
  name: string;
  code: string;
  createdAt: string;
  updatedAt: string;
  insurance: boolean;
  internalUnloading: boolean;
  externalUnloading: boolean;
  internalFreight: boolean;
  externalFreight: boolean;
  updatedBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
};

// Extended type to include the required 'id' field and flattened properties
type Incoterm = IncotermFromAPI & {
  id: string;
  createdByName: string;
  updatedByName: string;
};



const ArchiveIncotermsModal = () => {
  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;
  const [selectedIncoterm, setSelectedIncoterm] = useState<Incoterm | null>(
    null
  );
  // Keep track of which ports are being edited
  const [editingPorts, setEditingPorts] = useState<Record<string, boolean>>({});

  const { data, loading, error, refetch } = useGenericQuery({
    query: GET_INCOTERMS,
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

  const { execute: deleteIncoterm } = useGenericMutation({
    mutation: DELETE_INCOTERM,
    onSuccess: () => {
      refetch();
      toast.success("Incoterm deleted successfully");
    },
    onError: (error) => {
      console.log("Error deleting incoterm:", error);
      toast.error("Error deleting incoterm");
    },
  });

  const handleDelete = (incoterm: Incoterm) => {
    deleteIncoterm({ id: incoterm._id });
  };

  const { execute: restoreIncoterm } = useGenericMutation({
    mutation: RESTORE_INCOTERM,
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      console.log("Error restoring Agreement:", error);
      toast.error("Error restoring incoterm");
    },
  });

  const handleRestore = (incoterm: Incoterm) => {
    restoreIncoterm({ id: incoterm._id });
  };

   const transformedData: Incoterm[] = (data?.allIncoterms?.data || []).map(
      (item: IncotermFromAPI) => ({
        ...item,
        id: item._id,
        createdByName: item.createdBy
          ? `${item.createdBy.firstName} ${item.createdBy.lastName}`
          : "N/A",
        updatedByName: item.updatedBy
          ? `${item.updatedBy.firstName} ${item.updatedBy.lastName}`
          : "N/A",
      })
    );
  
    const renderBooleanValue = (value: boolean) => (
      <span className={value ? "text-green-600" : "text-red-600"}>
        {value ? "Yes" : "No"}
      </span>
    );
  
    const columns: {
      header: string;
      key: keyof Incoterm;
      render?: (value: unknown, item: Incoterm) => React.ReactNode;
    }[] = [
      {
        header: "Name",
        key: "name",
      },
      {
        header: "Code",
        key: "code",
      },
      {
        header: "Insurance",
        key: "insurance",
        render: (value) => renderBooleanValue(value as boolean),
      },
      {
        header: "Internal Unloading",
        key: "internalUnloading",
        render: (value) => renderBooleanValue(value as boolean),
      },
      {
        header: "External Unloading",
        key: "externalUnloading",
        render: (value) => renderBooleanValue(value as boolean),
      },
      {
        header: "Internal Freight",
        key: "internalFreight",
        render: (value) => renderBooleanValue(value as boolean),
      },
      {
        header: "External Freight",
        key: "externalFreight",
        render: (value) => renderBooleanValue(value as boolean),
      },
      {
        header: "Created By",
        key: "createdByName",
      },
      {
        header: "Updated By",
        key: "updatedByName",
      },
      {
        header: "Created At",
        key: "createdAt",
        render: (value) => new Date(value as string).toLocaleDateString(),
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
            Deleted Incoterms
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Deleted Incoterms</DialogTitle>
          </DialogHeader>

          <GenericTable
        data={transformedData}
        columns={columns}
        actions={actions}
        subtitle={`Total Incoterms: ${
          data?.allIncoterms?.totalSize || transformedData.length
        }`}
        isLoading={loading}
        error={error ?? null}
      />
      {!loading && !error && data?.allIncoterms?.totalPages && (
        <Pagination
          currentPage={currentPage}
          totalPages={data.allIncoterms.totalPages || 1}
          totalItems={data.allIncoterms.totalSize || 0}
          pageSize={data.allIncoterms.pageSize || pageSize}
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

export default ArchiveIncotermsModal;
