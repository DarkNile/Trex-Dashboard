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
const GET_MEASUREMENTS = gql`
  query GetMeasurements($page: Int!) {
    measurements(filter: { deleted: false }, pageable: { page: $page }) {
      totalSize
      totalPages
      pageSize
      pageNumber
      data {
        _id
        unitName
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

type User = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
};

type MeasurementFromAPI = {
  _id: string;
  unitName: string;
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
      refetch();
    },
    onError: (error) => {
      console.log("Error deleting measurement:", error);
    },
  });

  const handleDelete = (measurement: Measurement) => {
    deleteMeasurement({ id: measurement._id });
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
      header: "Unit Name",
      key: "unitName",
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
      onClick: () => {
        console.log("Remove Subchapter");
      },
      icon: <Trash2 className="w-4 h-4" />,
      className: "text-red-500",
    },
  ];

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="">
      {" "}
      <div className="flex justify-between items-center mb-3 px-8 pt-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Measurement Units
        </h1>
        <CreateMeasurementModal onSuccess={refetch} />

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
