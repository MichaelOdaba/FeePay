import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate, useParams } from "react-router-dom";
import { Printer, ArrowLeft } from "lucide-react";

export default function Receipt() {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayment = async () => {
      const { data } = await supabase
        .from("payments")
        .select(
          "*, profiles(full_name, student_id, email), fees(name, semester, academic_year)"
        )
        .eq("id", paymentId)
        .single();

      setPayment(data);
      setLoading(false);
    };
    fetchPayment();
  }, [paymentId]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Loading receipt...</p>
      </div>
    );

  if (!payment)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Receipt not found.</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Action Bar - hidden on print */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center print:hidden">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
        >
          <Printer size={16} />
          Print Receipt
        </button>
      </div>

      {/* Receipt */}
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          {/* Header */}
          <div className="text-center border-b border-slate-100 pb-6 mb-6">
            <h1 className="text-3xl font-bold text-blue-700">FeePay</h1>
            <p className="text-slate-500 text-sm mt-1">
              Father Adasu University Makurdi (FAUM)
            </p>
            <p className="text-slate-400 text-xs mt-1">
              Official Fee Payment Receipt
            </p>
          </div>

          {/* Receipt Meta */}
          <div className="flex justify-between text-sm mb-6">
            <div>
              <p className="text-slate-400">Receipt No.</p>
              <p className="font-bold text-slate-800">
                {payment.receipt_number}
              </p>
            </div>
            <div className="text-right">
              <p className="text-slate-400">Date Issued</p>
              <p className="font-bold text-slate-800">
                {new Date(payment.payment_date).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Student Info */}
          <div className="bg-slate-50 rounded-xl p-4 mb-6">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
              Student Information
            </h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-slate-400">Full Name</p>
                <p className="font-medium text-slate-800">
                  {payment.profiles?.full_name}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Matric Number</p>
                <p className="font-medium text-slate-800">
                  {payment.profiles?.student_id}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Email</p>
                <p className="font-medium text-slate-800">
                  {payment.profiles?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-slate-50 rounded-xl p-4 mb-6">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
              Payment Details
            </h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-slate-400">Fee Description</p>
                <p className="font-medium text-slate-800">
                  {payment.fees?.name}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Semester</p>
                <p className="font-medium text-slate-800">
                  {payment.fees?.semester}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Academic Year</p>
                <p className="font-medium text-slate-800">
                  {payment.fees?.academic_year}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Payment Status</p>
                <span
                  className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    payment.status === "confirmed"
                      ? "bg-green-100 text-green-700"
                      : payment.status === "rejected"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {payment.status}
                </span>
              </div>
            </div>
          </div>

          {/* Remark */}
          <div className="bg-slate-50 rounded-xl p-4 mb-6">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
              Remark
            </h2>
            <p className="text-sm text-slate-700">{payment.remark}</p>
          </div>

          {/* Amount */}
          <div className="border-t border-slate-100 pt-6 flex justify-between items-center">
            <p className="text-slate-500 font-medium">Total Amount Paid</p>
            <p className="text-3xl font-bold text-blue-700">
              ₦{payment.amount_paid.toLocaleString()}
            </p>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-400">
              This receipt was generated electronically by FeePay.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              For inquiries contact the bursary department at FAUM.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
