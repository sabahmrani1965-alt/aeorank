import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Wraps every public marketing page (homepage, about, services, industries,
// blog, contact, terms, privacy, checkout) in the light theme — see
// .light-theme in app/globals.css. The logged-in dashboard, admin, and
// CrewQuest/poster pages deliberately keep the original dark theme and
// render Header/Footer directly instead of through this wrapper.
export default function MarketingLayout({ children }) {
  return (
    <div className="light-theme">
      <Header />
      {children}
      <Footer />
    </div>
  );
}
