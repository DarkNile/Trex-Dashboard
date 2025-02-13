import {
  Flag,
  Handshake,
  HomeIcon,
  ShoppingCart,
  SquareArrowRightIcon,
  TableOfContents,
  Weight,
} from "lucide-react";

interface menuItem {
  name: string;
  id: number;
  url: string;
  icon: React.ReactNode;
}

export const menuItems: menuItem[] = [
  {
    name: "Home",
    id: 1,
    url: "/",
    icon: <HomeIcon />,
  },
  {
    name: "Partnter Registration",
    id: 2,
    url: "/partner-registration",
    icon: <SquareArrowRightIcon />,
  },
  {
    name: "Chapters",
    icon: <TableOfContents />,
    id: 3,
    url: "/chapters",
  },
  {
    name: "Products",
    icon: <ShoppingCart />,
    id: 5,
    url: "/products",
  },
  {
    name: "Measurments",
    icon: <Weight />,
    id: 6,
    url: "/measurments",
  },
  {
    name: "Agreements",
    icon: <Handshake />,
    id: 7,
    url: "/agreement",
  },
  {
    name: "Countries",
    icon: <Flag />,
    id: 8,
    url: "/country",
  },
];
