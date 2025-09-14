'use client'

import { usePathname } from "next/navigation";
import HomeButton from "@/components/HomeButton";
import SupplyChainBackdrop from "@/components/SupplyChainBackdrop";

export default function PageWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <>
      {!isHomePage && <HomeButton />}
      {isHomePage ? <SupplyChainBackdrop /> : <SupplyChainBackdrop className="opacity-25" />}
      {children}
    </>
  );
}
