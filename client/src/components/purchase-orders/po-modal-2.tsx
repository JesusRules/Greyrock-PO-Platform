import { useState, useEffect } from "react"
import { Plus, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Separator } from "../ui/separator"
import { usePurchaseOrders } from "../../../context/po-context"
import { AppDispatch, useAppSelector } from "../../../redux/store"
import api from "../../../axiosSetup"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import purchaseOrderSchema from '../../../types/purchaseOrderSchema'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { createPurchaseOrder, updatePurchaseOrder } from "../../../redux/features/po-slice"
import { useDispatch } from "react-redux"
import { useToast } from "../../../hooks/use-toast"

type PurchaseOrderFormValues = z.infer<typeof purchaseOrderSchema>;

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

const PAYMENT_METHODS = ["Cheque", "Credit Card", "Electronic Funds Transfer"]
// const PAYMENT_METHODS = ["Cheque", "Credit Card", "Wire Transfer", "Cash"]

export function PurchaseOrderModal({ isOpen, onClose, mode, purchaseOrder }: PurchaseOrderModalProps) {
  const isEditing = mode === "edit"
  //Redux
  const dispatch = useDispatch<AppDispatch>();
  const vendors = useAppSelector(state => state.vendorsReducer.vendors);
  const departments = useAppSelector(state => state.departmentsReducer.departments);
  //States
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
  const { toast } = useToast()

  const form = useForm<PurchaseOrderFormValues>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      department: "",
      poNumber: "",
      date: "",
      vendor: "",
      contactName: "",
      phone: "",
      email: "",
      payableTo: "",
      paymentMethod: "Cheque",
    },
  });

  const { watch } = form;
  const department = watch("department");

  useEffect(() => {
    const fetchPoNumber = async () => {
      if (mode === "create" && department) {
        try {
          const res = await api.post("/api/departments/po-number", {
            departmentName: department,
            preview: true,
          });
          setPoNumber(res.data.poNumber);
        } catch (err) {
          console.error("Failed to preview PO number", err);
        }
      }
    };

    fetchPoNumber();
  }, [department, mode]);

  useEffect(() => {
    if (!isOpen) return;

    if (isEditing && purchaseOrder) {
      form.reset({
        department: purchaseOrder.department || "",
        poNumber: purchaseOrder.poNumber || "",
        date: purchaseOrder.date || format(new Date(), "yyyy-MM-dd"),
        vendor: purchaseOrder.vendor || "",
        contactName: purchaseOrder.contactName || "",
        phone: purchaseOrder.phone || "",
        email: purchaseOrder.email || "",
        payableTo: purchaseOrder.payableTo || "",
        paymentMethod: purchaseOrder.paymentMethod || "Cheque",
      });

      setLineItems(purchaseOrder.lineItems || []);
      setShipping(purchaseOrder.shipping || 0);
      setTaxRate(purchaseOrder.taxRate || 13);
    } else {
      form.reset({
        department: "",
        poNumber: "",
        date: format(new Date(), "yyyy-MM-dd"),
        vendor: "",
        contactName: "",
        phone: "",
        email: "",
        payableTo: "",
        paymentMethod: "Cheque",
      });

      setPoNumber("");
      setLineItems([
        {
          id: "1",
          quantity: 1,
          itemId: "",
          description: "",
          unitPrice: 0,
          lineTotal: 0,
        },
      ]);
      setShipping(0);
      setTaxRate(13);
    }
  }, [isOpen]);

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

  const handleSubmit = async () => {
    try {
      const isValid = await form.trigger();

      if (!isValid) {
        console.log(form.formState.errors); // 👈 shows which fields failed
      }

      console.log("323")

      let finalPoNumber = poNumber;

      // 🔁 On create: fetch and increment a fresh PO number
      if (!isEditing) {
        const res = await api.post("/api/departments/po-number", {
          departmentName: department,
          preview: false, // real increment
        });
        finalPoNumber = res.data.poNumber;
        console.log('finalPoNumber', finalPoNumber)
        setPoNumber(finalPoNumber); // update state for consistency
      }

      const poData = {
        department,
        poNumber: finalPoNumber,
        date,
        vendor: {
          name: vendor,
          contactName,
          phone,
          email,
          payableTo,
        },
        paymentMethod,
        lineItems,
        shipping,
        taxRate,
        subtotal,
        tax,
        total,
        status: isEditing ? purchaseOrder.status : "Pending",
      };

      if (!isEditing) {
        const result = await dispatch(createPurchaseOrder(poData)).unwrap();
        toast({
            title: 'Success',
            description: 'Purchase Order created.',
            variant: 'success',
        });
      } else {
        const result = await dispatch(updatePurchaseOrder({
          _id: purchaseOrder._id,
          updatedData: poData
        })).unwrap();
        toast({
            title: 'Success',
            description: 'Purchase Order updated.',
            variant: 'success',
        });
      }

      onClose();
    } catch (error) {
      console.error("Error submitting PO:", error);
      toast({
          title: 'Error',
          description: 'Error submitting PO.',
          variant: 'destructive',
      });
    }
  };

  return (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-darkModal">
      <DialogHeader>
        <DialogTitle>{isEditing ? "Edit Purchase Order" : "Create Purchase Order"}</DialogTitle>
        <DialogDescription>Fill in the details for the purchase order</DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          {/* Top Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept._id} value={dept.name}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <Label>PO Number</Label>
              <Input value={poNumber} disabled />
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                disabled
                type="text"
                value={format(new Date(`${date}T00:00:00`), "MMMM d, yyyy")}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PAYMENT_METHODS.map((method) => (
                        <SelectItem key={method} value={method}>
                          {method}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vendor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vendor</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select vendor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {vendors.map((vendor) => (
                        <SelectItem key={vendor._id} value={vendor.companyName}>
                          {vendor.companyName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="payableTo"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Payable To</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Line items, subtotal, tax, and total */}
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
        <div className="hidden sm:grid sm:grid-cols-[4rem,9rem,1fr,4.25rem,6.33rem,6rem] gap-2 text-sm font-medium text-muted-foreground">
          <div></div>
          <div>Item ID</div>
          <div>Description</div>
          <div>Qty</div>
          <div>Unit Price</div>
          <div className="text-right">Total</div>
        </div>

        {/* Line Items */}
        {lineItems.map((item) => (
        <div
          key={item.id}
          className="grid grid-cols-1 sm:grid-cols-[3rem,9rem,1fr,4.5rem,7rem,4.5rem] gap-2 items-start border p-2 rounded-md"
        >
          {/* Trash */}
          <div className="flex sm:block justify-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeLineItem(item.id)}
              disabled={lineItems.length <= 1}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>

          {/* Item ID */}
          <Input
            placeholder="Item ID"
            value={item.itemId}
            onChange={(e) => updateLineItem(item.id, "itemId", e.target.value)}
          />

          {/* Description */}
          <textarea
            placeholder="Description"
            value={item.description}
            onChange={(e) => updateLineItem(item.id, "description", e.target.value)}
            rows={1}
            className="w-full min-h-[2.25rem] px-3 py-2 text-sm border border-input rounded-md bg-background shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
          />

          {/* Qty */}
          <Input
            type="number"
            placeholder="Qty"
            value={item.quantity}
            onChange={(e) => updateLineItem(item.id, "quantity", Number(e.target.value))}
          />

          {/* Unit Price */}
          <Input
            type="number"
            placeholder="Price"
            value={item.unitPrice}
            onChange={(e) => updateLineItem(item.id, "unitPrice", Number(e.target.value))}
          />

          {/* Total */}
          <div className="text-right font-medium">
            ${item.lineTotal.toFixed(2)}
          </div>
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

          <DialogFooter className="mt-10">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={() => handleSubmit()} type="submit">{isEditing ? "Update" : "Create"}</Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  </Dialog>
);


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-darkModal">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Purchase Order" : "Create Purchase Order"}</DialogTitle>
          <DialogDescription>Fill in the details for the purchase order</DialogDescription>
        </DialogHeader>

        {/* Form Layout */}
        <div className="space-y-8">
        {/* Top Grid with Form Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
        {/* <div className="space-y-2">
        <Label>Department</Label>
        <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger>
            <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
            {departments
              // .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
              .map((dept) => (
                <SelectItem key={dept._id} value={dept.name === "All Departments" ? "all" : dept.name}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
        </Select>
        </div> */}
        <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept._id} value={dept.name}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

        <div className="space-y-2">
            <Label>PO Number</Label>
            <Input value={poNumber} disabled />
        </div>

        <div className="space-y-2">
            <Label>Date</Label>
            <Input type="text" value={format(date, "MMMM d, yyyy")} onChange={(e) => setDate(e.target.value)}  />
            {/* <Input type="date" value={format(date, "yyyy-MM-dd")} onChange={(e) => setDate(e.target.value)}  /> */}
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

        {/* <div className="space-y-2">
            <Label>Vendor</Label>
            <Input value={vendor} onChange={(e) => setVendor(e.target.value)} />
        </div> */}
        <div className="space-y-2">
          <Label>Vendor</Label>
          <Select value={vendor} onValueChange={setVendor}>
              <SelectTrigger>
              <SelectValue placeholder="Select vendor" />
              </SelectTrigger>
              <SelectContent>
              {vendors.map((vendor) => (
                  <SelectItem key={vendor._id} value={vendor.companyName === "All Vendors" ? "all" : vendor.companyName}>
                  {vendor.companyName}
                  </SelectItem>
              ))}
              </SelectContent>
          </Select>
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

        <div className="space-y-2 sm:col-span-2">
            <Label>Payable To</Label>
            <Input value={payableTo} onChange={(e) => setPayableTo(e.target.value)} />
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
        {/* <div className="flex gap-2 text-sm font-medium text-muted-foreground">
        <div className="w-[2.5rem]"></div>
        <div className="w-[10rem]">Item ID</div>
        <div className="flex-1">Description</div>
        <div className="w-[4.75rem]">Qty</div>
        <div className="w-[7rem]">Unit Price</div>
        <div className="w-[6rem] text-right">Total</div>
        </div> */}
        {/* Column Headers */}
        <div className="hidden sm:grid sm:grid-cols-[4rem,9rem,1fr,4.25rem,6.33rem,6rem] gap-2 text-sm font-medium text-muted-foreground">
          <div></div>
          <div>Item ID</div>
          <div>Description</div>
          <div>Qty</div>
          <div>Unit Price</div>
          <div className="text-right">Total</div>
        </div>

        {/* Line Items */}
        {lineItems.map((item) => (
        <div
          key={item.id}
          className="grid grid-cols-1 sm:grid-cols-[3rem,9rem,1fr,4.5rem,7rem,4.5rem] gap-2 items-start border p-2 rounded-md"
        >
          {/* Trash */}
          <div className="flex sm:block justify-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeLineItem(item.id)}
              disabled={lineItems.length <= 1}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>

          {/* Item ID */}
          <Input
            placeholder="Item ID"
            value={item.itemId}
            onChange={(e) => updateLineItem(item.id, "itemId", e.target.value)}
          />

          {/* Description */}
          <textarea
            placeholder="Description"
            value={item.description}
            onChange={(e) => updateLineItem(item.id, "description", e.target.value)}
            rows={1}
            className="w-full min-h-[2.25rem] px-3 py-2 text-sm border border-input rounded-md bg-background shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
          />

          {/* Qty */}
          <Input
            type="number"
            placeholder="Qty"
            value={item.quantity}
            onChange={(e) => updateLineItem(item.id, "quantity", Number(e.target.value))}
          />

          {/* Unit Price */}
          <Input
            type="number"
            placeholder="Price"
            value={item.unitPrice}
            onChange={(e) => updateLineItem(item.id, "unitPrice", Number(e.target.value))}
          />

          {/* Total */}
          <div className="text-right font-medium">
            ${item.lineTotal.toFixed(2)}
          </div>
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

        <DialogFooter className="mt-10">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>{isEditing ? "Update" : "Create"}</Button>
        </DialogFooter>

      </div>
      </div>
      </DialogContent>
    </Dialog>
  )
}
