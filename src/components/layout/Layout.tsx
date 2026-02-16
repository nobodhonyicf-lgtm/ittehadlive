import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";

const Layout = ({ children, fullWidth }: { children: ReactNode; fullWidth?: boolean }) => {
  return (
    <div className="min-h-screen flex flex-col bg-muted/50">
      <Header />
      <main className="flex-1">
        {fullWidth ? children : (
          <div className="max-w-[1200px] mx-auto">
            {children}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
