"use client";
import { useGenericQuery } from "@/hooks/generic/useGenericQuery";
import { gql } from "@apollo/client";
import React, { useState } from "react";
import { Pen, PlusSquareIcon, Trash2 } from "lucide-react";
import GenericTable from "@/components/UI/Table/GenericTable";
import Pagination from "@/components/UI/pagination/Pagination";
import { useGenericMutation } from "@/hooks/generic/useGenericMutation";
import CreateMeasurementModal from "@/components/Measurements/CreateMeasurementModal";
import UpdateMeasurementModal from "@/components/Measurements/UpdateMeasurementModal";
import AddUnitsToMeasurement from "@/components/Measurements/AddUnitsToMeasurement";
import ArchiveMeasurementsModal from "@/components/Measurements/ArchiveMeasurementsModal";
import RemoveUnitsFromMeasurement from "@/components/Measurements/RemoveUnits";
import { toast } from "react-hot-toast";

const GET_MEASUREMENTS = gql`
  query GetMeasurements($page: Int!) {
    measurements(filter: { deleted: false }, pageable: { page: $page }) {
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
  mutation SoftDeleteMeasurment($id: ID!) {
    softDeleteMeasurment(id: $id) {
      _id
    }
  }
`;

const DELETE_UNITS = gql`
  mutation RemoveUnitsFromMeasurement(
    $updateMeasurementInput: addChapterOrSubChapterOrItemsToMeasurementInput!
  ) {
    removeUnitsFromMeasurement(updateMeasurementInput: $updateMeasurementInput)
  }
`;

//67a7a531bda4138d28f958f1
//67a7a5ca69e039a908dedcb7
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

const Page = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isRemoveUnitsModalOpen, setIsRemoveUnitsModalOpen] = useState(false);
  const [selectedMeasurement, setSelectedMeasurement] =
    useState<Measurement | null>(null);

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
      toast.success("Measurement deleted successfully!");
      refetch();
    },
    onError: (error) => {
      console.log("Error deleting measurement:", error);
    },
  });

  const handleDelete = (measurement: Measurement) => {
    deleteMeasurement({ id: measurement._id });
  };

  const { execute: deleteUnits } = useGenericMutation({
    mutation: DELETE_UNITS,
    onSuccess: () => {
      toast.success("Measurement unit deleted successfully!");
      refetch();
    },
    onError: (error) => {
      console.log("Error removing units from measurement:", error);
      toast.error(`Error removing units from measurement: ${error.message}`);
    },
  });

  const handleDeleteUnits = (measurement: Measurement) => {
    const subChapterId = prompt(
      "Enter the ID of the subunit you want to delete:"
    );

    if (subChapterId) {
      deleteUnits({
        updateMeasurementInput: {
          id: measurement._id,
          subChapterIds: subChapterId,
        },
      });
    }
  };

  const handleUpdate = (measurement: Measurement) => {
    setSelectedMeasurement(measurement);
    setIsModalOpen(true);
    setIsUpdateModalOpen(false);
    console.log("Update measurement:", measurement);
  };

  const handleAddUnits = (measurement: Measurement) => {
    setSelectedMeasurement(measurement);
    setIsUpdateModalOpen(true);
    setIsModalOpen(false);
    console.log("Add units to measurement:", measurement);
  };

  // Transform the API data to include the required 'id' field
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
      icon: <Trash2 className="w-4 h-4" />,
      className: "text-red-500",
    },
    {
      label: "Edit Name",
      onClick: handleUpdate,
      className: "text-blue-500",
      icon: <Pen className="w-4 h-4" />,
    },
    {
      label: "Add Units",
      onClick: handleAddUnits,
      icon: <PlusSquareIcon className="w-4 h-4" />,
      className: "text-green-500",
    },
    {
      label: "Remove Units",
      onClick: handleDeleteUnits,
      icon: <Trash2 className="w-4 h-4" />,
      className: "text-red-500",
    },
  ];

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="">
      <div className="flex flex-col md:flex-row justify-between items-center md:items-start px-8 pt-8 mt-5">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground text-center">
          Measurement Units
        </h1>
        <div className="flex flex-col sm:flex-row sm:gap-3 md:gap-0 md:flex-col items-center mt-5 md:mt-0">
          <CreateMeasurementModal onSuccess={refetch} />
          <ArchiveMeasurementsModal />
        </div>
        {isRemoveUnitsModalOpen && selectedMeasurement && (
          <RemoveUnitsFromMeasurement
            selectedMeasurement={selectedMeasurement}
            onSuccess={refetch}
            onClose={() => {
              setSelectedMeasurement(null);
              setIsRemoveUnitsModalOpen(false);
            }}
          />
        )}

        {selectedMeasurement && isModalOpen && (
          <UpdateMeasurementModal
            selectedMeasurement={selectedMeasurement}
            onSuccess={refetch}
            onClose={() => setSelectedMeasurement(null)}
          />
        )}

        {isUpdateModalOpen && selectedMeasurement && (
          <AddUnitsToMeasurement
            selectedMeasurement={selectedMeasurement}
            onSuccess={refetch}
            onClose={() => setSelectedMeasurement(null)}
          />
        )}
      </div>
      <GenericTable
        data={transformedData}
        columns={columns}
        actions={actions}
        subtitle={`Total Measurement Units: ${
          data?.measurements?.totalSize || 0
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
    </div>
  );
};

export default Page;
