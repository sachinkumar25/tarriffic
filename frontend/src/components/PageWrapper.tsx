'use client'

import { usePathname } from "next/navigation";
import BackButton from "@/components/BackButton";
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
      {!isHomePage && <BackButton />}
      {isHomePage ? <SupplyChainBackdrop /> : <SupplyChainBackdrop className="opacity-25" />}
      {children}
    </>
  );
}
