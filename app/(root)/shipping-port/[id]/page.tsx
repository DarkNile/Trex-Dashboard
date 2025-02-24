// "use client";
// import { useGenericQuery } from "@/hooks/generic/useGenericQuery";
// import { gql } from "@apollo/client";
// import { useParams, useRouter } from "next/navigation";
// import React, { use } from "react";
// import { ArrowLeft, Calendar, Globe, MapPin, User } from "lucide-react";
// import { Button } from "@/components/UI/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/UI/card";
// import { Skeleton } from "@/components/UI/skeleton";

// const GET_SHIPPING_PORT = gql`
//   query OneShippingPort($id: ID!) {
//     OneShippingPort(id: $id) {
//       _id
//       nameEn
//       nameAr
//       port
//       countryId {
//         _id
//         nameEn
//         nameAr
//         code
//         createdBy {
//           _id
//           firstName
//           lastName
//           email
//         }
//         updatedBy {
//           _id
//           firstName
//           lastName
//           email
//         }
//       }
//       createdBy {
//         _id
//         firstName
//         lastName
//         email
//       }
//       updatedBy {
//         _id
//         firstName
//         lastName
//         email
//       }
//       createdAt
//       updatedAt
//     }
//   }
// `;

// interface PortEntry {
//     nameEn: string;
//     nameAr: string;
//     port: string;
//   }
  
// export default function ShippingPortPage({
//   params,
// }: {
//   readonly params: Promise<{ id: string }>;
// }) {
//   const { id } = use(params);
// const router = useRouter();
//   const { data, loading, error } = useGenericQuery({
//     query: GET_SHIPPING_PORT,
//     variables: {
//       id,
//     },
//     onError: (error) => {
//       console.log("Error details:", {
//         message: error.message,
//         stack: error.stack,
//         graphQLErrors: error,
//       });
//     },
//   });

//   const shippingPort = data?.OneShippingPort;

//   // Map port type to readable label
//   const getPortTypeLabel = (portType: string) => {
//     const portTypeMap: { [key: string]: string } = {
//       seaport: "Sea Port",
//       airport: "Air Port",
//       landPort: "Land Port",
//     };
//     return portTypeMap[portType] || portType;
//   };

//   if (error) {
//     return (
//       <div className="p-8">
//         <Button
//           variant="outline"
//           onClick={() => router.back()}
//           className="mb-6"
//         >
//           <ArrowLeft className="mr-2 h-4 w-4" />
//           Back
//         </Button>
//         <div className="bg-red-50 p-6 rounded-lg border border-red-200">
//           <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
//           <p className="text-red-500">{error}</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-8">
//       <Button
//         variant="outline"
//         onClick={() => router.back()}
//         className="mb-6"
//       >
//         <ArrowLeft className="mr-2 h-4 w-4" />
//         Back to Shipping Ports
//       </Button>

//       {loading ? (
//         <LoadingSkeleton />
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <Card>
//             <CardHeader>
//               <CardTitle>Shipping Port Details</CardTitle>
//               <CardDescription>
//                 View detailed information about this shipping port
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <InfoItem
//                   label="English Name"
//                   value={shippingPort.nameEn}
//                   icon={<MapPin className="h-4 w-4" />}
//                 />
//                 <InfoItem
//                   label="Arabic Name"
//                   value={
//                     <span className="font-arabic" dir="rtl">
//                       {shippingPort.nameAr}
//                     </span>
//                   }
//                   icon={<MapPin className="h-4 w-4" />}
//                 />
//                 <InfoItem
//                   label="Port Type"
//                   value={getPortTypeLabel(shippingPort.port)}
//                   icon={<Globe className="h-4 w-4" />}
//                 />
//               </div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle>Country Information</CardTitle>
//               <CardDescription>
//                 Details about the country this port belongs to
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               {shippingPort.countryId ? (
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <InfoItem
//                     label="Country (EN)"
//                     value={shippingPort.countryId.nameEn}
//                     icon={<Globe className="h-4 w-4" />}
//                   />
//                   <InfoItem
//                     label="Country (AR)"
//                     value={
//                       <span className="font-arabic" dir="rtl">
//                         {shippingPort.countryId.nameAr}
//                       </span>
//                     }
//                     icon={<Globe className="h-4 w-4" />}
//                   />
//                   <InfoItem
//                     label="Country Code"
//                     value={shippingPort.countryId.code}
//                     icon={<Globe className="h-4 w-4" />}
//                   />
//                 </div>
//               ) : (
//                 <p className="text-gray-500 italic">
//                   No country information available
//                 </p>
//               )}
//             </CardContent>
//           </Card>

//           <Card className="md:col-span-2">
//             <CardHeader>
//               <CardTitle>Audit Information</CardTitle>
//               <CardDescription>
//                 Created and updated information
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="space-y-4">
//                   <h3 className="font-semibold flex items-center gap-2">
//                     <User className="h-4 w-4" /> Created By
//                   </h3>
//                   {shippingPort.createdBy && (
//                     <div className="space-y-2">
//                       <InfoItem
//                         label="Name"
//                         value={`${shippingPort.createdBy.firstName} ${shippingPort.createdBy.lastName}`}
//                       />
//                       <InfoItem
//                         label="Email"
//                         value={shippingPort.createdBy.email}
//                       />
//                       {shippingPort.createdAt && (
//                         <InfoItem
//                           label="Date"
//                           value={formatDate(shippingPort.createdAt)}
//                           icon={<Calendar className="h-4 w-4" />}
//                         />
//                       )}
//                     </div>
//                   )}
//                 </div>

//                 <div className="space-y-4">
//                   <h3 className="font-semibold flex items-center gap-2">
//                     <User className="h-4 w-4" /> Updated By
//                   </h3>
//                   {shippingPort.updatedBy ? (
//                     <div className="space-y-2">
//                       <InfoItem
//                         label="Name"
//                         value={`${shippingPort.updatedBy.firstName} ${shippingPort.updatedBy.lastName}`}
//                       />
//                       <InfoItem
//                         label="Email"
//                         value={shippingPort.updatedBy.email}
//                       />
//                       {shippingPort.updatedAt && (
//                         <InfoItem
//                           label="Date"
//                           value={formatDate(shippingPort.updatedAt)}
//                           icon={<Calendar className="h-4 w-4" />}
//                         />
//                       )}
//                     </div>
//                   ) : (
//                     <p className="text-gray-500 italic">
//                       No update information available
//                     </p>
//                   )}
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       )}
//     </div>
//   );
// };

// const InfoItem = ({
//   label,
//   value,
//   icon,
// }: {
//   label: string;
//   value: React.ReactNode;
//   icon?: React.ReactNode;
// }) => {
//   return (
//     <div className="space-y-1">
//       <p className="text-sm text-gray-500">{label}</p>
//       <div className="flex items-center gap-2">
//         {icon}
//         <p className="font-medium">{value}</p>
//       </div>
//     </div>
//   );
// };

// // Skeleton loading state
// const LoadingSkeleton = () => {
//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//       <Card>
//         <CardHeader>
//           <Skeleton className="h-6 w-48" />
//           <Skeleton className="h-4 w-64" />
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {[1, 2, 3, 4].map((i) => (
//               <div key={i} className="space-y-2">
//                 <Skeleton className="h-4 w-24" />
//                 <Skeleton className="h-6 w-32" />
//               </div>
//             ))}
//           </div>
//         </CardContent>
//       </Card>

//       <Card>
//         <CardHeader>
//           <Skeleton className="h-6 w-48" />
//           <Skeleton className="h-4 w-64" />
//         </CardHeader>
//         <CardContent>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {[1, 2, 3].map((i) => (
//               <div key={i} className="space-y-2">
//                 <Skeleton className="h-4 w-24" />
//                 <Skeleton className="h-6 w-32" />
//               </div>
//             ))}
//           </div>
//         </CardContent>
//       </Card>

//       <Card className="md:col-span-2">
//         <CardHeader>
//           <Skeleton className="h-6 w-48" />
//           <Skeleton className="h-4 w-64" />
//         </CardHeader>
//         <CardContent>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {[1, 2].map((section) => (
//               <div key={section} className="space-y-4">
//                 <Skeleton className="h-5 w-32" />
//                 <div className="space-y-2">
//                   {[1, 2, 3].map((i) => (
//                     <div key={i} className="space-y-1">
//                       <Skeleton className="h-4 w-16" />
//                       <Skeleton className="h-5 w-48" />
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// const formatDate = (dateString: string) => {
//   const date = new Date(dateString);
//   return new Intl.DateTimeFormat("en-US", {
//     year: "numeric",
//     month: "long",
//     day: "numeric",
//     hour: "2-digit",
//     minute: "2-digit",
//   }).format(date);
// };

"use client";
import { useGenericQuery } from "@/hooks/generic/useGenericQuery";
import { gql } from "@apollo/client";
import { useParams, useRouter } from "next/navigation";
import React, { use } from "react";
import { ArrowLeft, Calendar, Globe, MapPin, User } from "lucide-react";
import { Button } from "@/components/UI/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/UI/card";
import { Skeleton } from "@/components/UI/skeleton";

const GET_SHIPPING_PORT = gql`
  query OneShippingPort($id: ID!) {
    OneShippingPort(id: $id) {
        _id
        nameEn
        nameAr
        port
        countryId {
            _id
            nameEn
            nameAr
            code
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
}
`;

interface PortEntry {
  nameEn: string;
  nameAr: string;
  port: string;
}

export default function ShippingPortPage({
  params,
}: {
  readonly params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data, loading, error } = useGenericQuery({
    query: GET_SHIPPING_PORT,
    variables: {
      id,
    },
    onError: (error) => {
      console.log("Error details:", {
        message: error.message,
        stack: error.stack,
        graphQLErrors: error,
      });
    },
  });

  const shippingPort = data?.OneShippingPort;

  const getPortTypeLabel = (portType: string) => {
    const portTypeMap: { [key: string]: string } = {
      seaport: "Sea Port",
      airport: "Air Port",
      landPort: "Land Port",
    };
    return portTypeMap[portType] || portType;
  };

  if (error) {
    return (
      <div className="p-8">
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="bg-red-50 p-6 rounded-lg border border-red-200">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  // التحقق من تحميل البيانات أو عدم وجودها قبل العرض
  if (loading || !shippingPort) {
    return (
      <div className="p-8">
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="p-8">
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Shipping Ports
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Shipping Port Details</CardTitle>
            <CardDescription>
              View detailed information about this shipping port
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem
                label="English Name"
                value={shippingPort.nameEn}
                icon={<MapPin className="h-4 w-4" />}
              />
              <InfoItem
                label="Arabic Name"
                value={
                  <span className="font-arabic" dir="rtl">
                    {shippingPort.nameAr}
                  </span>
                }
                icon={<MapPin className="h-4 w-4" />}
              />
              <InfoItem
                label="Port Type"
                value={getPortTypeLabel(shippingPort.port)}
                icon={<Globe className="h-4 w-4" />}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Country Information</CardTitle>
            <CardDescription>
              Details about the country this port belongs to
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {shippingPort.countryId ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem
                  label="Country (EN)"
                  value={shippingPort.countryId.nameEn}
                  icon={<Globe className="h-4 w-4" />}
                />
                <InfoItem
                  label="Country (AR)"
                  value={
                    <span className="font-arabic" dir="rtl">
                      {shippingPort.countryId.nameAr}
                    </span>
                  }
                  icon={<Globe className="h-4 w-4" />}
                />
                <InfoItem
                  label="Country Code"
                  value={shippingPort.countryId.code}
                  icon={<Globe className="h-4 w-4" />}
                />
              </div>
            ) : (
              <p className="text-gray-500 italic">
                No country information available
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Audit Information</CardTitle>
            <CardDescription>
              Created and updated information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <User className="h-4 w-4" /> Created By
                </h3>
                {shippingPort.createdBy && (
                  <div className="space-y-2">
                    <InfoItem
                      label="Name"
                      value={`${shippingPort.createdBy.firstName} ${shippingPort.createdBy.lastName}`}
                    />
                    <InfoItem
                      label="Email"
                      value={shippingPort.createdBy.email}
                    />
                    {shippingPort.createdAt && (
                      <InfoItem
                        label="Date"
                        value={formatDate(shippingPort.createdAt)}
                        icon={<Calendar className="h-4 w-4" />}
                      />
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <User className="h-4 w-4" /> Updated By
                </h3>
                {shippingPort.updatedBy ? (
                  <div className="space-y-2">
                    <InfoItem
                      label="Name"
                      value={`${shippingPort.updatedBy.firstName} ${shippingPort.updatedBy.lastName}`}
                    />
                    <InfoItem
                      label="Email"
                      value={shippingPort.updatedBy.email}
                    />
                    {shippingPort.updatedAt && (
                      <InfoItem
                        label="Date"
                        value={formatDate(shippingPort.updatedAt)}
                        icon={<Calendar className="h-4 w-4" />}
                      />
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">
                    No update information available
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card> 
      </div>
    </div>
  );
}

const InfoItem = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}) => {
  return (
    <div className="space-y-1">
      <p className="text-sm text-gray-500">{label}</p>
      <div className="flex items-center gap-2">
        {icon}
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
};

// Skeleton loading state
const LoadingSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-32" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-32" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((section) => (
              <div key={section} className="space-y-4">
                <Skeleton className="h-5 w-32" />
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-1">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-5 w-48" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};
