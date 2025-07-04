# backend/quiz/generator.py
import random
from .utils import bond_price

def generate_question():
    face   = 1000
    coupon = random.choice([0.03, 0.04, 0.05])
    years  = random.choice([3, 5, 7])
    rate   = random.choice([0.03, 0.04, 0.05, 0.06])

    # compute the “ground truth”
    correct = bond_price(face, coupon, years, rate)

    # now build distractors within ±2%–10% of correct
    options = {round(correct, 2)}

    while len(options) < 4:
        # pick a random pct between 2% and 10%
        pct = random.uniform(0.02, 0.10)
        # randomly decide plus-or-minus
        if random.choice([True, False]):
            delta = pct
        else:
            delta = -pct

        distractor = round(correct * (1 + delta), 2)
        # avoid exact duplicates of the correct or each other
        options.add(distractor)

    # sort for consistency (A-D will map to the sorted list)
    sorted_opts = sorted(options)

    return {
        "face":    face,
        "coupon":  coupon,
        "years":   years,
        "rate":    rate,
        "correct": round(correct, 2),
        "options": sorted_opts
    }
