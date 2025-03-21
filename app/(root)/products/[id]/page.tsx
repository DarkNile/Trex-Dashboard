"use client";
import React, { use } from "react";
import { gql } from "@apollo/client";
import { useGenericQuery } from "@/hooks/generic/useGenericQuery";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/UI/card";
import {
  BookOpen,
  Tag,
  FileText,
  DollarSign,
  Calendar,
  Hash,
  Info,
  ArrowLeft,
} from "lucide-react";
import { Badge } from "@/components/UI/badge";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/UI/button";

const GET_PRODUCT = gql`
  query Product($id: ID!) {
    product(id: $id) {
      _id
      HSCode
      nameEn
      nameAr
      noteEn
      noteAr
      defaultDutyRate
      serviceTax
      adVAT
      deletedAt
      createdAt
      updatedAt
      subChapterId {
        _id
        nameEn
        nameAr
        deletedAt
        createdAt
        updatedAt
      }
      agreements {
        _id
        reducedDutyRate
        agreementId {
          _id
          name
        }
        applyGlobal
      }
      scheduleTaxes {
        _id
        min
        max
        fee
        enhancementFee
      }
    }
  }
`;

interface AgreementData {
  _id: string;
  reducedDutyRate: number;
  agreementId: {
    _id: string;
    name: string;
  };
  applyGlobal: boolean;
}

interface ScheduleTax {
  min: number;
  max: number;
  fee: number;
  enhancementFee: number;
}

interface ProductData {
  _id: string;
  HSCode: string;
  nameEn: string;
  nameAr: string;
  defaultDutyRate: number;
  noteEn: string;
  noteAr: string;
  agreements: AgreementData[];
  scheduleTaxes: ScheduleTax[];
  serviceTax: boolean;
  adVAT: number;
  subChapterId: {
    _id: string;
    nameEn: string;
    nameAr: string;
    deletedAt: string;
    createdAt: string;
    updatedAt: string;
  };
  deletedAt: string;
  createdAt: string;
  updatedAt: string;
  type: "regural" | "car";
}

interface ProductResponse {
  product: ProductData;
}

// Format date helper function
const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function ProductPage({
  params,
}: {
  readonly params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const pathname = usePathname();
  const { data, loading, error, refetch } = useGenericQuery<ProductResponse>({
    query: GET_PRODUCT,
    variables: { id },
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center bg-muted">
        <div className="text-lg font-medium text-muted-foreground animate-pulse">
          Loading...
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center bg-muted">
        <div className="text-lg font-medium text-destructive">Error: {error}</div>
      </div>
    );
  }

  if (!data?.product) {
    return (
      <div className="flex items-center justify-center bg-muted">
        <div className="text-lg font-medium text-muted-foreground">
          No product found
        </div>
      </div>
    );
  }

  const { product } = data;

  const handleBackToList = () => {
    router.push('/products');
  };

  return (
    <div className="bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button onClick={handleBackToList} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />Back
        </Button>
        {/* Main Product Info Card */}
        <Card className="mb-8 bg-card shadow-lg border-none">
          <CardHeader className="bg-card border-b border-border">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <CardTitle className="text-2xl font-bold text-foreground">
                  Product Details
                </CardTitle>
              </div>
              <div className="flex space-x-2">
                <Badge
                  variant="secondary"
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                >
                  ID: {product._id}
                </Badge>
                <Badge
                  variant="outline"
                  className="px-3 py-1 text-sm border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-400"
                >
                  HS Code: {product.HSCode}
                </Badge>
              </div>
            </div>
          </CardHeader>
  
          <CardContent className="p-6 space-y-6">
            {/* Basic Information Section */}
            <div className="bg-secondary/50 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                <h3 className="text-lg font-semibold text-foreground">
                  Basic Information
                </h3>
              </div>
  
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    English Name
                  </p>
                  <p className="text-base text-foreground">{product.nameEn}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Arabic Name
                  </p>
                  <p className="text-base text-foreground font-arabic">
                    {product.nameAr}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    HS Code
                  </p>
                  <p className="text-base text-foreground">{product.HSCode}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Type</p>
                  <p className="text-base text-foreground capitalize">
                    {product.type || "Regular"}
                  </p>
                </div>
              </div>
            </div>
  
            {/* Duty & Tax Information */}
            <div className="bg-secondary/50 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                <h3 className="text-lg font-semibold text-foreground">
                  Duty & Tax Information
                </h3>
              </div>
  
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Default Duty Rate
                  </p>
                  <p className="text-base text-foreground font-semibold">
                    {product.defaultDutyRate}%
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Service Tax
                  </p>
                  <Badge
                    className={`${
                      product.serviceTax
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                    }`}
                  >
                    {product.serviceTax ? "Applicable" : "Not Applicable"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Ad Valorem VAT
                  </p>
                  <p className="text-base text-foreground">{product.adVAT}%</p>
                </div>
              </div>
            </div>
  
            {/* Sub-Chapter Information */}
            {product.subChapterId && (
              <div className="bg-secondary/50 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-2" />
                  <h3 className="text-lg font-semibold text-foreground">
                    Sub-Chapter Information
                  </h3>
                </div>
  
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Sub-Chapter ID
                    </p>
                    <p className="text-base text-foreground">
                      {product.subChapterId._id}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Sub-Chapter English Name
                    </p>
                    <p className="text-base text-foreground">
                      {product.subChapterId.nameEn}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Sub-Chapter Arabic Name
                    </p>
                    <p className="text-base text-foreground font-arabic">
                      {product.subChapterId.nameAr}
                    </p>
                  </div>
                </div>
              </div>
            )}
  
            {/* Notes Section */}
            {product.noteAr && (
              <div className="bg-secondary/50 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400 mr-2" />
                  <h3 className="text-lg font-semibold text-foreground">Arabic Notes</h3>
                </div>
                <div className="bg-card p-4 rounded-lg border border-border">
                  <p className="text-foreground whitespace-pre-line">
                    {product.noteAr}
                  </p>
                </div>
              </div>
            )}
            {product.noteEn && (
              <div className="bg-secondary/50 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400 mr-2" />
                  <h3 className="text-lg font-semibold text-foreground">English Notes</h3>
                </div>
                <div className="bg-card p-4 rounded-lg border border-border">
                  <p className="text-foreground whitespace-pre-line">
                    {product.noteEn}
                  </p>
                </div>
              </div>
            )}
  
            {/* Trade Agreements */}
            {product.agreements && product.agreements.length > 0 && (
              <div className="bg-secondary/50 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <Tag className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2" />
                  <h3 className="text-lg font-semibold text-foreground">
                    Trade Agreements
                  </h3>
                </div>
  
                <div className="overflow-hidden shadow ring-1 ring-border ring-opacity-5 rounded-lg">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted">
                      <tr>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-foreground"
                        >
                          Agreement Name
                        </th>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-foreground"
                        >
                          Apply Globally
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-foreground"
                        >
                          Reduced Duty Rate
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-card">
                      {product.agreements.map((agreement, index) => (
                        <tr key={agreement._id || index}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-foreground">
                            {agreement.agreementId.name}
                          </td>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-foreground">
                            {agreement.applyGlobal ? "Yes" : "No"}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-foreground">
                            {agreement.reducedDutyRate}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Schedule Taxes */}
            {product.scheduleTaxes && product.scheduleTaxes.length > 0 && (
              <div className="bg-secondary/50 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <Hash className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2" />
                  <h3 className="text-lg font-semibold text-foreground">
                    Schedule Taxes
                  </h3>
                </div>
  
                <div className="overflow-hidden shadow ring-1 ring-border ring-opacity-5 rounded-lg">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted">
                      <tr>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-foreground"
                        >
                          Min
                        </th>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-foreground"
                        >
                          Max
                        </th>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-foreground"
                        >
                          Fee
                        </th>
                        <th
                          scope="col"
                          className="px-0 py-3.5 text-left text-sm font-semibold text-foreground"
                        >
                          enhancementFee
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-card">
                      {product.scheduleTaxes.map((scheduleTax, index) => (
                        <tr key={index}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-foreground">
                            {scheduleTax.min}
                          </td>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-foreground">
                            {scheduleTax.max}
                          </td>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-foreground">
                            {scheduleTax.fee}
                          </td>
                          <td className="whitespace-nowrap px-0 py-4 text-sm text-foreground">
                            {scheduleTax.enhancementFee}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
  
            {/* Timestamp Information */}
            <div className="bg-secondary/50 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <Calendar className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" />
                <h3 className="text-lg font-semibold text-foreground">
                  Timestamp Information
                </h3>
              </div>
  
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Created At
                  </p>
                  <p className="text-base text-foreground">
                    {formatDate(product.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Updated At
                  </p>
                  <p className="text-base text-foreground">
                    {formatDate(product.updatedAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Deleted At
                  </p>
                  <p
                    className={`text-base ${
                      product.deletedAt
                        ? "text-red-600 dark:text-red-400"
                        : "text-muted-foreground italic"
                    }`}
                  >
                    {product.deletedAt
                      ? formatDate(product.deletedAt)
                      : "Not Deleted"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // return (
  //   <div className="bg-gray-50 py-8">
  //     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  //     <Button onClick={handleBackToList} className="mb-4">
  //       <ArrowLeft className="mr-2 h-4 w-4" />Back
  //     </Button>
  //       {/* Main Product Info Card */}
  //       <Card className="mb-8 bg-white shadow-lg border-none">
  //         <CardHeader className="bg-white border-b border-gray-100">
  //           <div className="flex justify-between items-center">
  //             <div className="flex items-center space-x-3">
  //               <BookOpen className="h-6 w-6 text-blue-600" />
  //               <CardTitle className="text-2xl font-bold text-gray-900">
  //                 Product Details
  //               </CardTitle>
  //             </div>
  //             <div className="flex space-x-2">
  //               <Badge
  //                 variant="secondary"
  //                 className="px-3 py-1 text-sm bg-blue-100 text-blue-800"
  //               >
  //                 ID: {product._id}
  //               </Badge>
  //               <Badge
  //                 variant="outline"
  //                 className="px-3 py-1 text-sm border-amber-300 text-amber-700"
  //               >
  //                 HS Code: {product.HSCode}
  //               </Badge>
  //             </div>
  //           </div>
  //         </CardHeader>

  //         <CardContent className="p-6 space-y-6">
  //           {/* Basic Information Section */}
  //           <div className="bg-gray-50 rounded-xl p-6">
  //             <div className="flex items-center mb-4">
  //               <Info className="h-5 w-5 text-blue-600 mr-2" />
  //               <h3 className="text-lg font-semibold text-gray-900">
  //                 Basic Information
  //               </h3>
  //             </div>

  //             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  //               <div>
  //                 <p className="text-sm font-medium text-gray-500 mb-1">
  //                   English Name
  //                 </p>
  //                 <p className="text-base text-gray-900">{product.nameEn}</p>
  //               </div>
  //               <div>
  //                 <p className="text-sm font-medium text-gray-500 mb-1">
  //                   Arabic Name
  //                 </p>
  //                 <p className="text-base text-gray-900 font-arabic">
  //                   {product.nameAr}
  //                 </p>
  //               </div>
  //               <div>
  //                 <p className="text-sm font-medium text-gray-500 mb-1">
  //                   HS Code
  //                 </p>
  //                 <p className="text-base text-gray-900">{product.HSCode}</p>
  //               </div>
  //               <div>
  //                 <p className="text-sm font-medium text-gray-500 mb-1">Type</p>
  //                 <p className="text-base text-gray-900 capitalize">
  //                   {product.type || "Regular"}
  //                 </p>
  //               </div>
  //             </div>
  //           </div>

  //           {/* Duty & Tax Information */}
  //           <div className="bg-gray-50 rounded-xl p-6">
  //             <div className="flex items-center mb-4">
  //               <DollarSign className="h-5 w-5 text-green-600 mr-2" />
  //               <h3 className="text-lg font-semibold text-gray-900">
  //                 Duty & Tax Information
  //               </h3>
  //             </div>

  //             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  //               <div>
  //                 <p className="text-sm font-medium text-gray-500 mb-1">
  //                   Default Duty Rate
  //                 </p>
  //                 <p className="text-base text-gray-900 font-semibold">
  //                   {product.defaultDutyRate}%
  //                 </p>
  //               </div>
  //               <div>
  //                 <p className="text-sm font-medium text-gray-500 mb-1">
  //                   Service Tax
  //                 </p>
  //                 <Badge
  //                   className={`${
  //                     product.serviceTax
  //                       ? "bg-green-100 text-green-800"
  //                       : "bg-red-100 text-red-800"
  //                   }`}
  //                 >
  //                   {product.serviceTax ? "Applicable" : "Not Applicable"}
  //                 </Badge>
  //               </div>
  //               <div>
  //                 <p className="text-sm font-medium text-gray-500 mb-1">
  //                   Ad Valorem VAT
  //                 </p>
  //                 <p className="text-base text-gray-900">{product.adVAT}%</p>
  //               </div>
  //             </div>
  //           </div>

  //           {/* Sub-Chapter Information */}
  //           {product.subChapterId && (
  //             <div className="bg-gray-50 rounded-xl p-6">
  //               <div className="flex items-center mb-4">
  //                 <FileText className="h-5 w-5 text-purple-600 mr-2" />
  //                 <h3 className="text-lg font-semibold text-gray-900">
  //                   Sub-Chapter Information
  //                 </h3>
  //               </div>

  //               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  //                 <div>
  //                   <p className="text-sm font-medium text-gray-500 mb-1">
  //                     Sub-Chapter ID
  //                   </p>
  //                   <p className="text-base text-gray-900">
  //                     {product.subChapterId._id}
  //                   </p>
  //                 </div>
  //                 <div>
  //                   <p className="text-sm font-medium text-gray-500 mb-1">
  //                     Sub-Chapter English Name
  //                   </p>
  //                   <p className="text-base text-gray-900">
  //                     {product.subChapterId.nameEn}
  //                   </p>
  //                 </div>
  //                 <div>
  //                   <p className="text-sm font-medium text-gray-500 mb-1">
  //                     Sub-Chapter Arabic Name
  //                   </p>
  //                   <p className="text-base text-gray-900 font-arabic">
  //                     {product.subChapterId.nameAr}
  //                   </p>
  //                 </div>
  //               </div>
  //             </div>
  //           )}

  //           {/* Notes Section */}
  //           {product.noteAr && (
  //             <div className="bg-gray-50 rounded-xl p-6">
  //               <div className="flex items-center mb-4">
  //                 <FileText className="h-5 w-5 text-amber-600 mr-2" />
  //                 <h3 className="text-lg font-semibold text-gray-900">Arabic Notes</h3>
  //               </div>
  //               <div className="bg-white p-4 rounded-lg border border-gray-200">
  //                 <p className="text-gray-700 whitespace-pre-line">
  //                   {product.noteAr}
  //                 </p>
  //               </div>
  //             </div>
  //           )}
  //           {product.noteEn && (
  //             <div className="bg-gray-50 rounded-xl p-6">
  //               <div className="flex items-center mb-4">
  //                 <FileText className="h-5 w-5 text-amber-600 mr-2" />
  //                 <h3 className="text-lg font-semibold text-gray-900">English Notes</h3>
  //               </div>
  //               <div className="bg-white p-4 rounded-lg border border-gray-200">
  //                 <p className="text-gray-700 whitespace-pre-line">
  //                   {product.noteEn}
  //                 </p>
  //               </div>
  //             </div>
  //           )}

  //           {/* Trade Agreements */}
  //           {product.agreements && product.agreements.length > 0 && (
  //             <div className="bg-gray-50 rounded-xl p-6">
  //               <div className="flex items-center mb-4">
  //                 <Tag className="h-5 w-5 text-indigo-600 mr-2" />
  //                 <h3 className="text-lg font-semibold text-gray-900">
  //                   Trade Agreements
  //                 </h3>
  //               </div>

  //               <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
  //                 <table className="min-w-full divide-y divide-gray-300">
  //                   <thead className="bg-gray-100">
  //                     <tr>
  //                       <th
  //                         scope="col"
  //                         className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900"
  //                       >
  //                         Agreement Name
  //                       </th>
  //                       <th
  //                         scope="col"
  //                         className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900"
  //                       >
  //                         Apply Globally
  //                       </th>
  //                       <th
  //                         scope="col"
  //                         className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
  //                       >
  //                         Reduced Duty Rate
  //                       </th>
  //                     </tr>
  //                   </thead>
  //                   <tbody className="divide-y divide-gray-200 bg-white">
  //                     {product.agreements.map((agreement, index) => (
  //                       <tr key={agreement._id || index}>
  //                         <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900">
  //                           {agreement.agreementId.name}
  //                         </td>
  //                         <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900">
  //                           {agreement.applyGlobal ? "Yes" : "No"}
  //                         </td>
  //                         <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
  //                           {agreement.reducedDutyRate}%
  //                         </td>
  //                       </tr>
  //                     ))}
  //                   </tbody>
  //                 </table>
  //               </div>
  //             </div>
  //           )}
  //           {/* Schedule Taxes */}

  //           {product.scheduleTaxes && product.scheduleTaxes.length > 0 && (
  //             <div className="bg-gray-50 rounded-xl p-6">
  //               <div className="flex items-center mb-4">
  //               <Hash className="h-5 w-5 text-indigo-600 mr-2" />
  //                 <h3 className="text-lg font-semibold text-gray-900">
  //                 Schedule Taxes
  //                 </h3>
  //               </div>

  //               <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
  //                 <table className="min-w-full divide-y divide-gray-300">
  //                   <thead className="bg-gray-100">
  //                     <tr>
  //                       <th
  //                         scope="col"
  //                         className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900"
  //                       >
  //                         Min
  //                       </th>
  //                       <th
  //                         scope="col"
  //                         className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900"
  //                       >
  //                         Max
  //                       </th>
  //                       <th
  //                         scope="col"
  //                         className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900"
  //                       >
  //                         Fee
  //                       </th>
  //                       <th
  //                         scope="col"
  //                         className="px-0 py-3.5 text-left text-sm font-semibold text-gray-900"
  //                       >
  //                         enhancementFee
  //                       </th>
  //                     </tr>
  //                   </thead>
  //                   <tbody className="divide-y divide-gray-200 bg-white">
  //                   {product.scheduleTaxes.map((scheduleTax, index) => (
  //                       <tr key={index}>
  //                         <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900">
  //                         {scheduleTax.min}
  //                         </td>
  //                         <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900">
  //                         {scheduleTax.max}
  //                         </td>
  //                         <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900">
  //                         {scheduleTax.fee}
  //                         </td>
  //                         <td className="whitespace-nowrap px-0 py-4 text-sm text-gray-900">
  //                           {scheduleTax.enhancementFee}
  //                         </td>
  //                       </tr>
  //                     ))}
  //                   </tbody>
  //                 </table>
  //               </div>
  //             </div>
  //           )}

  //           {/* Timestamp Information */}
  //           <div className="bg-gray-50 rounded-xl p-6">
  //             <div className="flex items-center mb-4">
  //               <Calendar className="h-5 w-5 text-gray-600 mr-2" />
  //               <h3 className="text-lg font-semibold text-gray-900">
  //                 Timestamp Information
  //               </h3>
  //             </div>

  //             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  //               <div>
  //                 <p className="text-sm font-medium text-gray-500 mb-1">
  //                   Created At
  //                 </p>
  //                 <p className="text-base text-gray-900">
  //                   {formatDate(product.createdAt)}
  //                 </p>
  //               </div>
  //               <div>
  //                 <p className="text-sm font-medium text-gray-500 mb-1">
  //                   Updated At
  //                 </p>
  //                 <p className="text-base text-gray-900">
  //                   {formatDate(product.updatedAt)}
  //                 </p>
  //               </div>
  //               <div>
  //                 <p className="text-sm font-medium text-gray-500 mb-1">
  //                   Deleted At
  //                 </p>
  //                 <p
  //                   className={`text-base ${
  //                     product.deletedAt
  //                       ? "text-red-600"
  //                       : "text-gray-400 italic"
  //                   }`}
  //                 >
  //                   {product.deletedAt
  //                     ? formatDate(product.deletedAt)
  //                     : "Not Deleted"}
  //                 </p>
  //               </div>
  //             </div>
  //           </div>
  //         </CardContent>
  //       </Card>
  //     </div>
  //   </div>
  // );
}
