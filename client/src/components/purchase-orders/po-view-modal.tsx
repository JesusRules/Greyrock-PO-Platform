import { X, FileDown } from "lucide-react"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { usePurchaseOrders } from "../../../context/po-context"
import { formatCurrency, getFormattedDateTime } from "../../../utils/general"
import { PurchaseOrder } from "../../../../types/PurchaseOrder"
import api from "../../../axiosSetup"
import { useToast } from "../../../hooks/use-toast"
import { useGlobalContext } from "../../../context/global-context"
import { revertSignature } from "../../../redux/features/po-slice"
import { useDispatch } from "react-redux"
import { AppDispatch, useAppSelector } from "../../../redux/store"

// interface PurchaseOrderViewModalProps {
//   purchaseOrder: PurchaseOrder
// }
interface PurchaseOrderViewModalProps {
  purchaseOrderId: string;
}

export function PurchaseOrderViewModal({ purchaseOrderId }: PurchaseOrderViewModalProps) {
  const { openSignModal, setOpenSignModal, openViewPO, setOpenViewPO } = useGlobalContext();
  const { downloadPdf } = usePurchaseOrders()
  const { toast } = useToast();
  //Redux
  const dispatch = useDispatch<AppDispatch>();

  const handleRevertSignature = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to revert the signature and set the status back to Pending?"
    );
    if (!confirmed) return;

    try {
      await dispatch(revertSignature(purchaseOrderId)).unwrap();

      // setOpenViewPO(false);
      toast({
        title: "Signature Reverted",
        description: "Signature was cleared and status set to Pending.",
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to revert signature.",
        variant: "destructive",
      });
    }
  };

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
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => downloadPdf(purchaseOrder._id)}>
                <FileDown className="h-4 w-4 mr-1" /> Download PDF
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setOpenViewPO(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="border rounded-lg p-6 mt-4 bg-white dark:bg-gray-900">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">PURCHASE ORDER</h2>
              <p className="text-muted-foreground">{purchaseOrder.department.name || "ADMINISTRATION"}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold mb-1">PO #{purchaseOrder.poNumber}</p>
              <p>Created:&nbsp;&nbsp;<span className="font-semibold">{getFormattedDateTime(String(purchaseOrder.date))}</span>
              </p>
              <p className="mt-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    purchaseOrder.status === "Signed"
                      ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                      : "bg-amber-100 text-amber-800 dark:bg-yellow-700 dark:text-yellow-100"
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
              <p>Company:&nbsp;&nbsp;&nbsp;<span className="font-semibold">{purchaseOrder.vendor.companyName}</span></p>
              <p>Contact:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="font-semibold">{purchaseOrder.vendor.contactName}</span></p>
              <p>Address:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="font-semibold">{purchaseOrder.vendor.address}</span></p>
              <p>Phone:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="font-semibold">{purchaseOrder.vendor.phoneNumber}</span></p>
              <p>Email:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="font-semibold">{purchaseOrder.vendor.email}</span></p>
            </div>
            <div>
              <h3 className="font-semibold text-sm uppercase text-muted-foreground mb-2">Payment Details</h3>
              <p>Payment:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="font-semibold">{purchaseOrder.paymentMethod}</span></p>
              <p>Payable To:&nbsp;&nbsp;<span className="font-semibold">{purchaseOrder.vendor.payableTo}</span></p>
              <div className="mt-4">
                <h3 className="font-semibold text-sm uppercase text-muted-foreground mb-2">Approval</h3>
                <p>
                  Submitter:&nbsp;&nbsp;&nbsp;<span className="font-semibold">
                  {typeof purchaseOrder.submitter === "string"
                    ? purchaseOrder.submitter // fallback if not populated
                    : `${purchaseOrder.submitter.firstName} ${purchaseOrder.submitter.lastName}`}
                    </span>
                </p>
                {/* <p>Manager: {purchaseOrder.manager}</p> */}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="font-semibold text-sm uppercase text-muted-foreground mb-2">Order Items</h3>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="border p-2 text-left">Description</th>
                  <th className="border p-2 text-right">Quantity</th>
                  <th className="border p-2 text-right">Unit Price</th>
                  <th className="border p-2 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody>
              {(purchaseOrder.lineItems)?.map((item: any, index: number) => (
                  <tr key={index} className="border-b">
                    <td className="border-x p-2">{item.description}</td>
                    <td className="border-x p-2 text-right">{item.quantity}</td>
                    <td className="border-x p-2 text-right">{formatCurrency(Number(item.unitPrice))}</td>
                    <td className="border-x p-2 text-right">{formatCurrency(Number(item.lineTotal))}</td>
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
              <div className="flex justify-between py-1">
                <span>Tax ({purchaseOrder.taxRate}%):</span>
                <span>{formatCurrency((purchaseOrder.subtotal * purchaseOrder.taxRate) / 100)}</span>
              </div>
              {/* <div className="flex justify-between py-1">
                <span>Shipping:</span>
                <span>{formatCurrency(Number.parseFloat(purchaseOrder.shipping))}</span>
              </div> */}
              <div className="flex justify-between py-2 font-bold border-t mt-1">
                <span>Total:</span>
                <span>{formatCurrency(purchaseOrder.total)}</span>
              </div>
            </div>
          </div>
          {/* {purchaseOrder.status === "Signed" && (
            <div className="mt-8 border-t pt-4">
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold">Signed by: {purchaseOrder.signedBy || purchaseOrder.manager}</p>
                  <p>Date: {purchaseOrder.signedDate || purchaseOrder.date}</p>
                </div>
                <div className="italic text-muted-foreground">Digital Signature</div>
              </div>
            </div>
          )} */}
          <div className="mt-8 border-t pt-6">
            <div className="flex justify-between items-center">
              {purchaseOrder.signedImg ? (
                <>
                  <div>
                    <p className="font-semibold">Signed by: {typeof purchaseOrder?.signedBy === "string"
                    ? purchaseOrder?.signedBy // fallback if not populated
                    : `${purchaseOrder?.signedBy?.firstName} ${purchaseOrder?.signedBy?.lastName}`}</p>
                    <img
                      src={purchaseOrder?.signedImg}
                      alt="Signature"
                      className="w-[253px] p-2 h-[83px] object-contain mt-2 bg-white"
                    />
                  </div>
                 <Button variant="destructive" onClick={handleRevertSignature}>
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
          </div>

        </div>
      </DialogContent>
    </Dialog>
    </>
  )
}
