//src/app/AppWrapper.tsx
"use client";

import { useState } from "react";
import Header from "@/components/header";
import Footer from "@/components/Footer";
import Sidebar from "@/components/sidebar";
import DrawerLayout from "@/components/DrawerLayout";

export default function AppWrapper({ children }: { children: React.ReactNode }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  return (
    <>
      <Header openDrawer={openDrawer} />

      <div className="flex flex-grow w-full">
        <div className="hidden sm:block">
          <Sidebar setExpanded={setSidebarExpanded} />
        </div>

        <main
           className={`flex-grow pt-0 px-2 min-w-0 overflow-x-auto ${
            sidebarExpanded ? "sm:ml-20" : "sm:ml-5"
          }`}
        >
          {children}
        </main>
      </div>

      <div className="sm:hidden">
        <DrawerLayout isOpen={isDrawerOpen} closeDrawer={closeDrawer} />
      </div>

      <Footer />
    </>
  );
}
