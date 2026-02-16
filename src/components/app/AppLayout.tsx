import { ReactNode } from "react";
import AppBottomNav from "./AppBottomNav";

const AppLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background pb-16">
      <main className="flex-1">{children}</main>
      <AppBottomNav />
    </div>
  );
};

export default AppLayout;
