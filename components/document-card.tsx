import { Database } from '@/types/database'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  FileText,
  Download,
  Eye,
  Shield,
  AlertTriangle,
  HardHat,
  FileCheck,
  LucideIcon
} from 'lucide-react'

type Document = Database['public']['Tables']['documents']['Row']

const categoryStyles: Record<string, { icon: LucideIcon; color: string; bg: string; border: string }> = {
  policies: { icon: Shield, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
  procedures: { icon: FileCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  forms: { icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
  training: { icon: HardHat, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
  reports: { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
  other: { icon: FileText, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' },
}

const statusMap: Record<string, { label: string; color: string }> = {
  active: { label: 'Vigente', color: 'bg-green-50 text-green-700 border-green-150' },
  under_review: { label: 'En Revisión', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  archived: { label: 'Archivado', color: 'bg-slate-50 text-slate-600 border-slate-200' },
}

export function DocumentCard({
  doc,
  onView,
  onDownload,
}: {
  doc: Document
  onView: (path: string) => void
  onDownload: (path: string, name: string) => void
}) {
  const style = doc.category ? categoryStyles[doc.category] || categoryStyles['other'] : categoryStyles['other']
  const Icon = style.icon
  const status = doc.status ? statusMap[doc.status] || statusMap['active'] : statusMap['active']

  const formatFileSize = (bytes: number | null) => {
    if (bytes === null || bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-VE')
  }

  return (
    <Card className="hover:shadow-md hover:scale-[1.01] transition-all border-slate-200/60 bg-gradient-to-br from-white to-slate-50/50 rounded-xl overflow-hidden group">
      <CardContent className="p-4 flex flex-col justify-between h-full space-y-4">
        
        <div className="flex items-start gap-3 flex-1">
          {/* Decorative Icon Bubble */}
          <div className={`p-2.5 rounded-lg border ${style.bg} ${style.border} ${style.color} shrink-0 group-hover:scale-105 transition-transform`}>
            <Icon className="h-5 w-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm text-slate-800 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
              {doc.name}
            </h4>
            
            <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground font-semibold">
              <span className="uppercase text-slate-400">{doc.type}</span>
              <span>•</span>
              <span>{formatFileSize(doc.file_size)}</span>
              <span>•</span>
              <span>{formatDate(doc.created_at)}</span>
            </div>
            
            <div className="pt-2">
              <Badge variant="outline" className={`text-[9px] font-bold px-2 py-0 rounded-full border ${status.color}`}>
                {status.label}
              </Badge>
            </div>
          </div>
        </div>
        
        {/* Actions bar */}
        <div className="flex gap-2 pt-2 border-t border-slate-100">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-xs font-semibold bg-white border-slate-200 hover:bg-slate-50 h-8"
            onClick={() => doc.file_url && onView(doc.file_url)}
            disabled={!doc.file_url}
          >
            <Eye className="h-3.5 w-3.5 mr-1 text-slate-500" />
            Ver
          </Button>
          <Button
            size="sm"
            className="flex-1 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white h-8 shadow-xs"
            onClick={() => doc.file_url && onDownload(doc.file_url, doc.name)}
            disabled={!doc.file_url}
          >
            <Download className="h-3.5 w-3.5 mr-1 text-white" />
            Descargar
          </Button>
        </div>

      </CardContent>
    </Card>
  )
}
