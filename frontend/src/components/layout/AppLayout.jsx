import Sidebar from "./Sidebar";
import Header from "./Header";

const AppLayout = ({ children }) => {
  return (
    <div className="app-shell">
      <Sidebar />

      <div className="main-area">
        <Header />

        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;