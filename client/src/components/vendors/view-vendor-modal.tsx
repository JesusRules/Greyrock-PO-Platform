"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog"
import { Button } from "../../components/ui/button"
import { Card, CardContent } from "../../components/ui/card"
import { Building2, User, CreditCard, Mail, Phone, MapPin, MessageSquare, X } from "lucide-react"

interface VendorViewModalProps {
  isOpen: boolean
  onClose: () => void
  vendor: {
    companyName: string
    contactName: string
    payableTo: string
    email: string
    phoneNumber: string
    address: string
    comment?: string
  }
}

export function VendorViewModal({ isOpen, onClose, vendor }: VendorViewModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-white max-w-xl max-h-[90vh] overflow-y-auto p-0">
        {/* <div className="bg-gray-50 p-6 rounded-t-lg border-b">
          <DialogHeader className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-2xl font-bold">{vendor.companyName}</DialogTitle>
              <p className="text-muted-foreground mt-1">{vendor.contactName}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="mt-0">
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
        </div> */}

        <div className="p-6 space-y-6">
          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center">
                <Building2 className="h-4 w-4 mr-2" />
                COMPANY INFORMATION
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Company Name</p>
                  <p className="font-medium">{vendor.companyName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Contact Name</p>
                  <p className="font-medium">{vendor.contactName}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center">
                <CreditCard className="h-4 w-4 mr-2" />
                PAYMENT INFORMATION
              </h3>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cheque Payable To</p>
                <p className="font-medium">{vendor.payableTo}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center">
                <User className="h-4 w-4 mr-2" />
                CONTACT INFORMATION
              </h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Mail className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="font-medium">{vendor.email}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Phone className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                    <p className="font-medium">{vendor.phoneNumber}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Address</p>
                    <p className="font-medium whitespace-pre-wrap">{vendor.address}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {vendor.comment && (
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  ADDITIONAL NOTES
                </h3>
                <p className="whitespace-pre-wrap">{vendor.comment}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
