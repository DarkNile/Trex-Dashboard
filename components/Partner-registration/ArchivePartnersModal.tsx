import React, { JSX, useState } from "react";
import { ArchiveRestore, Pen, Trash } from "lucide-react";
import { gql, useMutation } from "@apollo/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../UI/dialog";
import { Button } from "../UI/button";
import { useGenericQuery } from "@/hooks/generic/useGenericQuery";
import { useGenericMutation } from "@/hooks/generic/useGenericMutation";
import GenericTable from "../UI/Table/GenericTable";
import Pagination from "../UI/pagination/Pagination";
import toast from "react-hot-toast";

const GET_REGISTRATIONS = gql`
  query GetAllPartnerRequests($page: Int!) {
    getAllPartnerRequests(
      pageable: { page: $page }
      filter: { deleted: true }
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

const DELETE_PARTNERS = gql`
  mutation HardDeletePartner($id: ID!) {
  hardDeletePartner(id: $id)
}
`;


const RESTORE_PARTNERS = gql`
  mutation RestorePartner($id: ID!) {
    restorePartner(id: $id) {
        _id
        firstName
        lastName
        email
        companyName
        zipCode
        country
        address
        phone
        type
        accountActivated
        deletedAt
        enabledAt
        lockedAt
        isDeleted
        createdAt
        updatedAt
        trcSerial
        trcIssuedAt
        trcExpiresAt
        trcFile
        crcSerial
        crcIssuedAt
        crcExpiresAt
        crcFile
        cccSerial
        cccIssuedAt
        cccExpiresAt
        cccFile
        bplSerial
        bplIssuedAt
        bplExpiresAt
        bplFile
        isApproved
        approvedAt
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

const ArchivePartnersModal = () => {
  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  const { data, loading, error, refetch } =
    useGenericQuery<RegistrationsResponse>({
      query: GET_REGISTRATIONS,
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


  const [deletePartners] = useMutation(DELETE_PARTNERS, {
      onCompleted: () => {
        refetch();
      },
    });


    const handleDelete = async (registration: Registration) => {
      if (window.confirm("Are you sure you want to delete this registration?")) {
        try {
          await deletePartners({
            variables: { id: registration.id },
          });
        } catch (error) {
          console.log("Error deleting registration:", error);
          toast.error(`Error deleting product: ${error}`, {
            duration: 5000,
            icon: "❌",
          });
        }
      }
    };


    const [restorePartners] = useMutation(RESTORE_PARTNERS, {
      onCompleted: () => {
        refetch();
      },
    });


    const handleRestore = async (registration: Registration) => {
      if (window.confirm("Are you sure you want to restore this registration?")) {
        try {
          await restorePartners({
            variables: { id: registration.id },
          });
        } catch (error) {
          console.log("Error restoring registration:", error);
          toast.error(`Error restoring product: ${error}`, {
            duration: 5000,
            icon: "❌",
          });
        }
      }
    };

  const transformedData: Registration[] = (
    data?.getAllPartnerRequests?.data || []
  ).map((item: Registration) => ({
    ...item,
    id: item._id,
  }));

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

  const registrations = data?.getAllPartnerRequests;

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="mb-4 bg-red-950">
            <Trash className="w-4 h-4 mr-2" />
            Deleted Partners
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Deleted Partners</DialogTitle>
          </DialogHeader>

          <GenericTable
            data={registrations?.data || []}
            columns={columns}
            actions={actions}
            // title="Partner Registration"
            subtitle={`Total Partners: ${
              data?.getAllPartnerRequests?.totalSize || transformedData.length
            }`}
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

export default ArchivePartnersModal;