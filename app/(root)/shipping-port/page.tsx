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

const GET_SHIPPING_PORTS = gql`
  query GetShippingPorts($page: Int!) {
    getShippingPortList(
      pageable: { page: $page }
      extraFilter: { deleted: false }
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
  mutation DeleteShippingPort($id: ID!) {
    deleteShippingPort(id: $id)
  }
`;

type ShippingPortFromAPI = {
  _id: string;
  nameAr: string;
  nameEn: string;
  port: string;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  countryId: {
    _id: string;
    nameEn: string;
    nameAr: string;
    code: string;
  };
};

// Extended type to include the required 'id' field for GenericTable
type ShippingPort = ShippingPortFromAPI & { id: string };

const Page = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [selectedPort, setSelectedPort] = useState<string | null>(null);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const router = useRouter();

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

  const handleEdit = (port: ShippingPort) => {
    setSelectedPort(port.id);
    setOpenUpdateModal(true);
  };

  // Transform the API data to include the required 'id' field
  const transformedData: ShippingPort[] = (
    data?.getShippingPortList?.data || []
  ).map((item: ShippingPortFromAPI) => ({
    ...item,
    id: item._id,
  }));

  const columns: {
    header: string;
    key: keyof ShippingPort;
    render?: (value: unknown, item: ShippingPort) => React.ReactNode;
  }[] = [
    {
      header: "Arabic Name",
      key: "nameAr",
      render: (value) => <span className="font-arabic">{`${value}`}</span>,
    },
    {
      header: "English Name",
      key: "nameEn",
    },
    {
      header: "Port",
      key: "port",
    },
    {
      header: "Country",
      key: "countryId",
      render: (value, item) => <span>{item.countryId?.nameEn || "N/A"}</span>,
    },
    {
      header: "Created By",
      key: "createdBy",
      render: (value, item) => (
        <span>{`${item.createdBy?.firstName} ${item.createdBy?.lastName}`}</span>
      ),
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
      onClick: (item: ShippingPort) => {
        router.push(`shipping-ports/${item.id}`);
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
          Shipping Ports
        </h1>
      </div>
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
    </div>
  );
};

export default Page;
