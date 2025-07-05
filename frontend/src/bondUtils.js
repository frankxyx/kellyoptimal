export function bondPrice(face, couponRate, years, marketRate) {
  const coupon = face * couponRate;
  let pvCoupons = 0;
  for (let t = 1; t <= years; t++) {
    pvCoupons += coupon / Math.pow(1 + marketRate, t);
  }
  const pvFace = face / Math.pow(1 + marketRate, years);
  return +(pvCoupons + pvFace).toFixed(2);
}

export function makeCurve(face, coupon, years) {
  const data = [];
  for (let y = 0.00; y <= 0.12; y += 0.0025) {
    data.push({
      yield: +(y * 100).toFixed(2),         // in % for axis
      price: bondPrice(face, coupon, years, y)
    });
  }
  return data;
}

/**
 * @param {object} params
 * @param {number} params.currentPrice  – price at your quiz’s marketRate
 * @param {number} params.priceUp       – price if yield falls to your “good” scenario
 * @param {number} params.priceDown     – price if yield rises to your “bad” scenario
 * @param {number} params.p             – your probability (0–1) of the good scenario
 * @returns {number} Kelly fraction of capital to allocate
 */
export function kellyAllocation({ currentPrice, priceUp, priceDown, p }) {
  const q = 1 - p;
  const b = (priceUp  - currentPrice) / currentPrice;  // fractional gain
  const l = (currentPrice - priceDown ) / currentPrice; // fractional loss
  if (b <= 0 || l <= 0) return 0;
  return (p * b - q * l) / (b * l);
}
