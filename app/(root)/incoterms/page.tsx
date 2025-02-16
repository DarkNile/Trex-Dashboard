"use client";
import { useGenericQuery } from "@/hooks/generic/useGenericQuery";
import { gql } from "@apollo/client";
import React, { useState } from "react";
import { EyeIcon, Pen, TrashIcon } from "lucide-react";
import GenericTable from "@/components/UI/Table/GenericTable";
import Pagination from "@/components/UI/pagination/Pagination";
import { useGenericMutation } from "@/hooks/generic/useGenericMutation";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import CreateIncotermModal from "@/components/incoterms/CreateIncotermsModal";
import UpdateIncotermModal from "@/components/incoterms/UpdateIncoTermsModal";

const GET_INCOTERMS = gql`
  query AllIncoterms($page: Int!) {
    allIncoterms(filter: { deleted: false }, pageable: { page: $page }) {
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
  mutation SoftDeleteIncoterm($id: ID!) {
    softDeleteIncoterm(id: $id) {
      _id
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

const Page = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [selectedIncoterm, setSelectedIncoterm] = useState<Incoterm | null>(
    null
  );
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const router = useRouter();

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

  const handleEdit = (incoterm: Incoterm) => {
    setSelectedIncoterm(incoterm);
    setOpenUpdateModal(true);
  };

  // Transform the API data to include flattened properties
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
      icon: <TrashIcon className="w-4 h-4" />,
      className: "text-red-500",
    },
    {
      label: "Edit",
      onClick: handleEdit,
      icon: <Pen className="w-4 h-4" />,
      className: "text-blue-500",
    },
    {
      label: "View Details",
      onClick: (item: Incoterm) => {
        router.push(`incoterms/${item.id}`);
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
      <div className="flex justify-between items-center mb-3 px-8 pt-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Incoterms
        </h1>

        <CreateIncotermModal onSuccess={refetch} />
      </div>

      <UpdateIncotermModal
        open={openUpdateModal}
        onOpenChange={setOpenUpdateModal}
        incotermData={selectedIncoterm ?? undefined}
        onSuccess={refetch}
      />

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
    </div>
  );
};

export default Page;
