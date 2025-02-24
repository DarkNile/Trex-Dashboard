// import React, { useState } from "react";
// import { Button } from "@/components/UI/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/UI/dialog";
// import { Input } from "@/components/UI/input";
// import { Label } from "@/components/UI/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/UI/select";
// import { gql } from "@apollo/client";
// import { useGenericMutation } from "@/hooks/generic/useGenericMutation";
// import { useGenericQuery } from "@/hooks/generic/useGenericQuery";
// import toast from "react-hot-toast";
// import { ShippingPortFromAPI } from "@/types/shipping";

// const UPDATE_SHIPPING_PORT = gql`
//   mutation UpdateShippingPortResponse(
//     $updateShippingPortResponseInput: UpdateShippingPortInput!
//   ) {
//     updateShippingPortResponse(
//       updateShippingPortResponseInput: $updateShippingPortResponseInput
//     ) {
//       _id
//       nameAr
//       nameEn
//     }
//   }
// `;

// const GET_COUNTRIES = gql`
//   query CountryList($page: Int!) {
//     countryList(pageable: { page: $page }, extraFilter: { deleted: false }) {
//       data {
//         _id
//         nameEn
//       }
//     }
//   }
// `;

// interface UpdateShippingPortModalProps {
//   refetch: () => void;
//   shippingPort: ShippingPortFromAPI;
//   onClose: () => void;
// }

// const portTypes = [
//   { value: "seaport", label: "Sea Port" },
//   { value: "airport", label: "Air Port" },
//   { value: "landPort", label: "Land Port" },
// ];

// const UpdateShippingPortModal: React.FC<UpdateShippingPortModalProps> = ({
//   refetch,
//   shippingPort,
//   onClose,
// }) => {
//   const [currentPage] = useState(1);
//   const [formData, setFormData] = useState({
//     nameEn: shippingPort.nameEn || "",
//     nameAr: shippingPort.nameAr || "",
//     port: shippingPort.port || "",
//     countryId: shippingPort.countryId?._id || "",
//     id: shippingPort._id,
//   });

//   const { data: countriesData, loading: loadingCountries } = useGenericQuery({
//     query: GET_COUNTRIES,
//     variables: { page: currentPage },
//   });

//   const { execute: updateShippingPort, isLoading } = useGenericMutation({
//     mutation: UPDATE_SHIPPING_PORT,
//     onSuccess: () => {
//       onClose();
//       toast.success("Shipping port updated successfully! ✅");
//       refetch();
//     },
//     onError: (error) => {
//       console.log("Error updating shipping port:", error);
//       toast.error(error.message, { position: "top-right", duration: 3000 });
//     },
//   });

//   const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     updateShippingPort({
//       updateShippingPortResponseInput: formData,
//     });
//   };

//   const handleInputChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
//   ) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleSelectChange = (name: string, value: string) => {
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   return (
//     <Dialog open={true} onOpenChange={() => onClose()}>
//       <DialogContent className="sm:max-w-[425px]">
//         <DialogHeader>
//           <DialogTitle>Update Shipping Port</DialogTitle>
//         </DialogHeader>
//         <form onSubmit={handleSubmit} className="grid gap-4 py-4">
//           <div className="grid grid-cols-4 items-center gap-4">
//             <Label htmlFor="nameEn" className="text-right">
//               Name (En)
//             </Label>
//             <Input
//               id="nameEn"
//               name="nameEn"
//               value={formData.nameEn}
//               onChange={handleInputChange}
//               className="col-span-3"
//             />
//           </div>
//           <div className="grid grid-cols-4 items-center gap-4">
//             <Label htmlFor="nameAr" className="text-right">
//               Name (Ar)
//             </Label>
//             <Input
//               id="nameAr"
//               name="nameAr"
//               value={formData.nameAr}
//               onChange={handleInputChange}
//               className="col-span-3"
//             />
//           </div>
//           <div className="grid grid-cols-4 items-center gap-4">
//             <Label htmlFor="port" className="text-right">
//               Port Type
//             </Label>
//             <Select
//               value={formData.port}
//               onValueChange={(value) => handleSelectChange("port", value)}
//             >
//               <SelectTrigger className="col-span-3">
//                 <SelectValue placeholder="Select port type" />
//               </SelectTrigger>
//               <SelectContent>
//                 {portTypes.map((type) => (
//                   <SelectItem key={type.value} value={type.value}>
//                     {type.label}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>
//           <div className="grid grid-cols-4 items-center gap-4">
//             <Label htmlFor="countryId" className="text-right">
//               Country
//             </Label>
//             <Select
//               value={formData.countryId}
//               onValueChange={(value) => handleSelectChange("countryId", value)}
//             >
//               <SelectTrigger className="col-span-3">
//                 <SelectValue placeholder="Select country" />
//               </SelectTrigger>
//               <SelectContent>
//                 {countriesData?.countryList?.data.map((country: any) => (
//                   <SelectItem key={country._id} value={country._id}>
//                     {country.nameEn}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>
//           <div className="flex justify-end gap-4">
//             <Button type="button" variant="outline" onClick={onClose}>
//               Cancel
//             </Button>
//             <Button type="submit" disabled={isLoading}>
//               {isLoading ? "Updating..." : "Update"}
//             </Button>
//           </div>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default UpdateShippingPortModal;




import React, { useState, useEffect } from "react";
import { Button } from "@/components/UI/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/UI/dialog";
import { Input } from "@/components/UI/input";
import { Label } from "@/components/UI/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/UI/select";
import { ChevronDown } from "lucide-react";
import { gql } from "@apollo/client";
import { useGenericMutation } from "@/hooks/generic/useGenericMutation";
import { useGenericQuery } from "@/hooks/generic/useGenericQuery";
import toast from "react-hot-toast";
import { ShippingPortFromAPI } from "@/types/shipping";

const UPDATE_SHIPPING_PORT = gql`
  mutation UpdateShippingPortResponse(
    $updateShippingPortResponseInput: UpdateShippingPortInput!
  ) {
    updateShippingPortResponse(
      updateShippingPortResponseInput: $updateShippingPortResponseInput
    ) {
      _id
      nameAr
      nameEn
    }
  }
`;

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

interface UpdateShippingPortModalProps {
  refetch: () => void;
  shippingPort: ShippingPortFromAPI;
  onClose: () => void;
}

const portTypes = [
  { value: "seaport", label: "Sea Port" },
  { value: "airport", label: "Air Port" },
  { value: "landPort", label: "Land Port" },
];

const UpdateShippingPortModal: React.FC<UpdateShippingPortModalProps> = ({
  refetch,
  shippingPort,
  onClose,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [formData, setFormData] = useState({
    nameEn: shippingPort.nameEn || "",
    nameAr: shippingPort.nameAr || "",
    port: shippingPort.port || "",
    countryId: shippingPort.countryId?._id || "",
    id: shippingPort._id,
  });
  
  const [hasMore, setHasMore] = useState(true);
  const [loadedCountries, setLoadedCountries] = useState<
    Array<{ _id: string; nameEn: string; nameAr: string; code: string }>
  >([]);

  const { data: countriesData, loading: loadingCountries } = useGenericQuery({
    query: GET_COUNTRIES,
    variables: { page: currentPage },
  });

  useEffect(() => {
    if (countriesData?.countryList?.data) {
      setLoadedCountries((prev) => {
        const newCountries = countriesData.countryList.data.filter(
          (newCountry: { _id: string }) =>
            !prev.some((prevCountry) => prevCountry._id === newCountry._id)
        );
        return [...prev, ...newCountries];
      });
      setHasMore(countriesData.countryList.data.length > 0);
    }
  }, [countriesData]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 10;

    if (isNearBottom && hasMore && !loadingCountries) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const { execute: updateShippingPort, isLoading } = useGenericMutation({
    mutation: UPDATE_SHIPPING_PORT,
    onSuccess: () => {
      onClose();
      toast.success("Shipping port updated successfully! ✅");
      refetch();
    },
    onError: (error) => {
      console.log("Error updating shipping port:", error);
      toast.error(error.message, { position: "top-right", duration: 3000 });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.nameEn || !formData.nameAr || !formData.port || !formData.countryId) {
      toast.error("Please fill all required fields", { position: "top-right", duration: 3000 });
      return;
    }
    
    updateShippingPort({
      updateShippingPortResponseInput: formData,
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update Shipping Port</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
          <div className="space-y-2">
              <Label>Country</Label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex relative h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={loadingCountries}
                >
                  {formData.countryId
                    ? loadedCountries.find((c) => c._id === formData.countryId)?.nameEn || 
                      (shippingPort.countryId ? shippingPort.countryId.nameEn : "Select country")
                    : "Select country"}
                  <ChevronDown className="ml-2 h-4 w-4 opacity-50 absolute right-2" />
                </button>
                {isDropdownOpen && (
                  <div
                    className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto border border-input bg-background rounded-md shadow-lg"
                    onScroll={handleScroll}
                  >
                    {loadedCountries.map((country) => (
                      <div
                        key={country._id}
                        onClick={() => {
                          handleSelectChange("countryId", country._id);
                          setIsDropdownOpen(false);
                        }}
                        className={`px-3 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer ${
                          formData.countryId === country._id ? 'bg-accent text-accent-foreground' : ''
                        }`}
                      >
                        {country.nameEn}
                      </div>
                    ))}
                    {loadingCountries && (
                      <div className="px-3 py-2 text-muted-foreground">
                        Loading more countries...
                      </div>
                    )}
                    {!hasMore && loadedCountries.length > 0 && (
                      <div className="px-3 py-2 text-muted-foreground">
                        No more countries
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="nameEn">English Name</Label>
              <Input
                id="nameEn"
                name="nameEn"
                value={formData.nameEn}
                onChange={handleInputChange}
                placeholder="Enter English name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="nameAr">Arabic Name</Label>
              <Input
                id="nameAr"
                name="nameAr"
                value={formData.nameAr}
                onChange={handleInputChange}
                placeholder="Enter Arabic name"
                required
                className="font-arabic"
                dir="rtl"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="port">Port Type</Label>
              <Select
                value={formData.port}
                onValueChange={(value) => handleSelectChange("port", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select port type" />
                </SelectTrigger>
                <SelectContent>
                  {portTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            
          </div>
          
          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !formData.nameEn || !formData.nameAr || !formData.port || !formData.countryId}
            >
              {isLoading ? "Updating..." : "Update Port"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateShippingPortModal;