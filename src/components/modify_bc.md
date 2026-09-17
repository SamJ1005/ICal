I have an existing React/Vite calculator application.

I have uploaded/shown my current ConverterView.jsx.
Before making changes, inspect the existing blockchain implementation carefully.

IMPORTANT:
This is NOT a request to rebuild the calculator.

The existing calculator, conversion categories, keypad, styling, ETH unit converter, and other features are already working.

I only want you to MODIFY AND IMPROVE the existing Blockchain → Gas & Fee Calculator section.

Do not unnecessarily restructure or rewrite unrelated parts of the application.

==================================================
CURRENT BLOCKCHAIN FUNCTIONALITY
==================================================

The existing Blockchain section already has:

- ETH Units (Wei/Gwei/ETH)
- Gas & Fee Calculator
- Gas Limit
- Base Fee (Gwei)
- Priority Fee / Tip (Gwei)
- Gas Used
- Gas presets:
  - Standard (21k)
  - ERC-20 (65k)
  - Swap (160k)
- Current Total Gas Fee result
- Gas Used percentage
- Existing calculateGasFee() utility

Keep these existing concepts and improve them rather than replacing them.

==================================================
GOAL
==================================================

Make the Gas & Fee Calculator a proper educational Ethereum gas calculator suitable for a college project.

The user should be able to understand:

1. What Gas is
2. What Gas Limit means
3. What Gas Used means
4. What Gas Price / Base Fee / Priority Fee mean
5. How Gwei and Wei relate to gas fees
6. How the final transaction fee is calculated
7. How EIP-1559 affects the calculation

Keep the UI compact and consistent with the existing calculator.

==================================================

1. # GAS LIMIT

Keep the existing Gas Limit field.

Clearly represent it as:

Gas Limit
Maximum amount of gas allowed for the transaction.

Example:
21000

Do not confuse Gas Limit with actual gas consumed.

================================================== 2. GAS USED
==================================================

Keep the existing Gas Used field.

Represent it as:

Gas Used
Actual gas consumed by the transaction.

The calculation of the actual transaction fee should use Gas Used, not Gas Limit.

If:

Gas Used > Gas Limit

show a clear validation message.

================================================== 3. BASE FEE
==================================================

Keep the existing Base Fee (Gwei).

Explain it briefly in the UI:

Base Fee
Network-determined minimum fee per unit of gas.

Use Gwei as the input unit.

================================================== 4. PRIORITY FEE / TIP
==================================================

Keep the existing Priority Fee / Tip field.

Explain:

Priority Fee
Additional fee paid to the validator as a tip.

Use Gwei.

================================================== 5. EIP-1559 GAS CALCULATION
==================================================

Use the EIP-1559 model for the calculation.

Inputs:

Gas Used
Base Fee
Priority Fee
Max Fee Per Gas

If the existing UI does not currently have Max Fee Per Gas,
ADD a field for it.

Calculate:

Effective Gas Price =
min(Max Fee Per Gas, Base Fee + Priority Fee)

Actual Priority Fee =
min(Priority Fee, Max Fee Per Gas - Base Fee)

Transaction Fee =
Gas Used × Effective Gas Price

Display:

Effective Gas Price
Actual Priority Fee
Base Fee Component
Priority Fee Component
Total Transaction Fee

================================================== 6. MAXIMUM POSSIBLE FEE
==================================================

Also calculate:

Maximum Possible Fee =
Gas Limit × Max Fee Per Gas

Clearly distinguish:

Actual Transaction Fee
Maximum Possible Fee

Do not incorrectly use Gas Limit as the actual gas consumed.

================================================== 7. DISPLAY FEE IN THREE UNITS
==================================================

For the final transaction fee, show:

ETH
Gwei
Wei

Example:

Gas Used = 21,000
Effective Gas Price = 32 Gwei

Result:

0.000672 ETH
672,000 Gwei
672,000,000,000,000 Wei

Keep the ETH result as the main result and show Gwei/Wei as supporting values.

================================================== 8. GAS USED PERCENTAGE
==================================================

Keep the existing Gas Used percentage.

Formula:

Gas Used % =
(Gas Used / Gas Limit) × 100

Display something like:

Gas Used: 21,000 / 21,000
100%

If Gas Used is lower:

Gas Used: 75,000 / 100,000
75%

Do not allow the percentage to exceed 100% when Gas Used exceeds Gas Limit.
Instead show a validation warning.

================================================== 9. GAS UNIT CONVERSION
==================================================

Keep the existing ETH Units converter.

Make sure it correctly supports at least:

Wei
Gwei
ETH

Use the standard relationship:

1 ETH = 1,000,000,000 Gwei
1 Gwei = 1,000,000,000 Wei
1 ETH = 1,000,000,000,000,000,000 Wei

If the existing ETH_UNITS implementation already supports this correctly,
do not unnecessarily rewrite it.

================================================== 10. PRECISION
==================================================

This is important.

Ethereum uses extremely large integer values in Wei.

Do NOT depend on normal JavaScript floating-point arithmetic for exact Wei calculations.

Use BigInt or an appropriate decimal/arbitrary-precision approach where necessary.

For example:

1 ETH

must convert exactly to:

1000000000000000000 Wei

Avoid precision loss when handling large Wei values.

Do not use eval().

================================================== 11. GAS PRESETS
==================================================

Keep the existing presets:

Standard (21k)
ERC-20 (65k)
Swap (160k)

However, make their purpose clearer.

For example:

Standard Transfer
Gas Limit: 21,000
Gas Used: 21,000

ERC-20 Transfer
Gas Limit: 65,000
Gas Used: 52,000

Smart Contract / Swap
Gas Limit: 160,000
Gas Used: 138,000

Clearly label these as example/typical presets rather than guaranteed gas requirements.

================================================== 12. OPTIONAL FIAT CONVERSION
==================================================

Add a small optional section for calculating the approximate fiat cost.

Do NOT use a live API.

Let the user enter:

ETH Price
Currency: INR / USD

Then calculate:

Fiat Cost =
Transaction Fee in ETH × ETH Price

Example:

Transaction Fee = 0.00042 ETH
ETH Price = ₹300,000

Estimated Cost = ₹126

This must be clearly labelled as an estimate based on the manually entered ETH price.

================================================== 13. EDUCATIONAL INFORMATION
==================================================

Because this is for a college project, include a compact "Gas Information" or "How it works" section.

Explain:

Gas:
The unit used to measure computational work on Ethereum.

Gas Limit:
Maximum amount of gas allowed for a transaction.

Gas Used:
Actual gas consumed.

Gwei:
A denomination of ETH commonly used for gas prices.

Base Fee:
The network-determined portion of the fee.

Priority Fee:
Additional tip paid to the validator.

Transaction Fee:
Gas Used × Effective Gas Price.

Keep these explanations short enough that they do not dominate the calculator UI.

================================================== 14. GAS CALCULATION EXAMPLE
==================================================

Include a small example/reference area using:

Gas Used = 21,000
Base Fee = 30 Gwei
Priority Fee = 2 Gwei
Max Fee = 50 Gwei

Therefore:

Effective Gas Price = 32 Gwei

Transaction Fee =
21,000 × 32 Gwei

= 672,000 Gwei

= 672,000,000,000,000 Wei

= 0.000672 ETH

Maximum Possible Fee:

21,000 × 50 Gwei
= 0.00105 ETH

Use this as a reference/example, not hard-coded output when the user changes inputs.

================================================== 15. VALIDATION
==================================================

Handle:

- Empty values
- Invalid values
- Negative values
- Decimal values where inappropriate
- Gas Used > Gas Limit
- Max Fee < Base Fee
- Max Fee = Base Fee
- Zero values

Show understandable validation messages.

Do not silently return NaN, Infinity, or misleading results.

================================================== 16. UI REQUIREMENTS
==================================================

Do not redesign the entire calculator.

Use the existing design language.

Continue using:

#00FF99
#003399

for the existing calculator theme.

Keep:

- Mobile-friendly layout
- iPhone-friendly touch targets
- Existing on-screen keypad
- Existing haptic feedback
- Existing gas field selection behavior
- Existing presets

The Gas section should remain compact enough to use comfortably on an iPhone.

Do not use browser input fields that cause the iPhone software keyboard to appear if the existing architecture intentionally uses the calculator keypad.

================================================== 17. FILE CHANGES
==================================================

First inspect the existing:

- ConverterView.jsx
- conversionUtils.js
- related CSS files

Then modify only the files actually necessary.

Prefer keeping blockchain calculation logic inside the existing conversion utility architecture unless there is a strong reason to separate it.

Do not create unnecessary duplicate calculation functions.

================================================== 18. TEST THESE VALUES
==================================================

After implementation, verify:

TEST 1:

Gas Used = 21,000
Base Fee = 30 Gwei
Priority Fee = 2 Gwei
Max Fee = 50 Gwei

Expected:

Effective Gas Price = 32 Gwei
Transaction Fee = 0.000672 ETH

TEST 2:

Gas Limit = 100,000
Gas Used = 75,000
Base Fee = 30 Gwei
Priority Fee = 2 Gwei
Max Fee = 50 Gwei

Expected:

Effective Gas Price = 32 Gwei
Actual Fee = 0.0024 ETH
Maximum Possible Fee = 0.005 ETH

TEST 3:

Gas Used = 21,000
Gas Limit = 21,000
Gas Price / Effective Gas Price = 20 Gwei

Expected:

Fee = 0.00042 ETH

TEST 4:

Gas Used = 25,000
Gas Limit = 21,000

Expected:

Validation warning:
Gas Used cannot exceed Gas Limit.

TEST 5:

Base Fee = 30 Gwei
Max Fee = 25 Gwei

Expected:

Validation warning:
Max Fee Per Gas cannot be lower than Base Fee.

==================================================
FINAL REQUIREMENT
==================================================

After implementation:

1. Run the project/build.
2. Fix any compilation or runtime errors.
3. Check that the existing non-blockchain converter features still work.
4. Check that the existing ETH unit converter still works.
5. Check the Gas & Fee Calculator on both desktop and mobile dimensions.
6. Do not break the existing keypad behavior.

Finally, tell me:

- Which files were modified
- What was added
- What formulas are being used
- How EIP-1559 is calculated
- How Wei/Gwei/ETH precision is handled
- What I should test manually in the browser
