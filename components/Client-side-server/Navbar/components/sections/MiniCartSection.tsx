import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";

interface CartItem {
  image: string;
  name: string;
  quantity: number;
  price: number;
}

interface MiniCartSectionProps {
  cartCount: number;
  cartItems: CartItem[];
  iconColor: string;
}

const MiniCartSection: React.FC<MiniCartSectionProps> = ({
  cartCount,
  cartItems,
  iconColor,
}) => {
  const [showMiniCart, setShowMiniCart] = useState(false);

  return (
    <div
      onMouseEnter={() => setShowMiniCart(true)}
      onMouseLeave={() => setShowMiniCart(false)}
      className="relative cursor-pointer"
    >
      <Link href="/cart">
        <ShoppingBag size={24} color={iconColor} />
        {cartCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {cartCount}
          </span>
        )}
      </Link>
      {showMiniCart && (
        <div
          className="absolute right-0 top-full mt-2 w-80 max-w-full bg-white shadow-lg rounded-lg p-4 z-50"
          style={{ minWidth: "320px" }}
        >
          <h3 className="font-semibold text-lg mb-3 border-b pb-2">
            Cart Items
          </h3>
          {cartItems && cartItems.length > 0 ? (
            <ul className="max-h-64 overflow-y-auto">
              {cartItems.map((item: any, index: number) => (
                <li
                  key={index}
                  className="flex items-center gap-3 mb-3 border-b pb-2 last:border-none"
                >
                  <div className="w-12 h-12 relative flex-shrink-0">
                    <Image
                      src={item.image || "/placeholder.png"}
                      alt={item.name || "Product"}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                  <div className="flex-grow">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-gray-600">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-semibold">
                    ₹{item.price * item.quantity}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">Your cart is empty.</p>
          )}
          <Link
            href="/cart"
            onClick={() => setShowMiniCart(false)}
            className="block mt-4 text-center bg-orange-500 hover:bg-orange-600 text-white py-2 rounded"
          >
            View Cart & Checkout
          </Link>
        </div>
      )}
    </div>
  );
};

export default MiniCartSection;
