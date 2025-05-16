// import { useNavigate } from "react-router-dom";
// import { Vendor } from "../../../../types/Vendor"

// let vendors = [
//   {
//     _id: "1",
//     companyName: "Acme Corporation",
//     email: "contact@acme.com",
//     phoneNumber: "(123) 456-7890",
//     address: "123 Main St, Anytown, USA",
//     comment: "Our primary supplier for widgets",
//   },
//   {
//     _id: "2",
//     companyName: "Globex Industries",
//     email: "info@globex.com",
//     phoneNumber: "(987) 654-3210",
//     address: "456 Business Ave, Commerce City, USA",
//     comment: "International supplier with good rates",
//   },
//   {
//     _id: "3",
//     companyName: "Initech Solutions",
//     email: "sales@initech.com",
//     phoneNumber: "(555) 123-4567",
//     address: "789 Tech Blvd, Innovation Park, USA",
//     // comment: "IT services and hardware provider",
//   },
// ]

// export async function createVendor(data: Vendor) {
//   const navigate = useNavigate();
//   // Simulate API delay
//   await new Promise((resolve) => setTimeout(resolve, 1000))

//   // Generate a new ID (in a real app, this would be handled by the database)
//   const newId = (vendors.length + 1).toString()

//   // Create the new vendor
//   const newVendor = {
//     _id: newId,
//     ...data,
//   }

//   // Add to our mock database
//   vendors.push(newVendor)

//   // Revalidate the path to update the UI
//   navigate("/vendors")

//   return { success: true, id: newId }
// }

// export async function updateVendor(_id: string, data: Vendor) {
//   const navigate = useNavigate();
//   // Simulate API delay
//   await new Promise((resolve) => setTimeout(resolve, 1000))

//   // Find the vendor index
//   const vendorIndex = vendors.findIndex((v) => v._id === _id)

//   if (vendorIndex === -1) {
//     throw new Error("Vendor not found")
//   }

//   // Update the vendor
//   vendors[vendorIndex] = {
//     ...vendors[vendorIndex],
//     ...data,
//   }

//   // Revalidate the path to update the UI
//   navigate("/vendors")

//   return { success: true }
// }

// export async function deleteVendor(_id: string) {
//   const navigate = useNavigate();
//   // Simulate API delay
//   await new Promise((resolve) => setTimeout(resolve, 1000))

//   // Filter out the vendor to delete
//   const initialLength = vendors.length
//   vendors = vendors.filter((v) => v._id !== _id)

//   if (vendors.length === initialLength) {
//     throw new Error("Vendor not found")
//   }

//   // Revalidate the path to update the UI
//   navigate("/vendors")

//   return { success: true }
// }
