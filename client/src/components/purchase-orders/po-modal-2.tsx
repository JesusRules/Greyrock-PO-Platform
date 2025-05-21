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
  // id: string
  quantity: number
  itemId: string
  description: string
  unitPrice: number
  lineTotal: number
  uuid: string
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
  const user = useAppSelector(state => state.authReducer.user);
  const users = useAppSelector(state => state.usersReducer.users);
  const departments = useAppSelector(state => state.departmentsReducer.departments);
  const [isLoading, setIsLoading] = useState(false);
  //States
  const [poNumber, setPoNumber] = useState("")
  const [date, setDate] = useState(new Date());
  const [vendor, setVendor] = useState("")
  const [contactName, setContactName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [payableTo, setPayableTo] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("Cheque")
  const [shipping, setShipping] = useState(0)
  const [taxRate, setTaxRate] = useState(13)
  const [lineItems, setLineItems] = useState<LineItem[]>([{
    uuid: "1",
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
      // poNumber: "",
      date,
      vendor: "",
      contactName: "",
      phone: "",
      email: "",
      payableTo: "",
      paymentMethod: "Cheque",
      submitter: "",
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

    console.log('purchaseOrder', purchaseOrder);
    console.log('isEditing', isEditing);
    
    if (isEditing && purchaseOrder) {
      form.reset({
        department: purchaseOrder.department.name || "",
        // poNumber: purchaseOrder.poNumber || "",
        date: purchaseOrder.date || new Date(),
        vendor: purchaseOrder.vendor?.companyName || "",
        contactName: purchaseOrder.vendor.contactName || "",
        phone: purchaseOrder.vendor.phoneNumber || "",
        email: purchaseOrder.vendor.email || "",
        payableTo: purchaseOrder.vendor.payableTo || "",
        paymentMethod: purchaseOrder.paymentMethod || "Cheque",
        submitter: typeof purchaseOrder.submitter === "string"
        ? purchaseOrder.submitter
        : purchaseOrder.submitter?._id || "",
      });
      setPoNumber(purchaseOrder.poNumber || "");

      setLineItems(purchaseOrder.lineItems || []);
      setShipping(purchaseOrder.shipping || 0);
      setTaxRate(purchaseOrder.taxRate || 13);
    } else {
      form.reset({
        department: "",
        // poNumber: "",
        date: new Date(),
        vendor: "",
        contactName: "",
        phone: "",
        email: "",
        payableTo: "",
        paymentMethod: "Cheque",
        submitter: ""
      });

      setPoNumber("");
      setLineItems([
        {
          uuid: "1",
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
        item.uuid === id
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
      uuid: newId,
      quantity: 1,
      itemId: "",
      description: "",
      unitPrice: 0,
      lineTotal: 0,
    }])
  }

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) setLineItems(lineItems.filter((item) => item.uuid !== id))
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

      setIsLoading(true);
      let finalPoNumber;

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

      const departmentName = form.getValues("department"); // or use `watch("department")`
      const selectedDepartment = departments.find(dept => dept.name === departmentName);
      const departmentId = selectedDepartment?._id;

      const vendorName = form.getValues("vendor");
      const selectedVendor = vendors.find(v => v.companyName === vendorName);
      const vendorId = selectedVendor;

      const poData = {
        department: selectedDepartment,
        poNumber: finalPoNumber,
        date,
        vendor: vendorId,
        paymentMethod,
        lineItems,
        shipping,
        taxRate,
        subtotal,
        taxAmount: taxRate,
        total,
        status: "Pending",
        submitter: form.getValues("submitter"),
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
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
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
        <div className="flex justify-between items-start mr-3">
          <div>
            <DialogTitle className="mb-1 text-left">
              {isEditing ? "Edit Purchase Order" : "Create Purchase Order"}
            </DialogTitle>
            <DialogDescription>Fill in the details for the purchase order</DialogDescription>
          </div>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={() => {
              form.reset({
                department: "",
                // poNumber: "",
                date: new Date(),
                vendor: "",
                contactName: "",
                phone: "",
                email: "",
                payableTo: "",
                paymentMethod: "Cheque",
              });
              setPoNumber("");
              setLineItems([{
                uuid: crypto.randomUUID(),
                quantity: 1,
                itemId: "",
                description: "",
                unitPrice: 0,
                lineTotal: 0,
              }]);
              setShipping(0);
              setTaxRate(13);
            }}
            className="bg-blue-500 hover:bg-blue-600"
          >
            Clear
          </Button>
        </div>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          {/* Top Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
            <FormField
                control={form.control}
                name="submitter"
                render={({ field }) => (
                  <FormItem className="col-span-2 w-1/2 pr-3">
                    <FormLabel>Submitter</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select submitter" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users.map((u) => (
                          <SelectItem key={u._id} value={u._id}>
                            {u.firstName} {u.lastName}
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
                value={format(date, "MMMM d, yyyy h:mm a")} // e.g. "May 19, 2025 5:22 PM"
                onChange={(e) => setDate(new Date(e.target.value))}
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
                  {/* <Select onValueChange={field.onChange} value={field.value}> */}
                  <Select
                      onValueChange={(val) => {
                        field.onChange(val);
                        const selectedVendor = vendors.find((v) => v.companyName === val);

                        // Auto-populate related fields
                        form.setValue("contactName", selectedVendor?.contactName || "");
                        form.setValue("phone", selectedVendor?.phoneNumber || "");
                        form.setValue("email", selectedVendor?.email || "");
                        form.setValue("payableTo", selectedVendor?.payableTo || "");
                      }}
                      value={field.value}
                    >
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
            <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
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
          key={item.uuid}
          className="grid grid-cols-1 sm:grid-cols-[3rem,9rem,1fr,4.5rem,7rem,4.5rem] gap-2 items-start border p-2 rounded-md"
        >
          {/* Trash */}
          <div className="flex sm:block justify-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeLineItem(item.uuid)}
              disabled={lineItems.length <= 1}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>

          {/* Item ID */}
          <Input
            placeholder="Item ID"
            value={item.itemId}
            onChange={(e) => updateLineItem(item.uuid, "itemId", e.target.value)}
          />

          {/* Description */}
          <textarea
            placeholder="Description"
            value={item.description}
            onChange={(e) => updateLineItem(item.uuid, "description", e.target.value)}
            rows={1}
            className="w-full min-h-[2.25rem] px-3 py-2 text-sm border border-input rounded-md bg-background shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
          />

          {/* Qty */}
          <Input
            type="number"
            placeholder="Qty"
            value={item.quantity}
            onChange={(e) => updateLineItem(item.uuid, "quantity", Number(e.target.value))}
          />

          {/* Unit Price */}
          <Input
            type="number"
            placeholder="Price"
            value={item.unitPrice}
            onChange={(e) => updateLineItem(item.uuid, "unitPrice", Number(e.target.value))}
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
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={() => handleSubmit()}
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : isEditing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  </Dialog>
);
}
