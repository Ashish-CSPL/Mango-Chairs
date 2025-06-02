// Assuming this is within your ProductCard.tsx or SingleProduct.tsx
// where you dispatch the addToCart action

import { useDispatch } from "react-redux";
import { addToCart, CartItem } from "@/app/Redux/Store/cartSlice"; // Adjust the path if necessary
import toast from "react-hot-toast";

// Define the shape of your product data as it comes from the API
interface ProductFromAPI {
  id: number | string; // Ensure this matches your API's ID type
  name: string;
  title: string;
  selling_price: number;
  original_price: number;
  images: string[]; // Assuming this is an array of image URLs
  isRare: boolean;
  // Add any other properties your API product object might have that you need
  // For example, if your product has variants, you might need a 'selectedVariantId' here
  // or pass it separately.
  selectedVariantId?: string | number; // If you handle variants
  color?: string; // If product has color variant
  size?: string; // If product has size variant
  stock?: number; // If product has stock
}

interface AddToCartButtonProps {
  product: ProductFromAPI;
  // If you have a quantity selector on the product page, pass it here
  initialQuantity?: number;
  // If selecting a variant on the product page:
  selectedVariantId?: string | number;
  selectedColor?: string;
  selectedSize?: string;
  selectedStock?: number;
}

export default function AddToCartButton({
  product,
  initialQuantity = 1, // Default to 1 if not provided
  selectedVariantId,
  selectedColor,
  selectedSize,
  selectedStock,
}: AddToCartButtonProps) {
  const dispatch = useDispatch();

  const handleAddToCart = () => {
    // Construct the CartItem object, mapping properties from your API product
    const cartItem: CartItem = {
      id: product.id,
      name: product.name,
      title: product.title,
      // Ensure you pick the correct image URL from the 'images' array
      image: product.images[0] || "/path/to/default-image.jpg", // Use the first image, or provide a fallback
      price: product.selling_price, // Map selling_price to CartItem's price
      quantity: initialQuantity, // Use initialQuantity (defaulting to 1)
      isRare: product.isRare,
      regularPrice: product.original_price, // Map original_price to CartItem's regularPrice
      // Determine if the item is on sale
      isOnSale: product.selling_price < product.original_price,

      // Include variant-specific details if applicable
      selectedVariantId: selectedVariantId,
      color: selectedColor,
      size: selectedSize,
      stock: selectedStock,
      // Add other optional properties from CartItem interface if needed
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
