// Helper function to render prices correctly
export const formatPrice = (price: number, digits: number): string => {
  if (price === undefined || price === null || isNaN(price)) {
    return (0).toFixed(digits);
  }
  return price.toFixed(digits);
};