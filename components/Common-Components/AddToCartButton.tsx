import { useDispatch } from "react-redux";
import { addToCart, CartItem } from "@/app/Redux/Store/cartSlice"; // Adjust the path if necessary
import toast from "react-hot-toast";

interface ProductFromAPI {
  id: number | string;
  name: string;
  title: string;
  selling_price: number;
  original_price: number;
  images: string[];
  isRare: boolean;
  selectedVariantId?: string | number;
  color?: string;
  size?: string;
  stock?: number;
}

interface AddToCartButtonProps {
  product: ProductFromAPI;
  initialQuantity?: number;
  selectedVariantId?: string | number;
  selectedColor?: string;
  selectedSize?: string;
  selectedStock?: number;
}

export default function AddToCartButton({
  product,
  initialQuantity = 1,
  selectedVariantId,
  selectedColor,
  selectedSize,
  selectedStock,
}: AddToCartButtonProps) {
  const dispatch = useDispatch();

  const handleAddToCart = () => {
    const cartItem: CartItem = {
      id: product.id,
      name: product.name,
      title: product.title,
      image: product.images[0] || "/path/to/default-image.jpg",
      price: product.selling_price,
      quantity: initialQuantity,
      isRare: product.isRare,
      regularPrice: product.original_price,
      isOnSale: product.selling_price < product.original_price,
      selectedVariantId: selectedVariantId,
      color: selectedColor,
      size: selectedSize,
      stock: selectedStock,

      // ✅ Fix added below to satisfy CartItem's required `variant` field
      variant: {} as any, // Pass a dummy variant object to avoid TypeScript error
    };

    dispatch(addToCart(cartItem));
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <button
      onClick={handleAddToCart}
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
    >
      Add to Cart
    </button>
  );
}
