/**
 * Centralized margin calculation utility
 * Used across the entire application to ensure consistent margin calculations
 */

/**
 * Calculate margin percentage
 * Formula: ((retail - unitCost) / retail) * 100
 * @param {number} retail - Retail price per unit
 * @param {number} caseCost - Case cost
 * @param {number} unitCase - Units per case
 * @returns {number} Margin percentage (0-100)
 */
export const calculateMarginPercentage = (retail, caseCost, unitCase) => {
  const retailPrice = parseFloat(retail) || 0;
  const cost = parseFloat(caseCost) || 0;
  const units = parseFloat(unitCase) || 1;

  // Calculate unit cost
  const unitCost = cost / units;

  // Avoid division by zero
  if (retailPrice <= 0) {
    return 0;
  }

  // Calculate margin percentage
  const marginPercent = ((retailPrice - unitCost) / retailPrice) * 100;

  // Return rounded to 2 decimal places, allow negative values
  return parseFloat(marginPercent.toFixed(2));
};

/**
 * Calculate margin dollar amount
 * Formula: retail - unitCost
 * @param {number} retail - Retail price per unit
 * @param {number} caseCost - Case cost
 * @param {number} unitCase - Units per case
 * @returns {number} Margin in dollars
 */
export const calculateMarginDollar = (retail, caseCost, unitCase) => {
  const retailPrice = parseFloat(retail) || 0;
  const cost = parseFloat(caseCost) || 0;
  const units = parseFloat(unitCase) || 1;

  // Calculate unit cost
  const unitCost = cost / units;

  // Calculate margin in dollars
  const marginDollar = retailPrice - unitCost;

  // Return rounded to 2 decimal places, allow negative values
  return parseFloat(marginDollar.toFixed(2));
};

/**
 * Calculate unit cost from case cost and units per case
 * @param {number} caseCost - Case cost
 * @param {number} unitCase - Units per case
 * @returns {number} Unit cost
 */
export const calculateUnitCost = (caseCost, unitCase) => {
  const cost = Math.max(0, parseFloat(caseCost) || 0);
  const units = Math.max(1, parseFloat(unitCase) || 1);

  return parseFloat((cost / units).toFixed(2));
};

/**
 * Calculate total cost for a quantity
 * @param {number} quantity - Quantity
 * @param {number} caseCost - Case cost
 * @param {number} unitCase - Units per case
 * @returns {number} Total cost
 */
export const calculateTotalCost = (quantity, caseCost, unitCase) => {
  const qty = Math.max(0, parseFloat(quantity) || 0);
  const cost = Math.max(0, parseFloat(caseCost) || 0);

  return parseFloat((qty * cost).toFixed(2));
};

/**
 * Format margin for display
 * @param {number} marginPercent - Margin percentage
 * @returns {string} Formatted margin with % symbol and sign
 */
export const formatMarginDisplay = (marginPercent) => {
  const value = parseFloat(marginPercent) || 0;
  const sign = value < 0 ? "-" : "";
  const absValue = Math.abs(value);
  return `${sign}${absValue.toFixed(2)}%`;
};
