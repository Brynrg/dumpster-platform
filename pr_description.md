🎯 What:
Fixed a CSV injection vulnerability in the leads export route's `csvEscape` function.

⚠️ Risk:
Malicious users could input fields (e.g., zip codes or names) starting with characters like `=`, `+`, `-`, or `@`. When exported to CSV and opened in spreadsheet software like Excel, these fields would be executed as formulas, potentially allowing arbitrary command execution or data exfiltration.

🛡️ Solution:
Modified the `csvEscape` function to prepend a single quote (`'`) to values starting with dangerous characters (`=`, `+`, `-`, `@`, `\t`, `\r`). This forces spreadsheet software to treat the value as text instead of an executable formula. Also added tests to verify the fix.
