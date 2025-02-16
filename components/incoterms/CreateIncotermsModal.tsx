import React, { useState } from "react";
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
import { Plus } from "lucide-react";
import { gql } from "@apollo/client";
import { useGenericMutation } from "@/hooks/generic/useGenericMutation";
import { toast } from "react-hot-toast";

const CREATE_INCOTERM = gql`
  mutation CreateIncoterm($CreateIncotermInput: CreateIncotermDTO!) {
    createIncoterm(CreateIncotermInput: $CreateIncotermInput)
  }
`;

interface CreateIncotermModalProps {
  onSuccess?: () => void;
}

const CreateIncotermModal: React.FC<CreateIncotermModalProps> = ({
  onSuccess,
}) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    insurance: "",
    internalUnloading: "",
    externalUnloading: "",
    internalFreight: "",
    externalFreight: "",
  });

  const { execute: createIncoterm, isLoading } = useGenericMutation({
    mutation: CREATE_INCOTERM,
    onSuccess: () => {
      setOpen(false);
      setFormData({
        name: "",
        code: "",
        insurance: "",
        internalUnloading: "",
        externalUnloading: "",
        internalFreight: "",
        externalFreight: "",
      });
      toast.success("Incoterm created successfully! ✅");
      onSuccess?.();
    },
    onError: (error) => {
      console.log("Error creating incoterm:", error);
      toast.error(error.message || "Failed to create incoterm ❌");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Convert string values to numbers for numeric fields
    const numericFormData = {
      name: formData.name,
      code: formData.code,
      insurance: parseFloat(formData.insurance),
      internalUnloading: parseFloat(formData.internalUnloading),
      externalUnloading: parseFloat(formData.externalUnloading),
      internalFreight: parseFloat(formData.internalFreight),
      externalFreight: parseFloat(formData.externalFreight),
    };

    createIncoterm({
      CreateIncotermInput: numericFormData,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mb-4">
          <Plus className="w-4 h-4 mr-2" />
          Add New Incoterm
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Incoterm</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter incoterm name"
              className="w-full"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="code">Code</Label>
            <Input
              id="code"
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              placeholder="Enter incoterm code"
              className="w-full"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="insurance">Insurance Rate</Label>
            <Input
              id="insurance"
              name="insurance"
              type="number"
              step="0.1"
              value={formData.insurance}
              onChange={handleInputChange}
              placeholder="Enter insurance rate"
              className="w-full"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="internalUnloading">Internal Unloading Rate</Label>
            <Input
              id="internalUnloading"
              name="internalUnloading"
              type="number"
              step="0.1"
              value={formData.internalUnloading}
              onChange={handleInputChange}
              placeholder="Enter internal unloading rate"
              className="w-full"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="externalUnloading">External Unloading Rate</Label>
            <Input
              id="externalUnloading"
              name="externalUnloading"
              type="number"
              step="0.1"
              value={formData.externalUnloading}
              onChange={handleInputChange}
              placeholder="Enter external unloading rate"
              className="w-full"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="internalFreight">Internal Freight Rate</Label>
            <Input
              id="internalFreight"
              name="internalFreight"
              type="number"
              step="0.1"
              value={formData.internalFreight}
              onChange={handleInputChange}
              placeholder="Enter internal freight rate"
              className="w-full"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="externalFreight">External Freight Rate</Label>
            <Input
              id="externalFreight"
              name="externalFreight"
              type="number"
              step="0.1"
              value={formData.externalFreight}
              onChange={handleInputChange}
              placeholder="Enter external freight rate"
              className="w-full"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Incoterm"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateIncotermModal;

//
//
//
//
// import React, { useState } from "react";
// import { Button } from "@/components/UI/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/UI/dialog";
// import { Input } from "@/components/UI/input";
// import { Label } from "@/components/UI/label";
// import { Plus } from "lucide-react";
// import { gql } from "@apollo/client";
// import { useGenericMutation } from "@/hooks/generic/useGenericMutation";
// import { toast } from "react-hot-toast";
// import { Switch } from "@/components/UI/switch";

// const CREATE_INCOTERM = gql`
//   mutation CreateIncoterm(
//     $name: String!
//     $code: String!
//     $insurance: Boolean!
//     $internalUnloading: Boolean!
//     $externalUnloading: Boolean!
//     $internalFreight: Boolean!
//     $externalFreight: Boolean!
//   ) {
//     createIncoterm(
//       CreateIncotermInput: {
//         name: $name
//         code: $code
//         insurance: $insurance
//         internalUnloading: $internalUnloading
//         externalUnloading: $externalUnloading
//         internalFreight: $internalFreight
//         externalFreight: $externalFreight
//       }
//     )
//   }
// `;

// interface CreateIncotermModalProps {
//   onSuccess?: () => void;
//   refetch?: () => void;
// }

// const CreateIncotermModal: React.FC<CreateIncotermModalProps> = ({
//   onSuccess,
// }) => {
//   const [open, setOpen] = useState(false);
//   const [formData, setFormData] = useState({
//     name: "",
//     code: "",
//     insurance: false,
//     internalUnloading: false,
//     externalUnloading: false,
//     internalFreight: false,
//     externalFreight: false,
//   });

//   const { execute: createIncoterm, isLoading } = useGenericMutation({
//     mutation: CREATE_INCOTERM,
//     onSuccess: () => {
//       setOpen(false);
//       setFormData({
//         name: "",
//         code: "",
//         insurance: false,
//         internalUnloading: false,
//         externalUnloading: false,
//         internalFreight: false,
//         externalFreight: false,
//       });
//       toast.success("Incoterm created successfully! ✅");
//       onSuccess?.();
//     },
//     onError: (error) => {
//       console.log("Error creating incoterm:", error);
//       toast.error(error.message || "Failed to create incoterm ❌");
//     },
//   });

//   const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     createIncoterm({
//       ...formData,
//     });
//   };

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleSwitchChange = (name: string) => (checked: boolean) => {
//     setFormData((prev) => ({
//       ...prev,
//       [name]: checked,
//     }));
//   };

//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogTrigger asChild>
//         <Button className="mb-4">
//           <Plus className="w-4 h-4 mr-2" />
//           Add New Incoterm
//         </Button>
//       </DialogTrigger>
//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle>Create New Incoterm</DialogTitle>
//         </DialogHeader>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div className="space-y-2">
//             <Label htmlFor="name">Name</Label>
//             <Input
//               id="name"
//               name="name"
//               value={formData.name}
//               onChange={handleInputChange}
//               placeholder="Enter incoterm name"
//               className="w-full"
//               required
//             />
//           </div>
//           <div className="space-y-2">
//             <Label htmlFor="code">Code</Label>
//             <Input
//               id="code"
//               name="code"
//               value={formData.code}
//               onChange={handleInputChange}
//               placeholder="Enter incoterm code"
//               className="w-full"
//               required
//             />
//           </div>
//           <div className="space-y-4">
//             <div className="flex items-center justify-between">
//               <Label htmlFor="insurance">Insurance</Label>
//               <Switch
//                 id="insurance"
//                 checked={formData.insurance}
//                 onCheckedChange={handleSwitchChange("insurance")}
//               />
//             </div>
//             <div className="flex items-center justify-between">
//               <Label htmlFor="internalUnloading">Internal Unloading</Label>
//               <Switch
//                 id="internalUnloading"
//                 checked={formData.internalUnloading}
//                 onCheckedChange={handleSwitchChange("internalUnloading")}
//               />
//             </div>
//             <div className="flex items-center justify-between">
//               <Label htmlFor="externalUnloading">External Unloading</Label>
//               <Switch
//                 id="externalUnloading"
//                 checked={formData.externalUnloading}
//                 onCheckedChange={handleSwitchChange("externalUnloading")}
//               />
//             </div>
//             <div className="flex items-center justify-between">
//               <Label htmlFor="internalFreight">Internal Freight</Label>
//               <Switch
//                 id="internalFreight"
//                 checked={formData.internalFreight}
//                 onCheckedChange={handleSwitchChange("internalFreight")}
//               />
//             </div>
//             <div className="flex items-center justify-between">
//               <Label htmlFor="externalFreight">External Freight</Label>
//               <Switch
//                 id="externalFreight"
//                 checked={formData.externalFreight}
//                 onCheckedChange={handleSwitchChange("externalFreight")}
//               />
//             </div>
//           </div>
//           <Button type="submit" className="w-full" disabled={isLoading}>
//             {isLoading ? "Creating..." : "Create Incoterm"}
//           </Button>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default CreateIncotermModal;
