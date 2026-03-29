import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

export default function AdminDashboard() {
  const [profile, setProfile] = useState(null);
  const [payments, setPayments] = useState([]);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newFee, setNewFee] = useState({
    name: "",
    amount: "",
    semester: "",
    academic_year: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return navigate("/login");

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, full_name")

        .eq("id", user.id)
        .single();

      setProfile(profile);

      if (profile?.role !== "admin") return navigate("/login");

      const { data: paymentsData } = await supabase
        .from("payments")
        .select("*, profiles(full_name, student_id), fees(name)");
      setPayments(paymentsData || []);

      const { data: feesData } = await supabase.from("fees").select("*");
      setFees(feesData || []);

      setLoading(false);
    };
    fetchData();
  }, []);

  const handleAddFee = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from("fees").insert({
      name: newFee.name,
      amount: parseFloat(newFee.amount),
      semester: newFee.semester,
      academic_year: newFee.academic_year,
    });
    if (!error) {
      const { data } = await supabase.from("fees").select("*");
      setFees(data || []);
      setNewFee({ name: "", amount: "", semester: "", academic_year: "" });
    }
  };

  const handleUpdateStatus = async (paymentId, status) => {
    await supabase.from("payments").update({ status }).eq("id", paymentId);
    // Find the payment to get student_id
    const payment = payments.find((p) => p.id === paymentId);

    // Notify student
    await supabase.from("notifications").insert({
      user_id: payment.student_id,
      message: `Your payment of ₦${payment.amount_paid.toLocaleString()} has been ${status}.`,
    });
    setPayments(
      payments.map((p) => (p.id === paymentId ? { ...p, status } : p))
    );
  };

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
        <h1 className="text-xl font-bold text-blue-700">FeePay — Admin</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-semibold flex items-center justify-center">
              {profile.full_name.charAt(0)}
            </div>
            <span className="text-sm text-slate-600">{profile.full_name}</span>
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
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Add Fee Form */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h2 className="font-semibold text-slate-800 mb-4">Add New Fee</h2>
          <form
            onSubmit={handleAddFee}
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            <input
              required
              placeholder="Fee Name"
              value={newFee.name}
              onChange={(e) => setNewFee({ ...newFee, name: e.target.value })}
              className="border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              required
              type="number"
              placeholder="Amount (₦)"
              value={newFee.amount}
              onChange={(e) => setNewFee({ ...newFee, amount: e.target.value })}
              className="border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              placeholder="Semester (e.g. First)"
              value={newFee.semester}
              onChange={(e) =>
                setNewFee({ ...newFee, semester: e.target.value })
              }
              className="border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              placeholder="Academic Year (e.g. 2024/2025)"
              value={newFee.academic_year}
              onChange={(e) =>
                setNewFee({ ...newFee, academic_year: e.target.value })
              }
              className="border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="md:col-span-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition"
            >
              Add Fee
            </button>
          </form>
        </div>

        {/* Fee List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">Fee Structure</h2>
          </div>
          {fees.length === 0 ? (
            <p className="text-slate-400 text-sm px-6 py-4">
              No fees added yet.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-3 text-left">Fee Name</th>
                  <th className="px-6 py-3 text-left">Amount</th>
                  <th className="px-6 py-3 text-left">Semester</th>
                  <th className="px-6 py-3 text-left">Academic Year</th>
                </tr>
              </thead>
              <tbody>
                {fees.map((fee) => (
                  <tr key={fee.id} className="border-t border-slate-100">
                    <td className="px-6 py-3">{fee.name}</td>
                    <td className="px-6 py-3">
                      ₦{fee.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-3">{fee.semester}</td>
                    <td className="px-6 py-3">{fee.academic_year}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">All Payments</h2>
          </div>
          {payments.length === 0 ? (
            <p className="text-slate-400 text-sm px-6 py-4">No payments yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-3 text-left">Student</th>
                  <th className="px-6 py-3 text-left">Matric No.</th>
                  <th className="px-6 py-3 text-left">Fee</th>
                  <th className="px-6 py-3 text-left">Amount</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-t border-slate-100">
                    <td className="px-6 py-3">{payment.profiles?.full_name}</td>
                    <td className="px-6 py-3">
                      {payment.profiles?.student_id}
                    </td>
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
                    <td className="px-6 py-3 flex gap-2">
                      <button
                        onClick={() =>
                          handleUpdateStatus(payment.id, "confirmed")
                        }
                        className="text-green-600 hover:underline text-xs font-medium"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() =>
                          handleUpdateStatus(payment.id, "rejected")
                        }
                        className="text-red-500 hover:underline text-xs font-medium"
                      >
                        Reject
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
