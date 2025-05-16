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
import { createVendor, updateVendor } from "./actions"

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
  onSuccess?: () => void
}

export function VendorForm({ vendorId, onSuccess }: VendorFormProps) {
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(!!vendorId)
  const { toast } = useToast()
  const isEditMode = !!vendorId
  //Navigation
  const navigate = useNavigate();
  const location = useLocation();

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
      const fetchVendor = async () => {
        try {
          const response = await fetch(`/api/vendors/${vendorId}`)
          if (!response.ok) throw new Error("Failed to fetch vendor")
          const vendor = await response.json()

          form.reset({
            companyName: vendor.companyName,
            email: vendor.email,
            phoneNumber: vendor.phoneNumber,
            address: vendor.address,
            comment: vendor.comment || "",
          })
        } catch (error) {
          console.error("Error fetching vendor:", error)
          toast({
            title: "Error",
            description: "Failed to load vendor details. Please try again.",
            variant: "destructive",
          })
        } finally {
          setInitialLoading(false)
        }
      }

      fetchVendor()
    }
  }, [vendorId, form, toast])

  async function onSubmit(data: VendorFormValues) {
    setLoading(true)
    try {
      if (isEditMode) {
        await updateVendor(vendorId, data)
        toast({
          title: "Success",
          description: "Vendor updated successfully",
        })
      } else {
        await createVendor(data)
        toast({
          title: "Success",
          description: "Vendor created successfully",
        })
      }

      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess()
      }

      // Refresh the page to update the vendor list
      navigate(location.pathname, { replace: true });
    } catch (error) {
      console.error("Error saving vendor:", error)
      toast({
        title: "Error",
        description: `Failed to ${isEditMode ? "update" : "create"} vendor. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

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
              <FormLabel>Comment</FormLabel>
              <FormControl>
                <Textarea placeholder="Additional notes about this vendor" className="resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4 justify-end">
          <Button type="button" variant="outline" onClick={onSuccess}>
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
