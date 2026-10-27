import Header from "../components/Header";
import Footer from "../components/Footer";

export const metadata = {
  // Inherit metadata from root layout
};

/**
 * Public layout for the Arabic website.
 * It renders the global Header and Footer while preserving the
 * Arabic RTL document settings defined in the root layout.
 */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {/* Main content area */}
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}
