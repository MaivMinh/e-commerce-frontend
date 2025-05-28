import React, {
  createContext,
  useState,
  useContext,
} from "react";
import apiClient from "../services/apiClient";

export const CartContext = createContext({
  selectedItems: [],
  setSelectedItems: () => {},
  appliedVoucher: null,
  setAppliedVoucher: () => {},
  loading: true,
});

export const CartContextProvider = ({ children }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [appliedVoucher, setAppliedVoucher] = useState(null);

  return (
    <CartContext.Provider
      value={{
        selectedItems: selectedItems,
        setSelectedItems: setSelectedItems,
        appliedVoucher: appliedVoucher,
        setAppliedVoucher: setAppliedVoucher,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
// Custom hook to access the context
export const useCartContext = () => useContext(CartContext);
