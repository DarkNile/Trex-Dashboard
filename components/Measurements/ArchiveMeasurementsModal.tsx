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

const GET_MEASUREMENTS = gql`
  query GetMeasurements($page: Int!) {
    measurements(filter: { deleted: true }, pageable: { page: $page }) {
      totalSize
      totalPages
      pageSize
      pageNumber
      data {
        _id
        unitNameEn
        unitNameAr
        note
        createdAt
        updatedAt
        createdBy {
          firstName
          lastName
          email
        }
        updatedBy {
          firstName
          lastName
          email
        }
      }
    }
  }
`;


const DELETE_MEASUREMENT = gql`
  mutation HardDeleteMeasurment($id: ID!) {
    hardDeleteMeasurment(id: $id)
}
`;


const RESTORE_MEASUREMENT = gql`
  mutation RestoreMeasurment($id: ID!) {
    restoreMeasurment(id: $id) {
        _id
        unitNameAr
        unitNameEn
        note
        deletedAt
        createdAt
        updatedAt
        createdBy {
            _id
            firstName
            lastName
            email
        }
        deletedBy {
            _id
            firstName
            lastName
            email
        }
        updatedBy {
            _id
            firstName
            lastName
            email
        }
    }
}
`;

type User = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
};

type MeasurementFromAPI = {
  _id: string;
  unitNameEn: string;
  unitNameAr: string;
  note: string;
  createdAt: string;
  updatedAt: string;
  createdBy: User;
  updatedBy: User;
  deletedBy?: User;
  deletedAt?: string;
};

// Extend the API type to include the required 'id' field for GenericTable
type Measurement = MeasurementFromAPI & { id: string };

const ArchiveMeasurementsModal = () => {
  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;
const [selectedMeasurement, setSelectedMeasurement] =
    useState<Measurement | null>(null);
  const [editingPorts, setEditingPorts] = useState<Record<string, boolean>>({});

  const { data, loading, error, refetch } = useGenericQuery({
      query: GET_MEASUREMENTS,
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
  
    const { execute: deleteMeasurement } = useGenericMutation({
      mutation: DELETE_MEASUREMENT,
      onSuccess: () => {
        refetch();
      },
      onError: (error) => {
        console.log("Error deleting measurement:", error);
      },
    });
  
    const handleDelete = (measurement: Measurement) => {
      deleteMeasurement({ id: measurement._id });
    };
  

  const { execute: restoreMeasurement } = useGenericMutation({
    mutation: RESTORE_MEASUREMENT,
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      console.log("Error restoring Measurement:", error);
    },
  });

  const handleRestore = (measurement: Measurement) => {
    restoreMeasurement({ id: measurement._id });
  };

  const transformedData: Measurement[] = (data?.measurements?.data || []).map(
      (item: MeasurementFromAPI) => ({
        ...item,
        id: item._id,
      })
    );
  
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };
  
    const formatUser = (user?: User) => {
      if (!user) return "N/A";
      return `${user.firstName} ${user.lastName}`;
    };
  
    const columns: {
      header: string;
      key: keyof Measurement;
      render?: (value: unknown, item: Measurement) => React.ReactNode;
    }[] = [
      {
        header: "Unit Name (Arabic)",
        key: "unitNameAr",
      },
      {
        header: "Unit Name (English)",
        key: "unitNameEn",
      },
      {
        header: "Created By",
        key: "createdBy",
        render: (_, item) => formatUser(item.createdBy),
      },
      {
        header: "Created At",
        key: "createdAt",
        render: (value) => formatDate(value as string),
      },
      {
        header: "Updated By",
        key: "updatedBy",
        render: (_, item) => formatUser(item.updatedBy),
      },
      {
        header: "Updated At",
        key: "updatedAt",
        render: (value) => formatDate(value as string),
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
          <Button className="mb-4 bg-red-950">
            <Trash className="w-4 h-4 mr-2" />
            Deleted Measurements
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Deleted Measurements</DialogTitle>
          </DialogHeader>

          <GenericTable
        data={transformedData}
        columns={columns}
        actions={actions}
        subtitle={`Total Measurement Units: ${
          data?.measurements?.totalSize || transformedData.length
        }`}
        isLoading={loading}
        error={error || null}
      />
      {!loading && !error && (
        <Pagination
          currentPage={data?.measurements?.pageNumber}
          totalPages={data?.measurements?.totalPages || 1}
          totalItems={data?.measurements?.totalSize || 0}
          pageSize={data?.measurements?.pageSize}
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

export default ArchiveMeasurementsModal;
