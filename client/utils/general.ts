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

// Convert any image file into PNG dataURL
export const convertImageToPng = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("No canvas context");

      ctx.drawImage(img, 0, 0);

      // Convert to PNG (works 100% with React-PDF)
      const pngDataUrl = canvas.toDataURL("image/png", 1.0);
      resolve(pngDataUrl);
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};
