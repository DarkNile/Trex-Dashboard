"use client";
import { useGenericQuery } from "@/hooks/generic/useGenericQuery";
import { useMutation } from "@apollo/client";
import React, { JSX, useState } from "react";
import { Check, Trash2 } from "lucide-react";
import GenericTable from "@/components/UI/Table/GenericTable";
import Pagination from "@/components/UI/pagination/Pagination";
import { gql } from "@apollo/client/core";
import toast from "react-hot-toast";

type Action<T> = {
  label: string;
  onClick: (item: T) => void;
  icon?: JSX.Element;
  className?: string;
};

const GET_REGISTRATIONS = gql`
  query GetAllPartnerRequests($page: Int!) {
    getAllPartnerRequests(
      pageable: { page: $page }
      filter: { deleted: false }
    ) {
      totalSize
      totalPages
      pageSize
      pageNumber
      data {
        id: _id
        firstName
        lastName
        email
        companyName
        phone
        type
        isApproved
      }
    }
  }
`;

const APPROVE_REGISTRATION = gql`
  mutation ApproveRegistration($id: ID!) {
    approveRegistration(id: $id)
  }
`;

const DELETE_REGISTRATION = gql`
  mutation SoftDeletePartner($id: ID!) {
    softDeletePartner(id: $id) {
      _id
    }
  }
`;

type Address = {
  address: string;
  zipCode: string;
};

type AddressResponse = {
  data?: Address[];
};

type Registration = {
  id: string;
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  companyName: string;
  phone: string;
  type: string;
  trcSerial: string;
  trcIssuedAt: string;
  trcExpiresAt: string;
  crcSerial: string;
  crcIssuedAt: string;
  crcExpiresAt: string;
  isApproved: boolean;
  address?: AddressResponse;
};

type RegistrationsResponse = {
  getAllPartnerRequests: {
    totalSize: number;
    totalPages: number;
    pageSize: number;
    pageNumber: number;
    data: Registration[];
  };
};

const formatType = (type: string) => {
  return type
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
};

const Page = () => {
  const [currentPage, setCurrentPage] = useState(0);

  const { data, loading, error, refetch } =
    useGenericQuery<RegistrationsResponse>({
      query: GET_REGISTRATIONS,
      variables: {
        page: currentPage,
      },
      onError: (error) => {
        console.log("Error details:", {
          message: error.message,
          stack: error.stack,
          graphQLErrors: error,
        });
      },
    });

  const [approveRegistration] = useMutation(APPROVE_REGISTRATION, {
    onCompleted: () => {
      refetch();
    },
  });

  const [deleteRegistration] = useMutation(DELETE_REGISTRATION, {
    onCompleted: () => {
      refetch();
    },
  });

  const handleApprove = async (registration: Registration) => {
    try {
      await approveRegistration({
        variables: { id: registration.id },
      });
    } catch (error) {
      console.log("Error approving registration:", error);
      toast.error(`${(error as Error).message}`, {
        duration: 5000,
        icon: "❌",
      });
    }
  };

  const handleDelete = async (registration: Registration) => {
    if (window.confirm("Are you sure you want to delete this registration?")) {
      try {
        await deleteRegistration({
          variables: { id: registration.id },
        });
      } catch (error) {
        console.log("Error deleting registration:", error);
        toast.error(`Error creating product: ${error}`, {
          duration: 5000,
          icon: "❌",
        });
      }
    }
  };

  const columns: {
    header: string;
    key: keyof Registration;
    render?: (value: unknown, item: Registration) => JSX.Element;
  }[] = [
    {
      header: "Name",
      key: "firstName",
      render: (_, item: Registration) => (
        <span>{`${item.firstName} ${item.lastName}`}</span>
      ),
    },
    {
      header: "Type",
      key: "type",
      render: (value: unknown) => (
        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
          {formatType(value as string)}
        </span>
      ),
    },
    { header: "Phone", key: "phone" },
    { header: "Company", key: "companyName" },
    { header: "Email", key: "email" },
    {
      header: "Status",
      key: "isApproved",
      render: (value: unknown) => (
        <span
          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
            value
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {value ? "Approved" : "Pending"}
        </span>
      ),
    },
  ];

  const actions: Action<Registration>[] = [
    {
      label: "Approve",
      onClick: handleApprove,
      icon: <Check className="w-4 h-4" />,
      className: "text-green-600 hover:text-green-800",
    },
    {
      label: "Delete",
      onClick: handleDelete,
      icon: <Trash2 className="w-4 h-4" />,
      className: "text-red-600 hover:text-red-800",
    },
  ];

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const registrations = data?.getAllPartnerRequests;
  console.log("registrations", registrations);

  return (
    <div className="">
      <GenericTable
        data={registrations?.data || []}
        columns={columns}
        actions={actions}
        title="Partner Registration"
        subtitle={`Total Partners: ${registrations?.totalSize || 0}`}
        isLoading={loading}
        error={error}
      />
      {!loading && !error && registrations && (
        <Pagination
          currentPage={registrations.pageNumber}
          totalPages={registrations.totalPages}
          totalItems={registrations.totalSize}
          pageSize={registrations.pageSize}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default Page;
