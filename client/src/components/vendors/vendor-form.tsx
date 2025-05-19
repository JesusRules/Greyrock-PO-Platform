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
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  comment: z.string().optional(),
})

type VendorFormValues = z.infer<typeof vendorSchema>

interface VendorFormProps {
  vendorId?: string
}

export function VendorForm({ vendorId }: VendorFormProps) {
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
      email: "",
      phoneNumber: "",
      address: "",
      comment: "",
    },
  })

  useEffect(() => {
    if (vendorId) {
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
  if (vendorId && selectedVendor) {
      form.reset({
        companyName: selectedVendor.companyName,
        email: selectedVendor.email,
        phoneNumber: selectedVendor.phoneNumber,
        address: selectedVendor.address,
        comment: selectedVendor.comment || "",
      });
      setInitialLoading(false); // move this here
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
      setOpenCreateVendor(false);
      setOpenEditVendor(false);
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comment (optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Additional notes about this vendor" className="resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4 justify-end">
          <Button type="button" variant="outline" onClick={() => {
              setOpenCreateVendor(false);
              setOpenEditVendor(false);
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
