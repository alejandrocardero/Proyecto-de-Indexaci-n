"use client"

import { cn } from "@/lib/utils"
import { Table, TableHeader, TableCell, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/ui/empty-state"
import { useState } from "react"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { getDocumentsForPage, Document } from "@/lib/data/documents"

export default function DocumentsPage() {
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined)

  const documents = getDocumentsForPage("documents")

  const filteredDocuments = documents.filter(
    doc => !statusFilter || doc.status === statusFilter
  )

  const statusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending": return "primary"
      case "approved": return "success"
      case "rejected": return "destructive"
      default: return "secondary"
    }
  }

  return (
    <main className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8 animate-in">
      <div className="max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <Breadcrumb
            items={[
              { label: "Inicio", href: "/" },
              { label: "Documentos" },
            ]}
          />
          <div className="mt-6 text-center">
            <div className="flex items-center gap-2 justify-center">
              <Badge variant="primary">Documentos</Badge>
            </div>
            <h1 className="font-display text-5xl font-bold text-text-primary mt-2">
              Mis documentos
            </h1>
            <p className="text-text-secondary text-base mt-2">
              Archivos subidos y su estado actual
            </p>
          </div>
        </div>

        <div className="mb-8 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <span className="text-text-secondary text-base sm:text-lg font-medium whitespace-nowrap">
              Filtrar por estado:
            </span>
            <select
              className={cn(
                "min-w-[200px] rounded-lg border-2 border-border bg-surface px-5 py-3 text-base sm:text-lg font-medium cursor-pointer",
                "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary focus-visible:ring-offset-2",
                "bg-surface text-text-primary hover:border-primary/50 hover:bg-primary/5",
                "transition-all duration-200 ease-out",
              )}
              value={statusFilter || ""}
              onChange={e => setStatusFilter(e.target.value || undefined)}
            >
              <option value="">Todos los estados</option>
              <option value="pending">Pendientes</option>
              <option value="approved">Aprobados</option>
              <option value="rejected">Rechazados</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="primary" size="md" className="px-6 py-3 text-base font-semibold shadow-sm hover:shadow-md min-w-[160px] text-center">
              Subir documento
            </Button>
            <Button variant="outline" size="md" className="px-6 py-3 text-base font-medium border border-primary hover:border-primary hover:bg-primary/5 min-w-[160px] text-center">
              Descargar lista
            </Button>
            <Button variant="ghost" size="md" className="px-6 py-3 text-base font-medium text-text-secondary hover:text-primary hover:bg-primary/5 min-w-[160px] text-center">
              Configurar vista
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-border shadow-sm overflow-hidden">
          {filteredDocuments.length > 0 ? (
            <Table caption="Mis documentos" striped highlight="primary" className="border-0 shadow-none">
              <TableHeader>
                <th className="w-1/3">Título</th>
                <th className="w-16">Tipo</th>
                <th className="w-20">Fecha</th>
                <th className="w-20">Tamaño</th>
                <th className="w-24">Estado</th>
                <th>Acciones</th>
              </TableHeader>
              {filteredDocuments.map((doc: Document) => (
                <TableRow key={doc.id} highlight={doc.status === "pending"}>
                  <TableCell className="font-medium text-text-primary">{doc.title}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-primary" aria-hidden="true"></span>
                      {doc.type}
                    </span>
                  </TableCell>
                  <TableCell className="text-text-muted">{doc.date}</TableCell>
                  <TableCell className="text-text-muted text-sm">{doc.size}</TableCell>
                  <TableCell>
                    <Badge variant={statusBadgeVariant(doc.status)}>{doc.status}</Badge>
                  </TableCell>
                  <TableCell className="text-text-secondary text-xs">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="py-1 px-2 text-xs">
                        Ver
                      </Button>
                      <Button variant="destructive" size="sm" className="py-1 px-2 text-xs">
                        Eliminar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </Table>
          ) : (
            <EmptyState
              title="Todavía no hay documentos"
              subtitle="Sube tu primera factura, contrato o permiso para empezar a organizarlo todo."
              action="Subir documento"
            />
          )}
        </div>
      </div>
    </main>
  )
}

const statusBadgeVariant = (status: string) => {
  switch (status) {
    case "pending": return "primary"
    case "approved": return "success"
    case "rejected": return "destructive"
    default: return "secondary"
  }
}