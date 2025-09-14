'use client'

import { usePathname } from "next/navigation";
// import HomeButton from "@/components/HomeButton";
import SupplyChainBackdrop from "@/components/SupplyChainBackdrop";

export default function PageWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <div className="relative isolate flex h-screen w-full flex-col bg-gray-900 text-white">
      <SupplyChainBackdrop className={isHomePage ? "" : "opacity-25"} />
      <div className="flex-grow overflow-y-auto">{children}</div>
    </div>
  );
}
