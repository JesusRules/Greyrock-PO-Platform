"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import { Separator } from "../../components/ui/separator"
import { ProfileSignatureModal } from "../../components/profile/profile-signature-modal"
import { Upload, Pen, Trash2, Eye, EyeOff } from "lucide-react"
import { useToast } from "../../../hooks/use-toast"

export default function ProfilePage() {
  const { toast } = useToast()

  // User profile state
  const [firstName, setFirstName] = useState("John")
  const [lastName, setLastName] = useState("Doe")
  const [email, setEmail] = useState("john.doe@example.com")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Signature state
  const [signatureType, setSignatureType] = useState<"draw" | "upload" | null>(null)
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null)
  const [openSignatureModal, setOpenSignatureModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleProfileUpdate = async () => {
    setIsSaving(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: "Success",
      description: "Your profile has been updated successfully.",
      variant: "default",
    })

    setIsSaving(false)
  }

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all password fields.",
        variant: "destructive",
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      })
      return
    }

    if (newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: "Success",
      description: "Your password has been changed successfully.",
      variant: "default",
    })

    // Clear password fields
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setIsSaving(false)
  }

  const handleSignatureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Please upload an image file.",
        variant: "destructive",
      })
      return
    }

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image size should be less than 2MB.",
        variant: "destructive",
      })
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setSignatureUrl(reader.result as string)
      setSignatureType("upload")
      toast({
        title: "Success",
        description: "Signature image uploaded successfully.",
        variant: "default",
      })
    }
    reader.readAsDataURL(file)
  }

  const handleDrawSignature = () => {
    setOpenSignatureModal(true)
  }

  const handleSaveDrawnSignature = (dataUrl: string) => {
    setSignatureUrl(dataUrl)
    setSignatureType("draw")
  }

  const handleDeleteSignature = () => {
    setSignatureUrl(null)
    setSignatureType(null)
    toast({
      title: "Success",
      description: "Signature removed successfully.",
      variant: "default",
    })
  }

  const getInitials = () => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-balance">Profile Settings</h1>
          <p className="text-muted-foreground mt-2">Manage your account information and preferences</p>
        </div>

        {/* Profile Overview Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="text-xl">{getInitials()}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-semibold">
                  {firstName} {lastName}
                </h2>
                <p className="text-muted-foreground">{email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for different sections */}
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="signature">Signature</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details here</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                  />
                </div>
                <Separator />
                <div className="flex justify-end">
                  <Button onClick={handleProfileUpdate} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your password to keep your account secure</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter your current password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter your new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">Password must be at least 8 characters long</div>
                <Separator />
                <div className="flex justify-end">
                  <Button onClick={handlePasswordChange} disabled={isSaving}>
                    {isSaving ? "Updating..." : "Update Password"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Signature Tab */}
          <TabsContent value="signature">
            <Card>
              <CardHeader>
                <CardTitle>Signature Management</CardTitle>
                <CardDescription>Upload your signature image or create an e-signature</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Signature Display */}
                {signatureUrl && (
                  <div className="space-y-3">
                    <Label>Current Signature</Label>
                    <div className="border border-border rounded-lg p-4 bg-muted/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <img
                            src={signatureUrl || "/placeholder.svg"}
                            alt="Your Signature"
                            className="h-24 w-auto max-w-[300px] object-contain bg-white border border-border rounded p-2"
                          />
                          <div className="text-sm text-muted-foreground">
                            {signatureType === "draw" ? "E-Signature (Drawn)" : "Uploaded Image"}
                          </div>
                        </div>
                        <Button variant="destructive" size="icon" onClick={handleDeleteSignature}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <Separator />

                {/* Signature Options */}
                <div className="space-y-4">
                  <Label>Add or Update Signature</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Draw Signature */}
                    <Card
                      className="cursor-pointer hover:border-primary transition-colors"
                      onClick={handleDrawSignature}
                    >
                      <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-3">
                        <div className="rounded-full bg-primary/10 p-3">
                          <Pen className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Draw E-Signature</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Create your signature using the drawing pad
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Upload Signature */}
                    <Card className="cursor-pointer hover:border-primary transition-colors">
                      <label htmlFor="signature-upload" className="cursor-pointer">
                        <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-3">
                          <div className="rounded-full bg-primary/10 p-3">
                            <Upload className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">Upload Image</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              Upload a photo of your handwritten signature
                            </p>
                          </div>
                        </CardContent>
                      </label>
                      <input
                        id="signature-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleSignatureUpload}
                      />
                    </Card>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Supported formats: PNG, JPG, JPEG. Maximum file size: 2MB
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Signature Modal */}
      <ProfileSignatureModal
        open={openSignatureModal}
        onOpenChange={setOpenSignatureModal}
        existingSignature={signatureUrl}
        onSave={handleSaveDrawnSignature}
      />
    </div>
  )
}
