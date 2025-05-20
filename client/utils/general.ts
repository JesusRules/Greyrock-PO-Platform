import moment from 'moment-timezone';
// export const initDepartments = [
//   "All Departments",
//   "Administration",
//   "Boutique",
//   "Events",
//   "Food and Beverage",
//   "Gaming",
//   "IT",
//   "Maintenance",
//   "Marketing",
//   "Security",
//   "Surveillance",
//   "Vault",
// ];
export const initDepartmentsWithCodes = [
  { name: "All Departments", code: "ALL" },
  { name: "Administration", code: "GRECADM" },
  { name: "Boutique", code: "GRECBOUT" },
  { name: "Events", code: "GRECEVNT" },
  { name: "Food and Beverage", code: "GRECFB" }, // adjusted from "Food & Beverage" to avoid &
  { name: "Gaming", code: "GRECGAME" },
  { name: "IT", code: "GRECIT" },
  { name: "Maintenance", code: "GRECMAINT" },
  { name: "Marketing", code: "GRECMKT" },
  { name: "Security", code: "GRECSEC" },
  { name: "Surveillance", code: "GRECSURV" },
  { name: "Vault", code: "GRECVLT" },
];

// Gonna need ability to create departments
export function formatCurrency(value: number): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value)
}

export const getCurrentTime = (dateTimeString: string) => {
    const time = moment(dateTimeString).add(0, 'hours').tz('America/Moncton');
    // return time.format('h:mm:ss A z'); // z = AST/ADT
    return time.format('h:mm:ss A');
};

export const getCurrentDate = (dateTimeString: string) => {
  const date = moment(dateTimeString).tz('America/Moncton');
  return date.format('YYYY-MM-DD');
};

export const getFormattedDateTime = (dateTimeString: string) => {
  const dateTime = moment(dateTimeString).tz("America/Moncton")
  // return dateTime.format("YYYY-MM-DD [at] h:mm:ss A") // Example: 2025-05-20 at 9:07:42 PM
    return dateTime.format("MMMM Do YYYY [at] h:mm:ss A")
}