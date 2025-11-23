"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog"
import { Button } from "../ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Eye, EyeOff } from "lucide-react"
import { useDispatch } from "react-redux"
import { AppDispatch, useAppSelector } from "../../../redux/store"
import { createUser, updateUser } from "../../../redux/features/users-slice"
import { User } from "../../../../types/User"
import { createUserSchema, updateUserSchema } from '../../../types/userFormSchema'
import { toast } from "../../../hooks/use-toast"
import { fetchDepartments } from "../../../redux/features/departments-slice"
import { Modal, Chip, Group, Text, Button as MantineButton, useMantineColorScheme, Tooltip } from "@mantine/core"

type UserFormValues = z.infer<typeof createUserSchema> | z.infer<typeof updateUserSchema>

interface UserFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: User
}

export function UserFormModal({ open, onOpenChange, initialData }: UserFormModalProps) {
  const isEditMode = !!initialData
  const { colorScheme } = useMantineColorScheme();
  const [avatar, setAvatar] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  // const [avatarPreview, setAvatarPreview] = useState<string | null>(initialData?.avatar || null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  //Mine
  const [showPassword, setShowPassword] = useState(false);
  //Redux
  const dispatch = useDispatch<AppDispatch>()
  const departments = useAppSelector(state => state.departmentsReducer.departments);
  const user = useAppSelector(state => state.authReducer.user);
  // 🔹 NEW: departments modal open state
  const [departmentsModalOpen, setDepartmentsModalOpen] = useState(false)
  
  useEffect(() => {
    dispatch(fetchDepartments());
  }, [dispatch])

  const form = useForm<
    z.infer<typeof createUserSchema | typeof updateUserSchema>
  >({
    resolver: zodResolver(isEditMode ? updateUserSchema : createUserSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          password: "",
          departments:
            // @ts-ignore depending on your User type
            initialData.departments?.map((d: any) =>
              typeof d === "string" ? d : d._id
            ) ?? [],
        }
      : {
          firstName: "",
          lastName: "",
          email: "",
          permissionRole: "user",
          signatureRole: "submitter",
          phoneNumber: "",
          password: "",
          departments: [], // 🔹 important
        },
  });
  // const form = useForm<z.infer<typeof createUserSchema | typeof updateUserSchema>>({
  //   resolver: zodResolver(isEditMode ? updateUserSchema : createUserSchema),
  //   defaultValues: initialData
  //       ? { ...initialData, password: "" }
  //       : {
  //         // login: "",
  //           firstName: "",
  //           lastName: "",
  //           email: "",
  //           role: "user",
  //           phoneNumber: "",
  //           password: "",
  //           departments: [],
  //         },
  //   })

  const permissionRole = form.watch("permissionRole");
  const signatureRole = form.watch("signatureRole");

  // Reset form when modal opens/closes or initialData changes
  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          ...initialData,
          password: "",
          // @ts-ignore
          departments:
            initialData.departments?.map((d: any) =>
              typeof d === "string" ? d : d._id
            ) ?? [],
        });
      } else {
        form.reset({
          firstName: "",
          lastName: "",
          email: "",
          permissionRole: "user",
          signatureRole: "submitter",
          phoneNumber: "",
          password: "",
          departments: [],
        });
        setAvatarPreview(null);
      }
      setAvatar(null);
    }
  }, [open, initialData, form]);
  // useEffect(() => {
  //   if (open) {
  //     if (initialData) {
  //       form.reset({
  //         ...initialData,
  //         password: "", // Don't show the password in the form
  //       })
  //       // setAvatarPreview(initialData.avatar || '')
  //     } else {
  //       form.reset({
  //         firstName: "",
  //         lastName: "",
  //         email: '',
  //         // login: "",
  //         role: "user",
  //         phoneNumber: "",
  //         password: "",
  //       })
  //       setAvatarPreview(null)
  //     }
  //     setAvatar(null)
  //   }
  // }, [open, initialData, form])

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
      // console.log('user', user)
      // console.log('initialData', initialData)

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
                    <Input className="" placeholder="johndoe@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
            <FormField
                control={form.control}
                name="permissionRole"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Permission Role *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full cursor-pointer py-0">
                          <SelectValue placeholder="Select a permission role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <Tooltip openDelay={500} withArrow label="Can create PO from any department, can access admin settings.">
                        <SelectItem className="cursor-pointer" value="admin">Admin</SelectItem>
                        </Tooltip>

                        <Tooltip openDelay={500} withArrow label="Can create PO from any department.">
                          <SelectItem className="cursor-pointer" value="poweruser">Power User</SelectItem>
                        </Tooltip>

                        <Tooltip openDelay={500} withArrow label="Can only create PO from selected departments.">
                          <SelectItem className="cursor-pointer" value="user">User</SelectItem>
                        </Tooltip>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            <FormField
                control={form.control}
                name="signatureRole"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Signature Role *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full cursor-pointer py-0">
                          <SelectValue placeholder="Select a permission role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <Tooltip openDelay={500} withArrow label="Can only create purchase orders using themselves as 'Submitter'.">
                        <SelectItem className="cursor-pointer" value="submitter">Submitter</SelectItem>
                        </Tooltip>

                        <Tooltip openDelay={500} withArrow label="Can sign under 'Manager' signature box.">
                          <SelectItem className="cursor-pointer" value="manager">Manager</SelectItem>
                        </Tooltip>

                        <Tooltip openDelay={500} withArrow label="Can sign under 'General Manager' signature box.">
                          <SelectItem className="cursor-pointer" value="generalManager">General Manager</SelectItem>
                        </Tooltip>
                        
                        <Tooltip openDelay={500} withArrow label="Can sign under 'Finance Department' signature box.">
                          <SelectItem className="cursor-pointer" value="financeDepartment">Finance Department</SelectItem>
                        </Tooltip>
                        
                        {(permissionRole === 'admin') && (
                          <Tooltip openDelay={500} withArrow label="Can sign any signature box - only admins can be this role.">
                            <SelectItem className="cursor-pointer" value="overrideSigner">Override Signer</SelectItem>
                          </Tooltip>
                        )}

                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {permissionRole === "user" && (
            <FormField
              control={form.control}
              name="departments"
              render={({ field }) => {
                const value = (field.value || []) as string[];
                const selectedDepartments = departments.filter((d) =>
                  value.includes(d._id)
                );

                return (
                  <FormItem>
                    <FormLabel>User Departments</FormLabel>
                    <FormDescription>
                      Select the departments this user is associated with.
                    </FormDescription>

                    {/* Button to open selector modal */}
                    <div className="mt-2 pb-1">
                      <Button
                        type="button"
                        variant="outline"
                        size='default'
                        onClick={() => setDepartmentsModalOpen(true)}
                      >
                        Manage Departments
                      </Button>
                    </div>

                    {/* Show selected departments as chips under button */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedDepartments.length > 0 ? (
                        selectedDepartments.map((dept) => (
                          <span
                            key={dept._id}
                            className="inline-flex items-center rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-100 px-3 py-1 text-xs font-medium"
                          >
                            {dept.name}
                            <span className="ml-1 text-[10px] text-blue-700/70 dark:text-blue-200/70">
                              ({dept.departmentCode})
                            </span>
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          No departments selected.
                        </span>
                      )}
                    </div>

                    {/* Mantine modal for selecting departments */}
                    <Modal
                      opened={departmentsModalOpen}
                      onClose={() => setDepartmentsModalOpen(false)}
                      title="Select user departments"
                      centered
                    >
                      <Text size="sm" mb="sm">
                        Click on the departments to toggle them on or off.
                      </Text>

                      <Chip.Group
                        multiple
                        value={value}
                        onChange={(newValues) => field.onChange(newValues)}
                      >
                        <Group gap="xs">
                          {departments.map((dept) => (
                            <Chip
                              key={dept._id}
                              value={dept._id}
                              radius="xl"
                              variant="outline"
                            >
                              {dept.name}
                            </Chip>
                          ))}
                        </Group>
                      </Chip.Group>

                      <Group justify="flex-end" mt="md">
                        <MantineButton
                          variant="outline"
                          color={colorScheme === 'light' ? 'dark' : 'gray'}
                          onClick={() => setDepartmentsModalOpen(false)}
                        >
                          Done
                        </MantineButton>
                      </Group>
                    </Modal>

                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          )}

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
