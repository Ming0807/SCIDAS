"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeft, Save, UploadCloud, Image as ImageIcon, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function RecordHomeVisit() {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const clearFile = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
  }

  return (
    <div className="flex flex-col gap-8 p-6 md:p-8 max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-4">
        <Link href="/home-visits">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Record Home Visit</h1>
          <p className="text-slate-500 mt-1">Log a new home visit and upload evidence.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-sm border-slate-200/60">
            <CardHeader>
              <CardTitle>Visit Details</CardTitle>
              <CardDescription>Basic information about the home visit.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="student" className="text-sm font-medium text-slate-700">Student Name</label>
                  <Input id="student" placeholder="Search student..." />
                </div>
                <div className="space-y-2">
                  <label htmlFor="purpose" className="text-sm font-medium text-slate-700">Purpose</label>
                  <Input id="purpose" placeholder="e.g., Attendance Check" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="date" className="text-sm font-medium text-slate-700">Date</label>
                  <Input id="date" type="date" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="time" className="text-sm font-medium text-slate-700">Time</label>
                  <Input id="time" type="time" />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="location" className="text-sm font-medium text-slate-700">Location</label>
                <Input id="location" placeholder="123 Main St..." />
              </div>
              <div className="space-y-2">
                <label htmlFor="notes" className="text-sm font-medium text-slate-700">Visit Notes</label>
                <Textarea 
                  id="notes" 
                  placeholder="Summarize the outcome of the visit..." 
                  className="min-h-[120px]"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-sm border-slate-200/60">
            <CardHeader>
              <CardTitle>Evidence</CardTitle>
              <CardDescription>Upload photos or documents.</CardDescription>
            </CardHeader>
            <CardContent>
              {previewUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 group">
                  <img src={previewUrl} alt="Preview" className="w-full h-48 object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="destructive" size="sm" onClick={clearFile} className="gap-2">
                      <X className="h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 hover:border-indigo-300 transition-colors cursor-pointer" onClick={() => document.getElementById('file-upload')?.click()}>
                  <div className="h-12 w-12 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                    <UploadCloud className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900">Click to upload</h4>
                  <p className="text-xs text-slate-500 mt-1 mb-4 max-w-[150px]">SVG, PNG, JPG or GIF (max. 5MB)</p>
                  <Button variant="outline" size="sm" className="w-full pointer-events-none">Select File</Button>
                  <input 
                    id="file-upload" 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange} 
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200/60 bg-indigo-50/50">
            <CardContent className="p-6">
              <Button className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700" size="lg">
                <Save className="h-5 w-5" />
                Save Record
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
