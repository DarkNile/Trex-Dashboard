"use client";
import { useGenericQuery } from "@/hooks/generic/useGenericQuery";
import { gql } from "@apollo/client";
import React, { useState } from "react";
import GenericTable from "@/components/UI/Table/GenericTable";
import CreateCountryModal from "@/components/country/CreateCountryModal";
import { Pen } from "lucide-react";
import UpdateCountryModal from "@/components/country/UpdateCountryModal";
import Pagination from "@/components/UI/pagination/Pagination";

const GET_COUNTRIES = gql`
  query CountryList($page: Int!) {
    countryList(pageable: { page: $page }, extraFilter: { deleted: false }) {
      totalSize
      totalPages
      pageSize
      pageNumber
      data {
        _id
        nameEn
        nameAr
        code
      }
    }
  }
`;

// const DELETE_COUNTRY = gql`
//   mutation DeleteCountry($id: String!) {
//     deleteCountry(id: $id)
//   }
// `;

type CountryFromAPI = {
  _id: string;
  nameEn: string;
  nameAr: string;
  code: string;
};

type Country = CountryFromAPI & { id: string };

const Page = () => {
  // const [currentPage, setCurrentPage] = useState(1);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { data, loading, error, refetch } = useGenericQuery({
    query: GET_COUNTRIES,
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

  // const { execute: deleteCountry } = useGenericMutation({
  //   mutation: DELETE_COUNTRY,
  //   onSuccess: () => {
  //     refetch();
  //   },
  //   onError: (error) => {
  //     console.log("Error deleting country:", error);
  //   },
  // });

  // const handleDelete = (country: Country) => {
  //   deleteCountry({ id: country._id });
  // };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Transform the API data to include the required 'id' field
  const transformedData: Country[] = (data?.countryList?.data || []).map(
    (item: CountryFromAPI) => ({
      ...item,
      id: item._id,
    })
  );

  const columns: {
    header: string;
    key: keyof Country;
    render?: (value: unknown, item: Country) => React.ReactNode;
  }[] = [
    {
      header: "Country Code",
      key: "code",
      render: (value) => (
        <span className="font-mono bg-gray-100 px-2 py-1 rounded">{`${value}`}</span>
      ),
    },
    {
      header: "English Name",
      key: "nameEn",
    },
    {
      header: "Arabic Name",
      key: "nameAr",
      render: (value) => <span className="font-arabic">{`${value}`}</span>,
    },
  ];

  const handleUpdate = (country: Country) => {
    console.log("Update country:", country);
    setSelectedId(country._id);
    setIsUpdateModalOpen(true);
  };

  const actions = [
    {
      label: "Udate",
      onClick: handleUpdate,
      icon: <Pen className="w-4 h-4" />,
      className: "text-blue-500",
    },
  ];

  // const paginationProps = {
  //   currentPage: data?.countryList?.pageNumber || 1,
  //   totalPages: data?.countryList?.totalPages || 1,
  //   onPageChange: handlePageChange,
  // };

  return (
    <div>
      <div className="flex justify-between items-center mb-3 px-8 pt-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Countries
        </h1>
        {/* Add CreateCountryModal component here */}

        <CreateCountryModal onSuccess={refetch} />

        {isUpdateModalOpen && selectedId && (
          <UpdateCountryModal
            countryId={selectedId || ""}
            onSuccess={refetch} // Refetch after success
            onClose={() => setIsUpdateModalOpen(false)} // Close the modal
          />
        )}
      </div>
      <GenericTable
        data={transformedData}
        columns={columns}
        subtitle={`Total Countries: ${data?.countryList?.totalSize || 0}`}
        isLoading={loading}
        error={error || null}
        actions={actions}
      />
      {!loading && !error && data?.countryList?.totalSize && (
        <Pagination
          currentPage={currentPage}
          totalPages={data.countryList.totalPages || 1}
          totalItems={data.countryList.totalSize || 0}
          pageSize={data.countryList.pageSize || pageSize}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default Page;
