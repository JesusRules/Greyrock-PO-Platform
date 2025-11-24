import { X, FileDown } from "lucide-react"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { usePurchaseOrders } from "../../../context/po-context"
import { formatCurrency, getFormattedDateTime } from "../../../utils/general"
import { PurchaseOrder } from "../../../../types/PurchaseOrder"
import api from "../../../axiosSetup"
import { useToast } from "../../../hooks/use-toast"
import { useGlobalContext } from "../../../context/global-context"
// import { revertSignature } from "../../../redux/features/po-slice"
import { useDispatch } from "react-redux"
import { AppDispatch, useAppSelector } from "../../../redux/store"
import { useState } from "react"
import { Modal, Text, Group, Button as MantineButton } from "@mantine/core";
import { signPurchaseOrderRole } from "../../../redux/features/po-slice"

type SignatureRoleKey =
  | "submitter"
  | "manager"
  | "generalManager"
  | "financeDepartment";

type HandleRoleSignFn = (role: SignatureRoleKey) => Promise<void> | void;

function renderSignatureBox(
  roleKey: SignatureRoleKey,
  label: string,
  purchaseOrder: PurchaseOrder,
  user: any,
  handleRoleSign: (role: SignatureRoleKey) => void
) {
  const sig = purchaseOrder.signatures?.[roleKey];
  const signedBy = sig?.signedBy;
  const isSigned = Boolean(sig?.signedImg);

  const isCurrentUserRole = user?.signatureRole === roleKey;
  const canCurrentUserSign = isCurrentUserRole && user?.signedImg && !isSigned;

  const displayName = (() => {
    if (!signedBy) return "N/A";
    if (typeof signedBy === "string") return signedBy;
    return `${signedBy.firstName} ${signedBy.lastName}`;
  })();

  return (
    <div className="flex flex-col">
      <p className="font-semibold mb-1">{label}</p>

      {isSigned ? (
        <>
          <p className="text-sm mb-1">
            Signed by: <span className="font-semibold">{displayName}</span>
          </p>
          <img
            src={sig!.signedImg!}
            alt={`${label} signature`}
            className="w-[253px] h-[83px] p-2 object-contain bg-white border border-gray-500"
          />
        </>
      ) : canCurrentUserSign ? (
        <Button
          size="sm"
          className="w-fit bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => handleRoleSign(roleKey)}
        >
          Click to sign as {label}
        </Button>
      ) : (
        <p className="text-sm italic text-muted-foreground">
          No signature.
        </p>
      )}
    </div>
  );
}

interface PurchaseOrderViewModalProps {
  purchaseOrderId: string;
}

export function PurchaseOrderViewModal({ purchaseOrderId }: PurchaseOrderViewModalProps) {
  const { openSignModal, setOpenSignModal, openViewPO, setOpenViewPO } = useGlobalContext();
  const { downloadPdf } = usePurchaseOrders()
  const { toast } = useToast();
  //Redux
  const dispatch = useDispatch<AppDispatch>();
  const user = useAppSelector((state) => state.authReducer.user);
  //States
  const [PDFLoader, setPDFLoader] = useState(false);
  const [revertConfirmOpen, setRevertConfirmOpen] = useState(false);

  // const handleRevertSignature = async () => {
  //   try {
  //     await dispatch(revertSignature(purchaseOrderId)).unwrap();

  //     toast({
  //       title: "Signature Reverted",
  //       description: "Signature was cleared and status set to Pending.",
  //       variant: "success",
  //     });
  //   } catch (err) {
  //     toast({
  //       title: "Error",
  //       description: "Failed to revert signature.",
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setRevertConfirmOpen(false);
  //   }
  // };

  const handleRoleSign: HandleRoleSignFn = async (role) => {
    // We never expect to sign as submitter from here,
    // but this keeps the type happy.
    if (role === "submitter") return;

    if (!user?._id) {
      toast({
        title: "Error",
        description: "You must be logged in to sign.",
        variant: "destructive",
      });
      return;
    }

    if (!user.signedImg) {
      toast({
        title: "No Signature on File",
        description: "Please add a signature on your Profile page first.",
        variant: "destructive",
      });
      return;
    }

    if (user.signatureRole !== role) {
      toast({
        title: "Not Authorized",
        description: "You are not allowed to sign for this role.",
        variant: "destructive",
      });
      return;
    }

    try {
      await dispatch(
        signPurchaseOrderRole({ poId: purchaseOrder?._id!, role })
      ).unwrap();

      toast({
        title: "Signature Applied",
        description: `Your ${role} signature has been added to this PO.`,
        variant: "success",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to sign purchase order.",
        variant: "destructive",
      });
    }
  };

  const viewPO_PDF = async (purchaseOrder: PurchaseOrder) => {
    try {
      setPDFLoader(true);
      // window.open(`/pdf/bcr/${item._id}`, "_blank"); // Open in a new tab
      window.open(`${import.meta.env.VITE_API_BASE_URL}/api/purchase-orders/pdf/${purchaseOrder._id}`, "_blank");
      setPDFLoader(false);
    } catch (error) {
      setPDFLoader(false);
      toast({
        title: "Error",
        description: "Failed to open Purchase Order.",
        variant: "destructive",
      });
      console.log(error);
    }
  }

  const purchaseOrder = useAppSelector((state) =>
    state.purchaseOrdersRouter.purchaseOrders.find((po) => po._id === purchaseOrderId)
  );

  if (!purchaseOrder) return null;

  return (
    <>
    {/* <div className="fixed w-full h-full top-0 z-[1000] bg-white/70" onClick={() => console.log("??")}/> */}
    <Dialog open={openViewPO} onOpenChange={() => {
      if (!openSignModal) {
        setOpenViewPO(false);
      }
    }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Purchase Order #{purchaseOrder.poNumber}</span>
            <div className="flex gap-2 mr-5">
              {/* <Button className="border border-gray-500" variant="outline" size="sm" onClick={() => downloadPdf(purchaseOrder._id)}> */}
              <Button className="border border-gray-500" variant="outline" size="sm" onClick={() => viewPO_PDF(purchaseOrder)}>
                <FileDown className="h-4 w-4 mr-1" /> Download PDF
              </Button>
              {/* <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setOpenViewPO(false)}>
                <X className="h-4 w-4" />
              </Button> */}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="border border-gray-500 rounded-lg p-6 mt-4 bg-white dark:bg-gray-900">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">PURCHASE ORDER</h2>
              <p className="text-muted-foreground">{purchaseOrder.department.name || "ADMINISTRATION"}</p>
            </div>
            <div className="text-right">
              <p className="font-bold mb-1 text-sm">{purchaseOrder.poNumber}</p>
              <p className="text-sm">Created:&nbsp;&nbsp;&nbsp;<span className="font-semibold">{getFormattedDateTime(String(purchaseOrder.date))}</span>
              </p>
              <p className="mt-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    purchaseOrder.status === "Signed"
                      ? "bg-green-100 dark:bg-green-700 dark:text-white text-green-800"
                      : purchaseOrder.status === 'Approved' 
                      ? "bg-emerald-100 text-emerald-800" 
                      : purchaseOrder.status === 'Pending'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-600 dark:text-white'
                      : purchaseOrder.status === 'Rejected'
                      ? "bg-red-200 dark:bg-red-600 dark:text-white" : "bg-white"
                  }`}
                >
                  {purchaseOrder.status}
                </span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mt-8">
            <div>
              <h3 className="font-semibold text-sm uppercase text-muted-foreground mb-2">Vendor</h3>
              <p className="text-sm">Company:&nbsp;&nbsp;&nbsp;<span className="font-semibold">{purchaseOrder.vendor.companyName}</span></p>
              <p className="text-sm">Contact:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="font-semibold">{purchaseOrder.vendor.contactName}</span></p>
              <p className="text-sm">Address:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="font-semibold">{purchaseOrder.vendor.address}</span></p>
              <p className="text-sm">Phone:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="font-semibold">{purchaseOrder.vendor.phoneNumber}</span></p>
              <p className="text-sm">Email:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="font-semibold">{purchaseOrder.vendor.email}</span></p>
            </div>
            <div>
              <h3 className="font-semibold text-sm uppercase text-muted-foreground mb-2">Payment Details</h3>
              <p className="text-sm">Payment:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="font-semibold text">{purchaseOrder.paymentMethod}</span></p>
              <p className="text-sm">Payable To:&nbsp;&nbsp;<span className="font-semibold">{purchaseOrder.vendor.payableTo}</span></p>
              <div className="mt-6">
                <h3 className="font-semibold text-sm uppercase text-muted-foreground mb-2">Approval</h3>
                {/* <p className="text-sm">
                  Submitter:&nbsp;&nbsp;&nbsp;<span className="font-semibold">
                  {typeof purchaseOrder.submitter === "string"
                    ? purchaseOrder.submitter // fallback if not populated
                    : `${purchaseOrder.submitter.firstName} ${purchaseOrder.submitter.lastName}`}
                    </span>
                </p> */}
                <p className="text-sm">
                  Submitter:&nbsp;&nbsp;&nbsp;
                  <span className="font-semibold">
                    {(() => {
                      const sb = purchaseOrder.signatures.submitter.signedBy;

                      if (!sb) return "N/A";

                      // If it's a populated user object
                      if (typeof sb === "object")
                        return `${sb.firstName} ${sb.lastName}`;

                      // Otherwise it's an ObjectId string
                      return sb;
                    })()}
                  </span>
                </p>
                {/* <p>Manager: {purchaseOrder.manager}</p> */}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="font-semibold text-sm uppercase text-muted-foreground mb-2">Order Items</h3>
            <table className="w-full text-sm border border-black border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="border border-slate-500 p-2 text-left">Description</th>
                  <th className="border border-slate-500 p-2 text-right">Quantity</th>
                  <th className="border border-slate-500 p-2 text-right">Unit Price</th>
                  <th className="border border-slate-500 p-2 text-right">Line Total</th>
                </tr>
              </thead>

              <tbody>
                {purchaseOrder.lineItems.map((item: any, index: number) => (
                  <tr key={index}>
                    <td className="border border-slate-500 p-2">{item.description}</td>
                    <td className="border border-slate-500 p-2 text-right">{item.quantity}</td>
                    <td className="border border-slate-500 p-2 text-right">{formatCurrency(item.unitPrice)}</td>
                    <td className="border border-slate-500 p-2 text-right">{formatCurrency(item.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-end">
            <div className="w-64">
              <div className="flex justify-between py-1">
                <span>Subtotal:</span>
                <span>{formatCurrency(purchaseOrder.subtotal)}</span>
              </div>
              {/* <div className="flex justify-between py-1">
                <span>Tax ({purchaseOrder.taxRate}%):</span>
                <span>{formatCurrency((purchaseOrder.subtotal * purchaseOrder.taxRate) / 100)}</span>
              </div> */}
              <div className="flex justify-between py-1">
                <span>Tax ({purchaseOrder.taxRate}%):</span>
                <span>{formatCurrency(((purchaseOrder.subtotal + purchaseOrder.shipping) * purchaseOrder.taxRate) / 100)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Shipping:</span>
                <span>{formatCurrency((purchaseOrder.shipping))}</span>
              </div>
              <div className="flex justify-between py-2 font-bold border-t border-gray-500 mt-1">
                <span>Total:</span>
                <span>{formatCurrency(purchaseOrder.total)}</span>
              </div>
            </div>
          </div>
      
          {/* Comments section */}
          <div className="mt-6 border-t border-b pb-5 border-gray-500 pt-4">
            <h3 className="font-semibold text-sm uppercase text-muted-foreground mb-2">
              Comments
            </h3>

            {purchaseOrder.comments && purchaseOrder.comments.trim() !== "" ? (
              <p className="text-sm whitespace-pre-wrap">
                {purchaseOrder.comments}
              </p>
            ) : (
              <p className="text-sm italic text-muted-foreground">
                No comments.
              </p>
            )}
          </div>

          {/* signatures section */}
          <div className="mt-8 border-t pt-6">
            <h3 className="font-semibold text-sm uppercase text-muted-foreground mb-4">
              Signatures
            </h3>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Submitter (already auto-signed at creation) */}
              {renderSignatureBox(
                "submitter",
                "Submitter",
                purchaseOrder,
                user,
                handleRoleSign
              )}

              {renderSignatureBox(
                "manager",
                "Manager",
                purchaseOrder,
                user,
                handleRoleSign
              )}

              {renderSignatureBox(
                "generalManager",
                "General Manager",
                purchaseOrder,
                user,
                handleRoleSign
              )}

              {renderSignatureBox(
                "financeDepartment",
                "Finance Department",
                purchaseOrder,
                user,
                handleRoleSign
              )}
            </div>

            {/* optional global revert button (keeps your existing behavior) */}
            {purchaseOrder.status !== "Pending" && (
              <div className="mt-6 flex justify-end">
                <Button
                  className="dark:bg-red-500"
                  variant="destructive"
                  onClick={() => setRevertConfirmOpen(true)}
                >
                  Revert All Signatures
                </Button>
              </div>
            )}
          </div>

          {/* <div className="mt-8 border-t pt-6">
            <div className="flex justify-between items-center">
              {purchaseOrder?.signatures?.submitter?.signedImg ? (
                <>
                  <div className="">
                    <p className="font-semibold">Signed by: {typeof purchaseOrder?.signatures?.submitter?.signedBy === "string"
                    ? purchaseOrder?.signatures?.submitter?.signedBy
                    : `${purchaseOrder?.signatures?.submitter?.signedBy?.firstName} ${purchaseOrder?.signatures?.submitter?.signedBy?.lastName}`}</p>
                    <img
                      src={purchaseOrder?.signatures?.submitter?.signedImg}
                      alt="Signature"
                      className="w-[253px] p-2 h-[83px] object-contain mt-2 bg-white border border-gray-500"
                    />
                  </div>
                <Button
                  className="dark:bg-red-500"
                  variant="destructive"
                  onClick={() => setRevertConfirmOpen(true)} >
                  Revert Signature
                </Button>
                </>
              ) : (
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  variant="default"
                  onClick={() => {
                    setOpenSignModal(true);
                  }}
                >
                  Sign Purchase Order
                </Button>
              )}
            </div>
          </div> */}

        </div>
      </DialogContent>
    </Dialog>

  {/* Revert signature modal */}
    {/* <Modal
      opened={revertConfirmOpen}
      onClose={() => setRevertConfirmOpen(false)}
      title="Revert Signature"
      centered
    >
      <Text mb="md">
        Are you sure you want to revert the signature and set the status back to{" "}
        <strong>Pending</strong>?
      </Text>

      <Group justify="flex-end" mt="md">
        <MantineButton variant="default" onClick={() => setRevertConfirmOpen(false)}>
          Cancel
        </MantineButton>
        <MantineButton color="red" onClick={handleRevertSignature}>
          Revert Signature
        </MantineButton>
      </Group>
    </Modal> */}

    </>
  )
}
