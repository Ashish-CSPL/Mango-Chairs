"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/app/Redux/Store/store";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import {
  CheckCircle,
  Truck,
  CreditCard,
  ShoppingCart,
  FileDown,
} from "lucide-react";

interface Product {
  id: number;
  name: string;
  image: string;
}

interface OrderItem {
  id: number;
  productId: number;
  unitPrice: number;
  quantity: number;
  product: Product;
}

interface Payment {
  paymentType: string;
  transactionId: string;
  paymentDatetime: string;
  status: string;
}

interface Order {
  id: number;
  subTotal: number;
  tax: number;
  discount: number;
  deliveryCharge: number;
  finalTotal: number;
  billingAddress: string;
  deliveryAddress: string;
  orderItems: OrderItem[];
  payment: Payment;
  is_payment_done: boolean;
  createdAt: string;
  status: string;
}

export default function OrderConfirmationPage() {
  const pathname = usePathname();
  const orderId = pathname.split("/").pop();
  const token = useSelector((state: RootState) => state.auth.token);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(true);
  const { width, height } = useWindowSize();

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId || !token) return;

      try {
        setLoading(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SECONDARY_API}/order/orderid/${orderId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch order");

        const data = await res.json();
        setOrder(data);

        setTimeout(() => setShowConfetti(false), 5000);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Unable to load your order. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 text-lg">
        Loading your order...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center text-yellow-500">
        Order not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-white py-10 px-4">
      {showConfetti && (
        <Confetti width={width} height={height} numberOfPieces={300} />
      )}

      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-5xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-green-100 text-green-700 px-6 py-5 flex items-center gap-3 justify-center text-center"
        >
          <CheckCircle className="w-8 h-8 text-green-600 animate-pulse" />
          <div>
            <h2 className="text-xl font-bold">Thank you for your purchase!</h2>
            <p>Your order has been placed successfully.</p>
          </div>
        </motion.div>

        {/* Body */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
            <div>
              <div className="flex items-center gap-2 font-semibold text-gray-900">
                <Truck className="w-5 h-5" /> Shipping Address
              </div>
              <p>{order.deliveryAddress}</p>
              <p>
                Status: <span className="font-semibold">{order.status}</span>
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 font-semibold text-gray-900">
                <CreditCard className="w-5 h-5" /> Payment Info
              </div>
              <p>Method: {order.payment.paymentType}</p>
              <p>Transaction ID: {order.payment.transactionId}</p>
              <p>Status: {order.payment.status}</p>
              <p>
                Date: {new Date(order.payment.paymentDatetime).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center gap-2 mb-3 font-semibold text-gray-900 text-lg">
              <ShoppingCart className="w-5 h-5" /> Order Items
            </div>
            <div className="space-y-4">
              {order.orderItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center bg-gray-50 border rounded-lg shadow-sm p-4 gap-4"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-20 h-20 object-cover rounded border"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">
                      {item.product.name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">
                      ₹{item.unitPrice * item.quantity}
                    </p>
                    <p className="text-xs text-gray-500">
                      ₹{item.unitPrice} × {item.quantity}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 bg-gray-100 rounded-lg p-4"
          >
            <div className="flex justify-end text-sm text-gray-700 flex-col md:items-end">
              <p>Subtotal: ₹{order.subTotal}</p>
              <p>Tax: ₹{order.tax}</p>
              <p>Delivery: ₹{order.deliveryCharge}</p>
              <p>Discount: ₹{order.discount}</p>
              <p className="text-xl font-bold text-gray-900 border-t pt-2 mt-2">
                Total: ₹{order.finalTotal}
              </p>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 flex flex-col items-center gap-4"
          >
            <a
              href="/"
              className="inline-block bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-full transition duration-200"
            >
              Continue Shopping
            </a>

            {/* Download Invoice Placeholder */}
            <button
              onClick={() => alert("Invoice download will be available soon.")}
              className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
            >
              <FileDown className="w-4 h-4" /> Download Invoice
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
