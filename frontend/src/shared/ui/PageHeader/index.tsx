import { Upload, Download, Plus } from "lucide-react";

import { Button } from '@/components/ui/button'
import React from 'react'

export type PageHeaderProps = {
  title: string;
  description: string;
  firstButtonText: string;
  secondButtonText: string;
  isSecondButtonIcon: boolean;
}

export const UploadButtonIcon = (
  <Upload className="w-4 h-4 mr-2" />
)

export const PlusButtonIcon = (
  <Plus className="w-4 h-4 mr-2" />
)

export const DownloadButtonIcon = (
  <Download className="w-4 h-4 mr-2" />
)

const PageHeader = ({ title, description, firstButtonText, secondButtonText, isSecondButtonIcon = true }: PageHeaderProps) => {
  return (
    <div className="px-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100">
            {UploadButtonIcon}
            {firstButtonText}
          </Button>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            {isSecondButtonIcon ? PlusButtonIcon : DownloadButtonIcon}
            {secondButtonText}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default PageHeader;
