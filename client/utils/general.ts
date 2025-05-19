// Gonna need ability to create departments
export const departments = [
  "Administration",
  "Boutique",
  "Events",
  "Food and Beverage",
  "Gaming",
  "IT",
  "Maintenance",
  "Marketing",
  "Security",
  "Surveillance",
  "Vault",
];

export function formatCurrency(value: number): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value)
}
  