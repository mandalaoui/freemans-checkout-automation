
// Helper to identify dropdown fields based on field name or selector pattern
export async function isDropdown(fieldName: string, selector: string) {
    return (
      fieldName === "title" ||
      fieldName === "day" ||
      fieldName === "month" ||
      fieldName === "year" ||
      selector.includes("dob_")
    );
  }
  
  // Normalize input values for specific fields (e.g., remove spaces from card numbers)
  export async function normalizeValue(fieldName: string, value: string) {
    if (fieldName === "cardNumber") {
      return value.replace(/\s+/g, "");
    }
    return value.trim();
  }