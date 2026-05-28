import { useState, useMemo } from "react";

export function useCardForm() {
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  const handleCardNumberChange = (e) => {
    let v = e.target.value.replace(/\D/g, "").slice(0, 16);
    setCardNumber(v.replace(/(\d{4})(?=\d)/g, "$1 "));
  };

  const handleExpiryChange = (e) => {
    let v = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (v.length > 2) v = `${v.slice(0, 2)} / ${v.slice(2)}`;
    setExpiry(v);
  };

  const handleCvcChange = (e) => {
    setCvc(e.target.value.replace(/\D/g, "").slice(0, 3));
  };

  const isValid = useMemo(
    () =>
      cardNumber.replace(/\s/g, "").length >= 14 &&
      cardName.trim().length >= 2 &&
      expiry.replace(/\D/g, "").length === 4 &&
      cvc.length >= 3,
    [cardNumber, cardName, expiry, cvc]
  );

  return {
    cardNumber,
    cardName,
    expiry,
    cvc,
    isValid,
    handleCardNumberChange,
    handleExpiryChange,
    handleCvcChange,
    setCardName,
  };
}
