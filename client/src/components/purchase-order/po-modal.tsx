"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, Plus, Trash2 } from "lucide-react"
import { Button } from "@components/ui/button";
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { usePurchaseOrders } from "../../../context/po-context"

interface PurchaseOrderModalProps {
  isOpen: boolean
  onClose: () => void
  mode: "create" | "edit"
  purchaseOrder?: any
}

export function PurchaseOrderModal({ isOpen, onClose, mode, purchaseOrder }: PurchaseOrderModalProps) {
  const { addPurchaseOrder, updatePurchaseOrder } = usePurchaseOrders()
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    poNumber: "",
    payment: "",
    vendor: "",
    contactName: "",
    contactAddress: "",
    phone: "",
    email: "",
    payableTo: "",
    submitter: "",
    manager: "",
    department: "",
    shipping: "0",
    taxRate: "13",
    items: [
      {
        id: "1",
        description: "",
        quantity: "1",
        unitPrice: "0",
        lineTotal: "0",
      },
    ],
  })

  useEffect(() => {
    if (mode === "edit" && purchaseOrder) {
      setFormData({
        ...purchaseOrder,
        date: purchaseOrder.date,
        items: purchaseOrder.items || [
          {
            id: "1",
            description: "",
            quantity: "1",
            unitPrice: "0",
            lineTotal: "0",
          },
        ],
      })
    } else if (mode === "create") {
      // Generate a new PO number (simple implementation)
      const newPoNumber = `PO-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0")}`
      setFormData({
        ...formData,
        poNumber: newPoNumber,
      })
    }
  }, [mode, purchaseOrder, isOpen])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value })
  }

  const handleItemChange = (index: number, field: string, value: string) => {
    const updatedItems = [...formData.items]
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    }

    // Recalculate line total
    if (field === "quantity" || field === "unitPrice") {
      const quantity = Number.parseFloat(updatedItems[index].quantity) || 0
      const unitPrice = Number.parseFloat(updatedItems[index].unitPrice) || 0
      updatedItems[index].lineTotal = (quantity * unitPrice).toFixed(2)
    }

    setFormData({ ...formData, items: updatedItems })
  }

  const addItem = () => {
    const newItem = {
      id: (formData.items.length + 1).toString(),
      description: "",
      quantity: "1",
      unitPrice: "0",
      lineTotal: "0",
    }
    setFormData({ ...formData, items: [...formData.items, newItem] })
  }

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      const updatedItems = formData.items.filter((_, i) => i !== index)
      setFormData({ ...formData, items: updatedItems })
    }
  }

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + (Number.parseFloat(item.lineTotal) || 0), 0)
  }

  const calculateTax = () => {
    const subtotal = calculateSubtotal()
    const taxRate = Number.parseFloat(formData.taxRate) || 0
    return (subtotal * taxRate) / 100
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const tax = calculateTax()
    const shipping = Number.parseFloat(formData.shipping) || 0
    return subtotal + tax + shipping
  }

  const handleSubmit = () => {
    const finalData = {
      ...formData,
      subtotal: calculateSubtotal(),
      tax: calculateTax(),
      total: calculateTotal(),
      status: mode === "create" ? "Pending" : purchaseOrder?.status || "Pending",
    }

    if (mode === "create") {
      addPurchaseOrder(finalData)
    } else {
      updatePurchaseOrder(finalData)
    }

    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-900">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create New Purchase Order" : "Edit Purchase Order"}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 py-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" name="date" type="date" value={formData.date} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="poNumber">PO #</Label>
                <Input id="poNumber" name="poNumber" value={formData.poNumber} onChange={handleInputChange} readOnly />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment">Payment</Label>
              <Input id="payment" name="payment" value={formData.payment} onChange={handleInputChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vendor">Vendor</Label>
              <Input id="vendor" name="vendor" value={formData.vendor} onChange={handleInputChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactName">Contact Name</Label>
              <Input id="contactName" name="contactName" value={formData.contactName} onChange={handleInputChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactAddress">Contact Address</Label>
              <Textarea
                id="contactAddress"
                name="contactAddress"
                value={formData.contactAddress}
                onChange={handleInputChange}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payableTo">Cheque Payable To</Label>
              <Input id="payableTo" name="payableTo" value={formData.payableTo} onChange={handleInputChange} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="submitter">Submitter</Label>
                <Input id="submitter" name="submitter" value={formData.submitter} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manager">Manager</Label>
                <Input id="manager" name="manager" value={formData.manager} onChange={handleInputChange} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select value={formData.department} onValueChange={(value) => handleSelectChange("department", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMINISTRATION">ADMINISTRATION</SelectItem>
                  <SelectItem value="FINANCE">FINANCE</SelectItem>
                  <SelectItem value="OPERATIONS">OPERATIONS</SelectItem>
                  <SelectItem value="MARKETING">MARKETING</SelectItem>
                  <SelectItem value="IT">IT</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shipping">Shipping</Label>
                <Input
                  id="shipping"
                  name="shipping"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.shipping}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input
                  id="taxRate"
                  name="taxRate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.taxRate}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <div className="flex justify-between items-center">
                <Label>Order Items</Label>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-1" /> Add Item
                </Button>
              </div>

              <div className="space-y-4 mt-2">
                {formData.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end border p-2 rounded-md">
                    <div className="col-span-5 space-y-1">
                      <Label htmlFor={`item-desc-${index}`} className="text-xs">
                        Description
                      </Label>
                      <Input
                        id={`item-desc-${index}`}
                        value={item.description}
                        onChange={(e) => handleItemChange(index, "description", e.target.value)}
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Label htmlFor={`item-qty-${index}`} className="text-xs">
                        Quantity
                      </Label>
                      <Input
                        id={`item-qty-${index}`}
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Label htmlFor={`item-price-${index}`} className="text-xs">
                        Unit Price
                      </Label>
                      <Input
                        id={`item-price-${index}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, "unitPrice", e.target.value)}
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Label htmlFor={`item-total-${index}`} className="text-xs">
                        Line Total
                      </Label>
                      <Input id={`item-total-${index}`} value={item.lineTotal} readOnly />
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(index)}
                        disabled={formData.items.length <= 1}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>${calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax ({formData.taxRate}%):</span>
                <span>${calculateTax().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping:</span>
                <span>${Number.parseFloat(formData.shipping || "0").toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold border-t pt-2">
                <span>Total:</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {mode === "create" ? "Create Purchase Order" : "Update Purchase Order"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
