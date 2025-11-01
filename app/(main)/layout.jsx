"use client";

import { Authenticated, AuthLoading } from "convex/react";
import ConditionalHeader from "@/components/ConditionalHeader";
import React from "react";

const MainLayout = ({ children }) => {
  return (
    <>
      <AuthLoading>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </AuthLoading>

      <Authenticated>
        <ConditionalHeader />
        <main className="min-h-screen">
          <div className="container mx-auto mt-24 mb-20 px-4">{children}</div>
        </main>
      </Authenticated>
    </>
  );
};

export default MainLayout;