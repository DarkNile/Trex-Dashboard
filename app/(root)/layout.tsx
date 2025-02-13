import Sidebar from "@/components/UI/drawer/Sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="w-full overflow-x-hidden h-screen flex flex-row">
      <Sidebar />
      <div className="flex-1 w-[calc(100%-255px)]">{children}</div>
    </div>
  );
}
