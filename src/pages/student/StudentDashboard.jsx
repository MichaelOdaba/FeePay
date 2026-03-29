import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";
import NotificationBell from "../../components/NotificationBell";
import { User } from "lucide-react";
import { LogOut } from "lucide-react";

export default function StudentDashboard() {
  const [profile, setProfile] = useState(null);
  const [fees, setFees] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return navigate("/login");

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(profileData);

      const { data: feesData } = await supabase.from("fees").select("*");
      setFees(feesData || []);

      const { data: paymentsData } = await supabase
        .from("payments")
        .select("*, fees(name)")
        .eq("student_id", user.id);
      setPayments(paymentsData || []);

      setLoading(false);
    };

    fetchData();
  }, []);

  const totalFees = fees.reduce((sum, f) => sum + f.amount, 0);
  const totalPaid = payments
    .filter((p) => p.status === "confirmed")
    .reduce((sum, p) => sum + p.amount_paid, 0);
  const outstanding = totalFees - totalPaid;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Loading...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-700">FeePay</h1>
        <div className="flex items-center gap-4">
          <NotificationBell />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-semibold flex items-center justify-center">
              {profile?.full_name?.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-slate-600">{profile?.full_name}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-sm text-slate-600 hover:text-red-500 transition"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-5 border border-slate-100">
            <p className="text-sm text-slate-500">Total Fees</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">
              ₦{totalFees.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 border border-slate-100">
            <p className="text-sm text-slate-500">Amount Paid</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              ₦{totalPaid.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 border border-slate-100">
            <p className="text-sm text-slate-500">Outstanding Balance</p>
            <p className="text-2xl font-bold text-red-500 mt-1">
              ₦{outstanding.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Fee Structure */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 mb-8">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">Fee Structure</h2>
          </div>
          {fees.length === 0 ? (
            <p className="text-slate-400 text-sm px-6 py-4">
              No fees have been added yet.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-3 text-left">Fee Name</th>
                  <th className="px-6 py-3 text-left">Semester</th>
                  <th className="px-6 py-3 text-left">Amount</th>
                  <th className="px-6 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {fees.map((fee) => (
                  <tr key={fee.id} className="border-t border-slate-100">
                    <td className="px-6 py-3">{fee.name}</td>
                    <td className="px-6 py-3">{fee.semester}</td>
                    <td className="px-6 py-3">
                      ₦{fee.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-3">
                      <button
                        onClick={() => navigate(`/student/pay/${fee.id}`)}
                        className="text-blue-600 hover:underline text-sm font-medium"
                      >
                        Pay Now
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Payment History */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">Payment History</h2>
          </div>
          {payments.length === 0 ? (
            <p className="text-slate-400 text-sm px-6 py-4">
              No payments made yet.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-3 text-left">Fee</th>
                  <th className="px-6 py-3 text-left">Amount</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Receipt No.</th>
                  <th className="px-6 py-3 text-left">Date</th>
                  <th className="px-6 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-t border-slate-100">
                    <td className="px-6 py-3">{payment.fees?.name}</td>
                    <td className="px-6 py-3">
                      ₦{payment.amount_paid.toLocaleString()}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          payment.status === "confirmed"
                            ? "bg-green-100 text-green-700"
                            : payment.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-3">{payment.receipt_number}</td>
                    <td className="px-6 py-3">
                      {new Date(payment.payment_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3">
                      <button
                        onClick={() => navigate(`/receipt/${payment.id}`)}
                        className="text-blue-600 hover:underline text-sm font-medium"
                      >
                        View Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
