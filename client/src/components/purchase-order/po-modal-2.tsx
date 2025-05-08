"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { Button } from "../..//components/ui/button"
import { Input } from "../..//components/ui/input"
import { Label } from "../..//components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../..//components/ui/select"
import { Separator } from "../..//components/ui/separator"
import { usePurchaseOrders } from "../../../context/po-context"
import { departments } from "../../../utils/general"

interface LineItem {
  id: string
  quantity: number
  itemId: string
  description: string
  unitPrice: number
  lineTotal: number
}

interface PurchaseOrderModalProps {
  isOpen: boolean
  onClose: () => void
  mode: "create" | "edit"
  purchaseOrder?: any
}

const DEPARTMENT_CODES: Record<string, string> = {
  Administration: "GRECADM",
  "Food & Beverage": "GRECF&B",
  Maintenance: "GRECMAINT",
  Gaming: "GRECGAME",
  Security: "GRECSEC",
  Marketing: "GRECMKT",
}

const PAYMENT_METHODS = ["Cheque", "Credit Card"]
// const PAYMENT_METHODS = ["Cheque", "Credit Card", "Wire Transfer", "Cash"]

export function PurchaseOrderModal2({ isOpen, onClose, mode, purchaseOrder }: PurchaseOrderModalProps) {
  const { addPurchaseOrder, updatePurchaseOrder } = usePurchaseOrders()
  const isEditing = mode === "edit"

  const [department, setDepartment] = useState("")
  const [poNumber, setPoNumber] = useState("")
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [vendor, setVendor] = useState("")
  const [contactName, setContactName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [payableTo, setPayableTo] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("Cheque")
  const [shipping, setShipping] = useState(0)
  const [taxRate, setTaxRate] = useState(13)
  const [lineItems, setLineItems] = useState<LineItem[]>([{
    id: "1",
    quantity: 1,
    itemId: "",
    description: "",
    unitPrice: 0,
    lineTotal: 0,
  }])

  useEffect(() => {
    if (!isOpen) return;
  
    if (isEditing && purchaseOrder) {
      setDepartment(purchaseOrder.department || "")
      setPoNumber(purchaseOrder.poNumber || "")
      setDate(purchaseOrder.date || format(new Date(), "yyyy-MM-dd"))
      setVendor(purchaseOrder.vendor || "")
      setContactName(purchaseOrder.contactName || "")
      setPhone(purchaseOrder.phone || "")
      setEmail(purchaseOrder.email || "")
      setPayableTo(purchaseOrder.payableTo || "")
      setPaymentMethod(purchaseOrder.paymentMethod || "Cheque")
      setShipping(purchaseOrder.shipping || 0)
      setTaxRate(purchaseOrder.taxRate || 13)
      setLineItems(purchaseOrder.lineItems || [])
    }
  }, [isOpen])

  useEffect(() => {
    if (isEditing && purchaseOrder) {
      setDepartment(purchaseOrder.department || "")
      setPoNumber(purchaseOrder.poNumber || "")
      setDate(purchaseOrder.date || format(new Date(), "yyyy-MM-dd"))
      setVendor(purchaseOrder.vendor || "")
      setContactName(purchaseOrder.contactName || "")
      setPhone(purchaseOrder.phone || "")
      setEmail(purchaseOrder.email || "")
      setPayableTo(purchaseOrder.payableTo || "")
      setPaymentMethod(purchaseOrder.paymentMethod || "Cheque")
      setShipping(purchaseOrder.shipping || 0)
      setTaxRate(purchaseOrder.taxRate || 13)
      setLineItems(purchaseOrder.lineItems || [])
    } else if (mode === "create" && department) {
        const deptCode = DEPARTMENT_CODES[department] || "PO"
        const existing = JSON.parse(localStorage.getItem("testPurchaseOrders") || "[]")
      
        // Filter by department
        const deptOrders = existing.filter((po: any) => po.department === department)
      
        // Extract the highest number used
        const lastNumber = deptOrders
          .map((po: any) => {
            const match = po.poNumber?.match(/-(\d+)$/)
            return match ? parseInt(match[1], 10) : 0
          })
          .reduce((max: number, num: number) => Math.max(max, num), 0)
      
        const nextNumber = String(lastNumber + 1).padStart(3, "0")
        setPoNumber(`${deptCode}-${nextNumber}`)
      }
  }, [purchaseOrder, isEditing, department])

  const updateLineItem = (id: string, field: keyof LineItem, value: any) => {
    setLineItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
              lineTotal: field === "quantity" || field === "unitPrice"
                ? (field === "quantity" ? value : item.quantity) * (field === "unitPrice" ? value : item.unitPrice)
                : item.lineTotal,
            }
          : item
      )
    )
  }

  const addLineItem = () => {
    const newId = crypto.randomUUID() // ensures uniqueness
    setLineItems([...lineItems, {
      id: newId,
      quantity: 1,
      itemId: "",
      description: "",
      unitPrice: 0,
      lineTotal: 0,
    }])
  }

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) setLineItems(lineItems.filter((item) => item.id !== id))
  }

  const subtotal = lineItems.reduce((sum, item) => sum + item.lineTotal, 0)
  const tax = (subtotal * taxRate) / 100
  const total = subtotal + tax + shipping

  const handleSubmit = () => {
    // Check required fields
    if (
      !department ||
      !poNumber ||
      !date ||
      !vendor ||
      !contactName ||
      !phone ||
      !email ||
      !payableTo ||
      !paymentMethod
    ) {
      alert("Please fill in all required fields before submitting.")
      return
    }
  
    const poData = {
      id: isEditing ? purchaseOrder.id : crypto.randomUUID(),
      department,
      poNumber,
      date,
      vendor,
      contactName,
      phone,
      email,
      payableTo,
      paymentMethod,
      lineItems,
      shipping,
      taxRate,
      subtotal,
      tax,
      total,
      status: isEditing ? purchaseOrder.status : "Pending",
    }
  
    if (!isEditing) {
      const existing = JSON.parse(localStorage.getItem("testPurchaseOrders") || "[]")
      const updated = [...existing, poData]
      localStorage.setItem("testPurchaseOrders", JSON.stringify(updated))
    } else {
      updatePurchaseOrder(poData)
    }
  
    onClose()
    window.location.reload()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-900">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Purchase Order" : "Create Purchase Order"}</DialogTitle>
          <DialogDescription>Fill in the details for the purchase order</DialogDescription>
        </DialogHeader>

        {/* Form Layout */}
        <div className="space-y-8">
        {/* Top Grid with Form Inputs */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
        <div className="space-y-2">
        <Label>Department</Label>
        <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger>
            <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
            {departments.map((dept) => (
                <SelectItem key={dept} value={dept === "All Departments" ? "all" : dept}>
                {dept}
                </SelectItem>
            ))}
            </SelectContent>
        </Select>
        </div>

        <div className="space-y-2">
            <Label>PO Number</Label>
            <Input value={poNumber} disabled />
        </div>

        <div className="space-y-2">
            <Label>Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>

        <div className="space-y-2">
            <Label>Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
            <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
            </SelectTrigger>
            <SelectContent>
                {PAYMENT_METHODS.map((method) => (
                <SelectItem key={method} value={method}>
                    {method}
                </SelectItem>
                ))}
            </SelectContent>
            </Select>
        </div>

        <div className="space-y-2">
            <Label>Vendor</Label>
            <Input value={vendor} onChange={(e) => setVendor(e.target.value)} />
        </div>

        <div className="space-y-2">
            <Label>Contact Name</Label>
            <Input value={contactName} onChange={(e) => setContactName(e.target.value)} />
        </div>

        <div className="space-y-2">
            <Label>Phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>

        <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="col-span-2 space-y-2">
            <Label>Payable To</Label>
            <Input value={payableTo} onChange={(e) => setPayableTo(e.target.value)} />
        </div>
        </div>

        <Separator />

        {/* Bottom Section: Line Items */}
        <div className="space-y-4">
        <div className="flex justify-between items-center">
            <Label className="text-base font-medium">Line Items</Label>
            <Button variant="outline" size="sm" onClick={addLineItem}>
            <Plus className="w-4 h-4 mr-1" /> Add Item
            </Button>
        </div>

        {/* Column Headers */}
        <div className="flex gap-2 text-sm font-medium text-muted-foreground">
        <div className="w-[2.5rem]"></div> {/* Empty space for trash icon */}
        <div className="w-[10rem]">Item ID</div>
        <div className="flex-1">Description</div>
        <div className="w-[4.75rem]">Qty</div>
        <div className="w-[7rem]">Unit Price</div>
        <div className="w-[6rem] text-right">Total</div>
        </div>

        {/* Line Items */}
        {lineItems.map((item) => (
        <div key={item.id} className="flex gap-2 items-end">
            {/* Trash icon on the left */}
            <div className="w-[2.5rem] flex justify-center items-center">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => removeLineItem(item.id)}
                disabled={lineItems.length <= 1}
            >
                <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
            </div>

            <Input
            placeholder="Item ID"
            value={item.itemId}
            onChange={(e) => updateLineItem(item.id, "itemId", e.target.value)}
            className="w-[10rem]"
            />
            <Input
            placeholder="Description"
            value={item.description}
            onChange={(e) => updateLineItem(item.id, "description", e.target.value)}
            className="flex-1"
            />
            <Input
            type="number"
            placeholder="Qty"
            value={item.quantity}
            onChange={(e) => updateLineItem(item.id, "quantity", Number(e.target.value))}
            className="w-[4.75rem]"
            />
            <Input
            type="number"
            placeholder="Price"
            value={item.unitPrice}
            onChange={(e) => updateLineItem(item.id, "unitPrice", Number(e.target.value))}
            className="w-[7rem]"
            />
            <div className="w-[6rem] text-right">${item.lineTotal.toFixed(2)}</div>
        </div>
        ))}

        <Separator />

        <div className="space-y-2">
            <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center gap-4">
            <Label className="text-sm">Tax Rate</Label>
            <div className="w-[5rem]">
                <Select value={taxRate.toString()} onValueChange={(val) => setTaxRate(parseFloat(val))}>
                <SelectTrigger>
                    <SelectValue placeholder="Tax %" />
                </SelectTrigger>
                <SelectContent>
                    {[0, 5, 13, 15].map((rate) => (
                    <SelectItem key={rate} value={rate.toString()}>
                        {rate}%
                    </SelectItem>
                    ))}
                </SelectContent>
                </Select>
            </div>
            </div>
            <div className="flex justify-between">
            <span>Shipping:</span>
            <span>${shipping.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold pt-3">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
            </div>
        </div>
        </div>

        </div>


        <DialogFooter className="mt-10">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>{isEditing ? "Update" : "Create"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
