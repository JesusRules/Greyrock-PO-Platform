"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog"
import { Button } from "../ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { Input } from "../ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Eye, EyeOff } from "lucide-react"
import { useDispatch } from "react-redux"
import { AppDispatch } from "../../../redux/store"
import { createUser, updateUser } from "../../../redux/features/users-slice"
import { User } from "../../../../types/User"
import { createUserSchema, updateUserSchema } from '../../../types/userFormSchema'
import { toast } from "../../../hooks/use-toast"

type UserFormValues = z.infer<typeof createUserSchema> | z.infer<typeof updateUserSchema>

interface UserFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: User
}

export function UserFormModal({ open, onOpenChange, initialData }: UserFormModalProps) {
  const isEditMode = !!initialData
  const [avatar, setAvatar] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  // const [avatarPreview, setAvatarPreview] = useState<string | null>(initialData?.avatar || null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  //Mine
  const [showPassword, setShowPassword] = useState(false);
  //Redux
  const dispatch = useDispatch<AppDispatch>()

  const form = useForm<z.infer<typeof createUserSchema | typeof updateUserSchema>>({
    resolver: zodResolver(isEditMode ? updateUserSchema : createUserSchema),
    defaultValues: initialData
        ? { ...initialData, password: "" }
        : {
            firstName: "",
            lastName: "",
            email: "",
            // login: "",
            role: "user",
            phoneNumber: "",
            password: "",
          },
    })

  // Reset form when modal opens/closes or initialData changes
  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          ...initialData,
          password: "", // Don't show the password in the form
        })
        // setAvatarPreview(initialData.avatar || '')
      } else {
        form.reset({
          firstName: "",
          lastName: "",
          email: '',
          // login: "",
          role: "user",
          phoneNumber: "",
          password: "",
        })
        setAvatarPreview(null)
      }
      setAvatar(null)
    }
  }, [open, initialData, form])

  // const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   if (e.target.files && e.target.files[0]) {
  //     const file = e.target.files[0]
  //     setAvatar(file)
  //     setAvatarPreview(URL.createObjectURL(file))
  //   }
  // }

  async function onSubmit(data: UserFormValues) {
    try {
      setIsSubmitting(true);

      const userPayload = {
        ...data,
        // avatar: avatarPreview, // If applicable
      };

      console.log('initialData', initialData)

      if (isEditMode && initialData) {
        const updatedPayload = { ...userPayload };
        if (!data.password) {
          delete updatedPayload.password; // Don't send blank password
        }
        console.log('initialData', initialData._id)
        const resultAction = await dispatch(updateUser({ _id: initialData._id, updatedData: updatedPayload }));
        if (updateUser.rejected.match(resultAction)) {
          toast({
              title: 'Error',
              description: 'Failed to update user.',
              variant: 'destructive',
          });
        } else {
          toast({
              title: 'Success',
              description: 'The user has been updated successfully.',
              variant: 'success',
          });
        }
      } else {
        console.log('userPayload', userPayload)
        const resultAction = await dispatch(createUser(userPayload));
        if (createUser.rejected.match(resultAction)) {
          toast({
              title: 'Error',
              description: resultAction.payload || "Failed to create user.",
              variant: 'destructive',
          });
        } else {
          toast({
              title: 'Success',
              description: 'The user has been created successfully.',
              variant: 'success',
          });
        }
      }
      form.reset();
      setAvatar(null);
      setAvatarPreview(null);
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast({
          title: 'Error',
          description: "Something went wrong. Please try again.",
          variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white dark:bg-darkModal">
        <DialogHeader className="mb-4">
          <DialogTitle>{isEditMode ? "Edit User" : "Create New User"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input placeholder="Jake Paul" {...field} />
                  </FormControl>
                  {/* <FormDescription>This will be used for logging in.</FormDescription> */}
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* <FormField
              control={form.control}
              name="login"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Login</FormLabel>
                  <FormControl>
                    <Input placeholder="Jake Paul" {...field} />
                  </FormControl>
                  <FormDescription>This will be used for logging in.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            /> */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full cursor-pointer">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem className="cursor-pointer" value="admin">Admin</SelectItem>
                        <SelectItem className="cursor-pointer" value="manager">Manager</SelectItem>
                        <SelectItem className="cursor-pointer" value="user">User</SelectItem>
                      </SelectContent>
                    </Select>
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
                      <Input placeholder="+1 (555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password *</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        type={showPassword ? "text" : "password"}
                        // placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <FormDescription>
                    {isEditMode ? "Leave blank to keep current password." : "Must be at least 3 characters."}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* <div className=" flex flex-col items-center">
              <div className="text-sm font-medium">Avatar</div>
              <div className="flex items-center gap-4">
                <div className="relative h-22 w-22 rounded-full overflow-hidden border border-gray-200">
                  {avatarPreview ? (
                    <Image
                      src={avatarPreview || "/placeholder.svg"}
                      alt="Avatar preview"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400 text-xs">No image</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <label
                    htmlFor="avatar-upload"
                    className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md transition-colors text-sm"
                  >
                    Choose file
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG or GIF. Max 2MB.</p>
                </div>
              </div>
            </div> */}

            <DialogFooter>
              <Button className="cursor-pointer" type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button className="cursor-pointer" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : isEditMode ? "Update User" : "Create User"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
