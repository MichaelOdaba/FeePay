import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate, useParams } from "react-router-dom";

export default function PayFee() {
  const { feeId } = useParams();
  const navigate = useNavigate();
  const [fee, setFee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [card, setCard] = useState({
    name: "",
    number: "",
    expiry: "",
    cvv: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFee = async () => {
      const { data } = await supabase
        .from("fees")
        .select("*")
        .eq("id", feeId)
        .single();
      setFee(data);
      setLoading(false);
    };
    fetchFee();
  }, [feeId]);

  const handlePay = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Check for duplicate payment
    const { data: existing } = await supabase
      .from("payments")
      .select("id")
      .eq("student_id", user.id)
      .eq("fee_id", feeId)
      .neq("status", "rejected");

    if (existing && existing.length > 0) {
      setError("You have already submitted a payment for this fee.");
      setProcessing(false);
      return;
    }

    // Simulate payment processing delay
    await new Promise((res) => setTimeout(res, 2000));

    const { error: paymentError } = await supabase.from("payments").insert({
      student_id: user.id,
      fee_id: feeId,
      amount_paid: fee.amount,
      status: "pending",
    });

    if (paymentError) {
      setError(paymentError.message);
      setProcessing(false);
      return;
    }

    // Notify student
    await supabase.from("notifications").insert({
      user_id: user.id,
      message: `Your payment of ₦${fee.amount.toLocaleString()} for ${
        fee.name
      } has been submitted and is pending confirmation.`,
    });
    navigate("/student?payment=success");
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Loading...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-md">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/student")}
            className="text-sm text-blue-600 hover:underline mb-4 block"
          >
            ← Back to Dashboard
          </button>
          <h2 className="text-xl font-bold text-slate-800">Make Payment</h2>
          <p className="text-slate-500 text-sm mt-1">{fee?.name}</p>
        </div>

        {/* Fee Summary */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Fee</span>
            <span className="font-medium">{fee?.name}</span>
          </div>
          <div className="flex justify-between text-sm mt-2">
            <span className="text-slate-600">Semester</span>
            <span className="font-medium">{fee?.semester}</span>
          </div>
          <div className="flex justify-between mt-3 pt-3 border-t border-blue-100">
            <span className="font-semibold text-slate-800">Total</span>
            <span className="font-bold text-blue-700 text-lg">
              ₦{fee?.amount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Simulated Card Form */}
        <form onSubmit={handlePay} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Cardholder Name
            </label>
            <input
              required
              placeholder="Michael Odaba"
              value={card.name}
              onChange={(e) => setCard({ ...card, name: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Card Number
            </label>
            <input
              required
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              value={card.number}
              onChange={(e) => setCard({ ...card, number: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Expiry Date
              </label>
              <input
                required
                placeholder="MM/YY"
                maxLength={5}
                value={card.expiry}
                onChange={(e) => setCard({ ...card, expiry: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                CVV
              </label>
              <input
                required
                placeholder="123"
                maxLength={3}
                value={card.cvv}
                onChange={(e) => setCard({ ...card, cvv: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={processing}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50"
          >
            {processing
              ? "Processing payment..."
              : `Pay ₦${fee?.amount.toLocaleString()}`}
          </button>

          <p className="text-center text-xs text-slate-400">
            🔒 This is a simulated payment. No real transaction will occur.
          </p>
        </form>
      </div>
    </div>
  );
}
