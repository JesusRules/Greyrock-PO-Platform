import { useState, useEffect } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@components/ui/form"
import { Input } from "../../components/ui/input"
import { Textarea } from "../../components/ui/textarea"
import { useToast } from "../../../hooks/use-toast"
import { useLocation, useNavigate } from "react-router-dom"
import { useGlobalContext } from "../../../context/global-context"
import { useDispatch } from "react-redux"
import { AppDispatch, useAppSelector } from "../../../redux/store"
import { addVendor, fetchVendorById, updateVendor } from "../../../redux/features/vendors-slice"

const vendorSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  contactName: z.string().min(1, "Contact name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  payableTo: z.string().min(1, "Payable to is required"),
  comment: z.string().optional(),
})

type VendorFormValues = z.infer<typeof vendorSchema>

interface VendorFormProps {
  vendorId?: string;
  onClose?: () => void;
}

export function VendorForm({ vendorId, onClose }: VendorFormProps) {
  const { setOpenCreateVendor, setOpenEditVendor } = useGlobalContext();

  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(!!vendorId)
  const { toast } = useToast()
  const isEditMode = !!vendorId
  //Navigation
  const navigate = useNavigate();
  const location = useLocation();
  //Redux
  const dispatch = useDispatch<AppDispatch>();
  const selectedVendor = useAppSelector((state) => state.vendorsReducer.selectedVendor);

  const form = useForm<VendorFormValues>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      companyName: "",
      contactName: "",
      email: "",
      phoneNumber: "",
      address: "",
      payableTo: "",
      comment: "",
    },
  })

  useEffect(() => {
    if (vendorId) {
      form.reset({
        companyName: '',
        contactName: '',
        email: '',
        phoneNumber: '',
        address: '',
        payableTo: '',
        comment: '',
      });
      dispatch(fetchVendorById(vendorId)).catch(() => {
        toast({
          title: "Error",
          description: "Failed to load vendor details.",
          variant: "destructive",
        });
        setInitialLoading(false);
      });
    }
  }, [vendorId, dispatch]);

  useEffect(() => {
    if (vendorId && selectedVendor && selectedVendor._id === vendorId) {
      form.reset({
        companyName: selectedVendor.companyName,
        contactName: selectedVendor.contactName,
        email: selectedVendor.email,
        phoneNumber: selectedVendor.phoneNumber,
        address: selectedVendor.address,
        payableTo: selectedVendor.payableTo,
        comment: selectedVendor.comment || "",
      });
      setInitialLoading(false);
    }
  }, [vendorId, selectedVendor, form]);

  const onSubmit = async (data: VendorFormValues) => {
    setLoading(true);
    try {
      if (isEditMode && vendorId) {
        await dispatch(updateVendor({ id: vendorId, updatedData: data })).unwrap();
        toast({
          title: 'Success',
          description: 'Vendor updated successfully',
          variant: 'success',
        });
      } else {
        await dispatch(addVendor(data)).unwrap();
        toast({
          title: 'Success',
          description: 'Vendor created successfully',
          variant: 'success',
        });
      }

      navigate(location.pathname, { replace: true });
      onClose?.();
    } catch (error) {
      console.error('Error saving vendor:', error);
      toast({
        title: 'Error',
        description: `Failed to ${isEditMode ? 'update' : 'create'} vendor. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div className="text-center py-6">Loading vendor details...</div>
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-y-3 gap-x-3 items-center">
        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name</FormLabel>
              <FormControl>
                <Input placeholder="Acme Inc." {...field} />
              </FormControl>
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
                <Input placeholder="Acme Inc." {...field} />
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
                <Input placeholder="contact@acme.com" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="(123) 456-7890" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="123 Main St, City, State, ZIP" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="payableTo"
          render={({ field }) => (
            <FormItem className="col-span-2">
              <FormLabel>Payable To</FormLabel>
              <FormControl>
                <Input placeholder="ABC Industrial Supplies Ltd" className="resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem className="col-span-2">
              <FormLabel>Comment (optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Additional notes about this vendor" className="resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4 justify-end col-span-2 mt-4">
          <Button type="button" variant="outline" onClick={() => {
              setOpenCreateVendor(false);
              setOpenEditVendor(false);
              onClose?.();
            }}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : isEditMode ? "Update Vendor" : "Create Vendor"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
