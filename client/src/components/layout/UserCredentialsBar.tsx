import { useEffect } from "react";
import { Drawer } from "../../components/layout/Drawer";
import { PurchaseOrderList } from "../../components/purchase-orders/po-list";
import { Button } from "../../components/ui/button"
import { fetchVendors } from "../../../redux/features/vendors-slice";
import { useDispatch } from "react-redux";
import { AppDispatch, useAppSelector } from "../../../redux/store";
import { toast } from "../../../hooks/use-toast"
import { fetchDepartments } from "../../../redux/features/departments-slice";
import { fetchPurchaseOrders } from "../../../redux/features/po-slice";
import { fetchUsers } from "../../../redux/features/users-slice";
import ColorSchemeToggle from "@components/layout/ColorSchemeToggle";
import { Badge } from "@mantine/core"; // 👈 NEW

export function UserCredentialsBar({ user }: { user: any }) {
  if (!user) return null;

  const permissionLabel =
    user.permissionRole === "admin"
      ? "Admin"
      : user.permissionRole === "poweruser"
      ? "Power User"
      : user.permissionRole === "user"
      ? "User"
      : user.permissionRole || "Unknown";

  const signatureLabel =
    user.signatureRole === "generalManager"
      ? "General Manager"
      : user.signatureRole === "financeDepartment"
      ? "Finance Department"
      : user.signatureRole === "overrideSigner"
      ? "Override Signer"
      : user.signatureRole === "submitter"
      ? "Submitter"
      : user.signatureRole || "None";

  const departments: any[] = Array.isArray((user as any).departments)
    ? (user as any).departments
    : [];

  return (
    <div className="mb-4 rounded-md border border-gray-400/50 bg-white/50 dark:bg-slate-900/50 px-3 py-2 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        
        {/* Left: title + name/email */}
        <div>
          <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold">
            Logged In User Credentials
          </p>
          <p className="text-[13px] text-sm font-semibold leading-tight">
            {user.firstName} {user.lastName}
          </p>
          <p className="text-[12px] text-slate-700 dark:text-slate-400 leading-tight">
            {user.email}
          </p>
        </div>

        {/* Right section */}
        <div className="flex flex-wrap gap-4 text-xs">

          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Permission
            </p>
            <p className="text-[13px] mt-0.5 font-semibold">{permissionLabel}</p>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Signature
            </p>
            <p className="text-[13px] mt-0.5 font-semibold">{signatureLabel}</p>
          </div>

          {user.permissionRole === "user" && departments.length > 0 && (
            <div className="sm:max-w-xs">
              <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Departments
              </p>
              <div className="mt-0.5 flex flex-wrap gap-1.5">
                {departments.map((dept) => {
                  const key = dept._id ?? dept.name;
                  const label = `${String(dept.name).toUpperCase()}${
                    dept.departmentCode ? ` (${dept.departmentCode})` : ""
                  }`;
                  return (
                    <Badge
                      key={key}
                      radius="xl"
                      size="sm"
                      color="purple"
                      variant="outline"
                      style={{ fontWeight: 600, fontSize: "10px" }}
                    >
                      {label}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// import { useEffect } from "react";
// import { Drawer } from "../../components/layout/Drawer";
// import { PurchaseOrderList } from "../../components/purchase-orders/po-list";
// import { Button } from "../../components/ui/button"
// import { fetchVendors } from "../../../redux/features/vendors-slice";
// import { useDispatch } from "react-redux";
// import { AppDispatch, useAppSelector } from "../../../redux/store";
// import { toast } from "../../../hooks/use-toast"
// import { fetchDepartments } from "../../../redux/features/departments-slice";
// import { fetchPurchaseOrders } from "../../../redux/features/po-slice";
// import { fetchUsers } from "../../../redux/features/users-slice";
// import ColorSchemeToggle from "@components/layout/ColorSchemeToggle";
// import { Badge } from "@mantine/core"; // 👈 NEW

// export function UserCredentialsBar({ user }: { user: any }) {
//   if (!user) return null;

//   const permissionLabel =
//     user.permissionRole === "admin"
//       ? "Admin"
//       : user.permissionRole === "poweruser"
//       ? "Power User"
//       : user.permissionRole === "user"
//       ? "User"
//       : user.permissionRole || "Unknown";

//   const signatureLabel =
//     user.signatureRole === "generalManager"
//       ? "General Manager"
//       : user.signatureRole === "financeDepartment"
//       ? "Finance Department"
//       : user.signatureRole === "overrideSigner"
//       ? "Override Signer"
//       : user.signatureRole === "submitter"
//       ? "Submitter"
//       : user.signatureRole || "None";

//   const departments: any[] = Array.isArray((user as any).departments)
//     ? (user as any).departments
//     : [];

//   return (
//     <div className="mb-5 rounded-md border border-gray-500 bg-white/70 dark:bg-slate-900/70 px-4 py-3 shadow-sm">
//       <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
//         {/* Left: title + name/email */}
//         <div>
//           <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
//             User Credentials
//           </p>
//           <p className="mt-1 text-base font-semibold">
//             {user.firstName} {user.lastName}
//           </p>
//           <p className="text-xs text-slate-800 dark:text-slate-400">
//             {user.email}
//           </p>
//         </div>

//         {/* Right: roles + departments */}
//         <div className="flex flex-wrap gap-6 text-sm">
//           <div>
//             <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
//               Permission Role
//             </p>
//             <p className="mt-1 font-semibold">{permissionLabel}</p>
//           </div>

//           <div>
//             <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
//               Signature Role
//             </p>
//             <p className="mt-1 font-semibold">{signatureLabel}</p>
//           </div>

//           {user.permissionRole === "user" && departments.length > 0 && (
//             <div className="sm:max-w-xs">
//               <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
//                 Departments
//               </p>
//               <div className="mt-1 flex flex-wrap gap-2">
//                 {departments.map((dept) => {
//                   const key = dept._id ?? dept.name;
//                   const label = `${String(dept.name).toUpperCase()}${
//                     dept.departmentCode ? ` (${dept.departmentCode})` : ""
//                   }`;
//                   return (
//                     <Badge
//                       key={key}
//                       radius="xl"
//                       size="xs"
//                       variant="outline"
//                       style={{ fontWeight: 600 }}
//                     >
//                       {label}
//                     </Badge>
//                   );
//                 })}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
