export const metadata = {
  title: "Admin Login — Internal",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <p className="text-3xl">🔐</p>
          <h1 className="text-white font-black text-xl">Admin Access</h1>
          <p className="text-slate-400 text-sm">AI Sales Closer · Internal Dashboard</p>
        </div>
        <AdminLoginForm />
      </div>
    </div>
  );
}

// Client form component inline
import AdminLoginForm from "./AdminLoginForm";
