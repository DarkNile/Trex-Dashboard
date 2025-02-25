import React, { useEffect, useState } from "react";
import { Button } from "@/components/UI/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { ChevronDown, Plus, Trash } from "lucide-react";
import { gql } from "@apollo/client";
import { useGenericMutation } from "@/hooks/generic/useGenericMutation";
import { useGenericQuery } from "@/hooks/generic/useGenericQuery";
import toast from "react-hot-toast";

const CREATE_MANY_SHIPPING_PORTS = gql`
  mutation CreateManyShippingPort(
    $createShippingPortInput: CreateManyShippingPortDTO!
  ) {
    createManyShippingPort(createShippingPortInput: $createShippingPortInput)
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

interface CreateShippingPortModalProps {
  refetch: () => void;
}

// Interface for a port entry
interface PortEntry {
  nameEn: string;
  nameAr: string;
  port: string;
}

const portTypes = [
  { value: "seaport", label: "Sea Port" },
  { value: "airport", label: "Air Port" },
  { value: "landPort", label: "Land Port" },
];

const CreateShippingPortModal: React.FC<CreateShippingPortModalProps> = ({
  refetch,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Updated form data to include an array of ports
  const [countryId, setCountryId] = useState("");
  const [ports, setPorts] = useState<PortEntry[]>([{
    nameEn: "",
    nameAr: "",
    port: "",
  }]);
  
  const [hasMore, setHasMore] = useState(true);
  const [loadedCountries, setLoadedCountries] = useState<
    Array<{ _id: string; nameEn: string }>
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
  
  useEffect(() => {
    if (!open) {
      setCurrentPage(1);
      setLoadedCountries([]);
      setHasMore(true);
      setCountryId("");
      setPorts([{ nameEn: "", nameAr: "", port: "" }]);
    }
  }, [open]);
  
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 10;

    if (isNearBottom && hasMore && !loadingCountries) {
      setCurrentPage((prev) => prev + 1);
    }
  };
  
  // Updated mutation to handle multiple ports
  const { execute: createManyShippingPorts, isLoading } = useGenericMutation({
    mutation: CREATE_MANY_SHIPPING_PORTS,
    onSuccess: () => {
      setOpen(false);
      setCountryId("");
      setPorts([{ nameEn: "", nameAr: "", port: "" }]);
      toast.success("Shipping ports created successfully! ✅");
      refetch();
    },
    onError: (error) => {
      console.log("Error creating shipping ports:", error);
      toast.error(error.message, { position: "top-right", duration: 3000 });
    },
  });

  const handleAddPort = () => {
    setPorts([...ports, { nameEn: "", nameAr: "", port: "" }]);
  };

  const handleRemovePort = (index: number) => {
    const newPorts = [...ports];
    newPorts.splice(index, 1);
    setPorts(newPorts);
  };

  const handlePortChange = (
    index: number,
    field: keyof PortEntry,
    value: string
  ) => {
    const newPorts = [...ports];
    newPorts[index][field] = value;
    setPorts(newPorts);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate that we have at least one port
    if (ports.length === 0) {
      toast.error("Please add at least one port", { position: "top-right", duration: 3000 });
      return;
    }

    // Validate that all port entries are complete
    const isValid = ports.every(port => port.nameEn && port.nameAr && port.port);
    if (!isValid) {
      toast.error("Please fill all port details", { position: "top-right", duration: 3000 });
      return;
    }

    // Format the ports exactly as shown in the Postman example
    const portsString = ports
      .map(port => `{ nameEn: '${port.nameEn}', nameAr:'${port.nameAr}',port: '${port.port}'}`)
      .join(" , ");

    createManyShippingPorts({
      createShippingPortInput: {
        countryId,
        ports: portsString
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mb-4">
          <Plus className="w-4 h-4 mr-2" />
          Add New Shipping Ports
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Shipping Ports</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Country</Label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex relative h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={loadingCountries}
              >
                {countryId
                  ? loadedCountries.find((c) => c._id === countryId)?.nameEn
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
                        setCountryId(country._id);
                        setIsDropdownOpen(false);
                      }}
                      className="px-3 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer"
                    >
                      {country.nameEn}
                    </div>
                  ))}
                  {loadingCountries && (
                    <div className="px-3 py-2 text-muted-foreground">
                      Loading more countries...
                    </div>
                  )}
                  {!hasMore && (
                    <div className="px-3 py-2 text-muted-foreground">
                      No more countries
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Ports</Label>
              <Button type="button" variant="outline" onClick={handleAddPort} size="sm">
                <Plus className="w-4 h-4 mr-1" /> Add Port
              </Button>
            </div>

            {ports.map((port, index) => (
              <div key={index} className="border p-4 rounded-md space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Port #{index + 1}</h4>
                  {ports.length > 1 && (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleRemovePort(index)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`nameEn-${index}`}>English Name</Label>
                  <Input
                    id={`nameEn-${index}`}
                    value={port.nameEn}
                    onChange={(e) => handlePortChange(index, "nameEn", e.target.value)}
                    placeholder="Enter English name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`nameAr-${index}`}>Arabic Name</Label>
                  <Input
                    id={`nameAr-${index}`}
                    value={port.nameAr}
                    onChange={(e) => handlePortChange(index, "nameAr", e.target.value)}
                    placeholder="Enter Arabic name"
                    required
                    className="font-arabic"
                    dir="rtl"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`port-${index}`}>Port Type</Label>
                  <Select
                    value={port.port}
                    onValueChange={(value) => handlePortChange(index, "port", value)}
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
            ))}
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || !countryId || ports.length === 0}
          >
            {isLoading ? "Creating..." : "Create Shipping Ports"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateShippingPortModal;