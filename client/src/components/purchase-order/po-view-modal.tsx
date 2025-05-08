"use client"

import { X, FileDown } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog"
import { usePurchaseOrders } from "../../../context/po-context"
import { formatCurrency } from "../../../utils/general"

interface PurchaseOrderViewModalProps {
  isOpen: boolean
  onClose: () => void
  purchaseOrder: any
}

export function PurchaseOrderViewModal({ isOpen, onClose, purchaseOrder }: PurchaseOrderViewModalProps) {
  const { downloadPdf } = usePurchaseOrders()

  if (!purchaseOrder) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Purchase Order #{purchaseOrder.poNumber}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => downloadPdf(purchaseOrder.id)}>
                <FileDown className="h-4 w-4 mr-1" /> Download PDF
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="border rounded-lg p-6 mt-4 bg-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">PURCHASE ORDER</h2>
              <p className="text-muted-foreground">{purchaseOrder.department || "ADMINISTRATION"}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">PO #{purchaseOrder.poNumber}</p>
              <p>Date: {purchaseOrder.date}</p>
              <p className="mt-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    purchaseOrder.status === "Signed" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
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
              <p className="font-semibold">{purchaseOrder.vendor}</p>
              <p>{purchaseOrder.contactName}</p>
              <p className="whitespace-pre-line">{purchaseOrder.contactAddress}</p>
              <p className="mt-2">Phone: {purchaseOrder.phone}</p>
              <p>Email: {purchaseOrder.email}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm uppercase text-muted-foreground mb-2">Payment Details</h3>
              <p>Payment: {purchaseOrder.payment}</p>
              <p>Cheque Payable To: {purchaseOrder.payableTo}</p>
              <div className="mt-4">
                <h3 className="font-semibold text-sm uppercase text-muted-foreground mb-2">Approval</h3>
                <p>Submitter: {purchaseOrder.submitter}</p>
                <p>Manager: {purchaseOrder.manager}</p>
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
                {purchaseOrder.items &&
                  purchaseOrder.items.map((item: any, index: number) => (
                    <tr key={index} className="border-b">
                      <td className="border-x p-2">{item.description}</td>
                      <td className="border-x p-2 text-right">{item.quantity}</td>
                      <td className="border-x p-2 text-right">{formatCurrency(Number.parseFloat(item.unitPrice))}</td>
                      <td className="border-x p-2 text-right">{formatCurrency(Number.parseFloat(item.lineTotal))}</td>
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
                <span>{formatCurrency(purchaseOrder.tax)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Shipping:</span>
                <span>{formatCurrency(Number.parseFloat(purchaseOrder.shipping))}</span>
              </div>
              <div className="flex justify-between py-2 font-bold border-t mt-1">
                <span>Total:</span>
                <span>{formatCurrency(purchaseOrder.total)}</span>
              </div>
            </div>
          </div>

          {purchaseOrder.status === "Signed" && (
            <div className="mt-8 border-t pt-4">
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold">Signed by: {purchaseOrder.signedBy || purchaseOrder.manager}</p>
                  <p>Date: {purchaseOrder.signedDate || purchaseOrder.date}</p>
                </div>
                <div className="italic text-muted-foreground">Digital Signature</div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
