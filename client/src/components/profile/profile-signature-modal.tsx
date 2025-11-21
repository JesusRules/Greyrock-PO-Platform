"use client"

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog"
import SignatureCanvas from "react-signature-canvas"
import { useRef, useState } from "react"
import { useToast } from "../../../hooks/use-toast"
import { Button } from "../../components/ui/button"

interface ProfileSignatureModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  existingSignature?: string | null
  onSave: (signatureDataUrl: string) => void
}

export function ProfileSignatureModal({ open, onOpenChange, existingSignature, onSave }: ProfileSignatureModalProps) {
  const sigCanvas = useRef<SignatureCanvas>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const clearSignature = () => {
    sigCanvas.current?.clear()
  }

  const handleSubmit = async () => {
    if (sigCanvas.current?.isEmpty()) {
      toast({
        title: "Error",
        description: "Please sign before submitting.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const dataUrl = sigCanvas.current?.getTrimmedCanvas().toDataURL("image/png")

      if (!dataUrl) {
        toast({
          title: "Error",
          description: "Signature pad not ready.",
          variant: "destructive",
        })
        return
      }

      onSave(dataUrl)

      toast({
        title: "Success",
        description: "Signature saved successfully.",
        variant: "default",
      })

      onOpenChange(false)
    } catch (error) {
      console.error("Error signing:", error)
      toast({
        title: "Error",
        description: "Error submitting signature.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Your Signature</DialogTitle>
          <DialogDescription>
            Draw your signature in the box below. This will be saved to your profile.
          </DialogDescription>
        </DialogHeader>

        <div className="border border-border rounded-md p-1 bg-white w-full border-gray-500">
          <SignatureCanvas
            ref={sigCanvas}
            penColor="black"
            backgroundColor="white"
            canvasProps={{
              width: 450,
              height: 200,
              className: "signature-canvas w-full",
            }}
          />
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={clearSignature} type="button">
            Clear
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save Signature"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
