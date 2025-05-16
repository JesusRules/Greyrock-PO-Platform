"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog"

interface CommentViewModalProps {
  children: React.ReactNode
  comment: string
  companyName: string
}

export function CommentViewModal({ children, comment, companyName }: CommentViewModalProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div onClick={() => setOpen(true)} className="cursor-pointer hover:text-primary hover:underline">
        {children}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white dark:bg-darkModal">
          <DialogHeader>
            <DialogTitle>{companyName} - Comment</DialogTitle>
          </DialogHeader>
          <div className="mt-2 whitespace-pre-wrap">{comment}</div>
        </DialogContent>
      </Dialog>
    </>
  )
}