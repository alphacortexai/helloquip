'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { usePathname } from "next/navigation";


export default function ClientLayoutWrapper({ children }) {
  const pathname = usePathname();

  const hideNavbarOn = ["/register", "/login"]; // add pages here

  return (
    <>
       {!hideNavbarOn.includes(pathname) && <Navbar />}
      <main>{children}</main>
      {!hideNavbarOn.includes(pathname) &&  <Footer />}
     
    </>
  );
}
