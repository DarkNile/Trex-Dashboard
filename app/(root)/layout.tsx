import Sidebar from "@/components/UI/drawer/Sidebar";
import Navbar from "@/components/UI/header/NavBar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="w-full overflow-x-hidden min-h-screen flex flex-row mb-[-2rem] bg-background text-foreground transition-colors duration-300">
      <Sidebar />
      <div className="flex-1 w-[calc(100%-255px)]">
        <Navbar />
        <main className="p-5">{children}</main>
      </div>
    </div>
  );
}
