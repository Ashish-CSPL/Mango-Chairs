"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/app/Redux/Store/store";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  order_id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  total: number;
  order_items: OrderItem[];
}

export default function OrderConfirmationPage() {
  const pathname = usePathname();
  const orderId = pathname.split("/").pop();

  const token = useSelector((state: RootState) => state.auth.token);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId || !token) return;

      setLoading(true);
      setError(null);

      try {
       const response = await fetch(
  `${process.env.NEXT_PUBLIC_SECONDARY_API}/order/orderid/${orderId}`,
  {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  }
);

        if (!response.ok) {
          throw new Error("Failed to fetch order.");
        }

        const data = await response.json();
        setOrder(data);
      } catch (err: any) {
        setError("Unable to load your order. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="flex flex-col items-center">
          <svg
            className="animate-spin h-10 w-10 text-blue-600 mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            />
          </svg>
          <p className="text-gray-700 text-lg">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-100 p-4">
        <p className="text-lg font-medium text-red-700">{error}</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-yellow-100 p-4">
        <p className="text-lg font-medium text-yellow-700">
          No order found with this ID.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold text-center text-green-600 mb-4">
          Order Confirmed!
        </h1>
        <p className="text-center text-gray-700 mb-6">
          Thank you for your purchase. Your order ID is{" "}
          <span className="font-semibold">{order.order_id}</span>.
        </p>

        <div className="space-y-4">
          <div className="border-t pt-4">
            <h2 className="text-lg font-semibold mb-2">Customer Details</h2>
            <p>
              <span className="font-medium">Name:</span> {order.name}
            </p>
            <p>
              <span className="font-medium">Email:</span> {order.email}
            </p>
            <p>
              <span className="font-medium">Phone:</span> {order.phone}
            </p>
            <p>
              <span className="font-medium">Shipping Address:</span>{" "}
              {order.address}
            </p>
          </div>

          <div className="border-t pt-4">
            <h2 className="text-lg font-semibold mb-2">Order Summary</h2>
            {order.order_items?.length > 0 ? (
              order.order_items.map((item, index) => (
                <div key={index} className="mb-2">
                  <p>
                    <span className="font-medium">Product:</span> {item.name}
                  </p>
                  <p>
                    <span className="font-medium">Quantity:</span>{" "}
                    {item.quantity}
                  </p>
                  <p>
                    <span className="font-medium">Price:</span> ₹
                    {item.price.toFixed(2)}
                  </p>
                </div>
              ))
            ) : (
              <p>No items found in your order.</p>
            )}
          </div>

          <div className="border-t pt-4 text-right">
            <h2 className="text-lg font-semibold">Total: ₹{order.total}</h2>
          </div>
        </div>
      </div>
    </div>
  );
}
