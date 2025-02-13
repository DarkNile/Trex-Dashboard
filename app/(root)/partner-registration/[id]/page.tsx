"use client";
import ChatSection from "@/components/Partner-registration/ChatSectoin";
import DocumentSection from "@/components/Partner-registration/DocumentSection";
import { useGenericMutation } from "@/hooks/generic/useGenericMutation";
import { useGenericQuery } from "@/hooks/generic/useGenericQuery";
import { gql } from "@apollo/client";
import { useRouter } from "next/navigation";

const GET_REGISTRATIONS = gql`
  query GetRegistrations($page: Int!, $size: Int!, $id: [Int!]!) {
    getRegistrations(idFilter: $id, pageable: { page: $page, size: $size }) {
      pageNumber
      totalPagesCount
      totalElementsCount
      pageElementsCount
      pageSize
      firstPage
      lastPage
      emptyPage
      registrations {
        id
        chat
        name
        address
        phoneNumber
        type
        trcSerial
        trcIssuedAt
        trcExpiresAt
        trcFileUrl
        crcSerial
        crcIssuedAt
        crcExpiresAt
        crcFileUrl
        cccSerial
        cccIssuedAt
        cccExpiresAt
        cccFileUrl
        bplSerial
        bplIssuedAt
        bplExpiresAt
        bplFileUrl
      }
    }
  }
`;
const APPROVE_REGISTRATION = gql`
  mutation ApproveRegistration($id: Int!) {
    approveRegistration(id: $id)
  }
`;

const DELETE_REGISTRATION = gql`
  mutation DeleteRegistration($id: Int!) {
    deleteRegistration(id: $id)
  }
`;

import { use } from "react";

export default function Page({
  params,
}: {
  readonly params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const { data, loading, error, refetch } = useGenericQuery({
    query: GET_REGISTRATIONS,
    variables: {
      page: 1,
      size: 100,
      id: [parseInt(id)],
    },
    onError: (error) => {
      console.log("Error details:", {
        message: error.message,
        stack: error.stack,
        graphQLErrors: error,
      });
    },
  });
  const { execute: approveRegistration, isLoading: approveLoading } =
    useGenericMutation({
      mutation: APPROVE_REGISTRATION,
      onSuccess: () => {
        // Redirect to registrations list or show success message
        router.push("/partner-registration");
      },
      onError: (error) => {
        console.log("Error approving registration:", error);
      },
    });

  const { execute: deleteRegistration, isLoading: deleteLoading } =
    useGenericMutation({
      mutation: DELETE_REGISTRATION,
      onSuccess: () => {
        // Redirect to registrations list or show success message
        router.push("/partner-registration");
      },
      onError: (error) => {
        console.log("Error deleting registration:", error);
      },
    });

  const handleApprove = async () => {
    await approveRegistration({ id: parseInt(id) });
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this registration?")) {
      await deleteRegistration({ id: parseInt(id) });
    }
  };

  if (loading) {
    return (
      <div className="">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="text-red-600">
            Error loading registration details: {error}
          </div>
        </div>
      </div>
    );
  }

  const registration = data?.getRegistrations?.registrations[0];
  if (!registration) {
    return <div className="p-6">No registration found</div>;
  }

  const chat = registration.chat
    ? JSON.parse(registration.chat)
    : { messages: [] };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold">{registration.name}</h1>
            <span className="inline-block bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded mt-2">
              {registration.type.replace(/_/g, " ")}
            </span>
          </div>
          <div className="space-x-4">
            <button
              onClick={handleApprove}
              disabled={approveLoading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {approveLoading ? "Approving..." : "Approve"}
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteLoading}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleteLoading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <span className="text-gray-500">Phone:</span>{" "}
            {registration.phoneNumber}
          </div>
          <div>
            <span className="text-gray-500">Address:</span>{" "}
            {registration.address}
          </div>
        </div>
      </div>

      {/* Documents Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-bold mb-6">Documents</h2>
        <DocumentSection
          title="Trade Register Certificate (TRC)"
          serial={registration.trcSerial}
          issuedAt={registration.trcIssuedAt}
          expiresAt={registration.trcExpiresAt}
          fileUrl={registration.trcFileUrl}
        />
        <DocumentSection
          title="Commercial Register Certificate (CRC)"
          serial={registration.crcSerial}
          issuedAt={registration.crcIssuedAt}
          expiresAt={registration.crcExpiresAt}
          fileUrl={registration.crcFileUrl}
        />
        <DocumentSection
          title="Chamber of Commerce Certificate (CCC)"
          serial={registration.cccSerial}
          issuedAt={registration.cccIssuedAt}
          expiresAt={registration.cccExpiresAt}
          fileUrl={registration.cccFileUrl}
        />
        <DocumentSection
          title="Business Practice License (BPL)"
          serial={registration.bplSerial}
          issuedAt={registration.bplIssuedAt}
          expiresAt={registration.bplExpiresAt}
          fileUrl={registration.bplFileUrl}
        />
      </div>

      {/* Chat Section */}
      <ChatSection
        registrationId={parseInt(id)}
        initialChat={chat}
        refetchChat={refetch}
      />
    </div>
  );
}
