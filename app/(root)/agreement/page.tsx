"use client";
import { useGenericQuery } from "@/hooks/generic/useGenericQuery";
import { gql } from "@apollo/client";
import React, { useState } from "react";
import { Pen, Trash } from "lucide-react";
import GenericTable from "@/components/UI/Table/GenericTable";
import Pagination from "@/components/UI/pagination/Pagination";
import { useGenericMutation } from "@/hooks/generic/useGenericMutation";
import CreateAgreementModal from "@/components/Agreements/CreateAgreementModal";
import toast, { Toaster } from "react-hot-toast";
import UpdateAgreementModal from "@/components/Agreements/UpdateAgreementModal";

const GET_AGREEMENTS = gql`
  query GetAgreements($page: Int!) {
    AgreementList(pageable: { page: $page }, filter: { deleted: false }) {
      data {
        _id
        name
        note
        createdAt
        updatedAt
        countryIds {
          _id
          nameEn
          nameAr
          code
        }
        createdBy {
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
      totalSize
      totalPages
      pageNumber
      pageSize
    }
  }
`;

const DELETE_AGREEMENT = gql`
  mutation DeleteAgreement($id: String!) {
    deleteAgreement(id: $id) {
      _id
      name
      note
      deletedAt
      createdAt
      updatedAt
    }
  }
`;

type User = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
};

type Country = {
  _id: string;
  nameEn: string;
  nameAr: string;
  code: string;
};

type AgreementFromAPI = {
  _id: string;
  name: string;
  note: string;
  countryIds: Country[];
  createdAt: string;
  updatedAt: string;
  createdBy: User;
  updatedBy: User;
  deletedBy?: User;
  deletedAt?: string;
};

type Agreement = AgreementFromAPI & { id: string };

const Page = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;
  const [selectedAgreement, setSelectedAgreement] = useState<Agreement | null>(
    null
  );

  const { data, loading, error, refetch } = useGenericQuery({
    query: GET_AGREEMENTS,
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

  const { execute: deleteAgreement } = useGenericMutation({
    mutation: DELETE_AGREEMENT,
    onSuccess: () => {
      toast.success("Agreement deleted successfully! ✅");
      refetch();
    },
    onError: (error) => {
      toast.error(`Error deleting agreement: ${error.message}`, {
        duration: 5000,
      });
    },
  });

  const handleDelete = (agreement: Agreement) => {
    deleteAgreement({ id: agreement._id });
  };

  const handleUpdate = (agreement: Agreement) => {
    setSelectedAgreement(agreement);
  };

  const handleUpdateModalClose = () => {
    setSelectedAgreement(null);
  };

  const transformedData: Agreement[] = (data?.AgreementList?.data || []).map(
    (item: AgreementFromAPI) => ({
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

  const columns = [
    {
      header: "Agreement Name",
      key: "name" as keyof Agreement,
    },
    {
      header: "Countries",
      key: "countryIds" as keyof Agreement,
      render: (_: unknown, item: Agreement) => (
        <div>
          {item.countryIds.map((country) => (
            <div key={country._id} className="text-sm">
              {country.nameEn}
            </div>
          ))}
        </div>
      ),
    },
    {
      header: "Note",
      key: "note" as keyof Agreement,
      render: (value: unknown) => `${value}` || "N/A",
    },
    {
      header: "Created By",
      key: "createdBy" as keyof Agreement,
      render: (_: unknown, item: Agreement) => (
        <div>
          <div>{formatUser(item.createdBy)}</div>
          <div className="text-xs text-gray-400">
            {formatDate(item.createdAt)}
          </div>
        </div>
      ),
    },
    {
      header: "Updated By",
      key: "updatedBy" as keyof Agreement,
      render: (_: unknown, item: Agreement) => (
        <div>
          <div>{formatUser(item.updatedBy)}</div>
          <div className="text-xs text-gray-400">
            {formatDate(item.updatedAt)}
          </div>
        </div>
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
      label: "Edit",
      onClick: handleUpdate,
      icon: <Pen className="w-4 h-4" />,
      className: "text-blue-500",
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-3 px-8 pt-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Trade Agreements
        </h1>
        <CreateAgreementModal onSuccess={refetch} />
      </div>

      {selectedAgreement && (
        <UpdateAgreementModal
          agreementId={selectedAgreement._id}
          initialData={{
            name: selectedAgreement.name,
            countryIds: selectedAgreement.countryIds
              .map((c) => c._id)
              .join(","),
            note: selectedAgreement.note,
          }}
          onSuccess={refetch}
          onClose={handleUpdateModalClose}
        />
      )}

      <GenericTable
        data={transformedData}
        columns={columns}
        actions={actions}
        subtitle={`Total Agreements: ${data?.AgreementList?.totalSize || 0}`}
        isLoading={loading}
        error={error || null}
      />
      {!loading && !error && (
        <Pagination
          currentPage={data?.AgreementList?.pageNumber}
          totalPages={data?.AgreementList?.totalPages || 1}
          totalItems={data?.AgreementList?.totalSize || 0}
          pageSize={data?.AgreementList?.pageSize}
          onPageChange={(page) => setCurrentPage(page)}
        />
      )}
      <Toaster />
    </div>
  );
};

export default Page;
