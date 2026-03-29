import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

export default function ParentDashboard() {
  const [profile, setProfile] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
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

      if (profile?.role !== "parent") return navigate("/login");

      const { data: linkedStudents } = await supabase
        .from("profiles")
        .select("*, payments(*, fees(name))")
        .eq("linked_parent_id", user.id);

      setStudents(linkedStudents || []);
      setLoading(false);
    };
    fetchData();
  }, []);

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
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-700">
          FeePay — Parent Portal
        </h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-semibold flex items-center justify-center">
              {profile?.full_name?.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-slate-600">{profile?.full_name}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-sm text-slate-500 hover:text-red-500 transition"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {students.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 text-center">
            <p className="text-slate-400 text-sm">
              No students linked to your account yet.
            </p>
            <p className="text-slate-400 text-xs mt-1">
              Ask your child to add your email when registering.
            </p>
          </div>
        ) : (
          students.map((student) => {
            const totalPaid =
              student.payments
                ?.filter((p) => p.status === "confirmed")
                .reduce((sum, p) => sum + p.amount_paid, 0) || 0;

            return (
              <div
                key={student.id}
                className="bg-white rounded-xl shadow-sm border border-slate-100"
              >
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                  <div>
                    <h2 className="font-semibold text-slate-800">
                      {student.full_name}
                    </h2>
                    <p className="text-sm text-slate-500">
                      Matric No: {student.student_id}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Total Paid</p>
                    <p className="text-lg font-bold text-green-600">
                      ₦{totalPaid.toLocaleString()}
                    </p>
                  </div>
                </div>

                {student.payments?.length === 0 ? (
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
                      {student.payments?.map((payment) => (
                        <tr
                          key={payment.id}
                          className="border-t border-slate-100"
                        >
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
                          <td className="px-6 py-3">
                            {payment.receipt_number}
                          </td>
                          <td className="px-6 py-3">
                            {new Date(
                              payment.payment_date
                            ).toLocaleDateString()}
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
            );
          })
        )}
      </div>
    </div>
  );
}
