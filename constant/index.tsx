import {
  Flag,
  Handshake,
  HomeIcon,
  ShoppingBag,
  ShoppingCart,
  SquareArrowRightIcon,
  TableOfContents,
  Weight,
} from "lucide-react";

interface MenuItem {
  name: string;
  id: number;
  url: string;
  icon: React.ReactNode;
}

export const menuItems: MenuItem[] = [
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
  {
    name: "Shipping Port",
    icon: <ShoppingBag />,
    id: 9,
    url: "/shipping-port",
  },
  {
    name: "Schedule Tax",
    icon: <Handshake />,
    id: 10,
    url: "/schedule-tax",
  },
  {
    name: "Incoterms",
    icon: <TableOfContents />,
    id: 11,
    url: "/incoterms",
  },
];
