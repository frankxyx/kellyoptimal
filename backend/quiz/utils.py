def bond_price(face_value: float, coupon_rate: float, years: int, market_rate: float) -> float:
    """
    Calculate the present value of a fixed‐coupon bond.
    - face_value: e.g. 1000
    - coupon_rate: decimal (0.04 for 4%)
    - years: maturity in years
    - market_rate: decimal (0.05 for 5%)
    """
    coupon = face_value * coupon_rate
    pv_coupons = sum(coupon / (1 + market_rate) ** t for t in range(1, years + 1))
    pv_face    = face_value / (1 + market_rate) ** years
    return round(pv_coupons + pv_face, 2)