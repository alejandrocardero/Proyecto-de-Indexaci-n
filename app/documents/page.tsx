"use client";

export const dynamic = "force-dynamic";

import { cn } from "@/lib/utils";
import { useState, useCallback } from "react";
import { Table, TableHeader, TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { Skeleton } from "@/components/ui/skeleton";

interface Document {
  id: string;
  title: string;
  type: string;
  date: string;
  size: string;
  status: "pending" | "approved" | "rejected";
}

const MOCK_DOCUMENTS: Document[] = [
  { id: "1", title: "Informe trimestral Q4 2023", type: "PDF", date: "2024-01-15", size: "2.4 MB", status: "approved" },
  { id: "2", title: "Manual de usuario v2.1", type: "DOCX", date: "2024-01-10", size: "1.8 MB", status: "pending" },
  { id: "3", title: "Presupuesto anual 2024", type: "XLSX", date: "2024-01-05", size: "850 KB", status: "pending" },
  { id: "4", title: "Política de seguridad", type: "PDF", date: "2024-01-01", size: "3.1 MB", status: "approved" },
  { id: "5", title: "Manual de cumplimiento", type: "PDF", date: "2023-12-20", size: "2.9 MB", status: "rejected" },
];

export default function DocumentsPage() {
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [documents] = useState<Document[]>(MOCK_DOCUMENTS);
  const [loading, setLoading] = useState(false);

  const filteredDocuments = documents.filter(
    (doc) => !statusFilter || doc.status === statusFilter
  );

  const statusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending": return "primary";
      case "approved": return "success";
      case "rejected": return "destructive";
      default: return "secondary";
    }
  };

  const handleRefresh = useCallback(async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8 animate-in">
        <div className="max-w-7xl mx-auto w-full">
          <div className="mb-8">
            <Breadcrumb items={[{ label: "Inicio", href: "/" }, { label: "Documentos" }]} />
            <div className="mt-6 text-center">
              <h1 className="font-display text-5xl font-bold text-text-primary mt-2">
                Mis documentos
              </h1>
            </div>
          </div>
          <div className="flex flex-col gap-4 py-20">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col gap-3">
                <Skeleton width="200" height="1.5rem" radius="md" />
                <Skeleton width="full" height="0.875rem" radius="md" />
                <Skeleton width="100" height="0.875rem" radius="md" />
                <Skeleton width="80" height="0.875rem" radius="md" />
                <Skeleton width="80" height="0.875rem" radius="full" />
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8 animate-in">
      <div className="max-w-7xl mx-auto w-full">
        <ScrollReveal variant="fade" once className="mb-8">
          <div className="mb-8">
            <Breadcrumb items={[{ label: "Inicio", href: "/" }, { label: "Documentos" }]} />
            <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="primary">Documentos</Badge>
                </div>
                <h1 className="font-display text-5xl font-bold text-text-primary mt-2">
                  Mis documentos
                </h1>
                <p className="text-text-secondary text-base">
                  Archivos subidos y su estado actual
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="primary" size="md" onClick={handleRefresh} className="px-6 py-3 text-base font-semibold shadow-sm hover:shadow-md min-w-[160px] text-center transition-all duration-300 transform hover:scale-[1.02]">
                  Subir documento
                </Button>
                <Button variant="outline" size="md" className="px-6 py-3 text-base font-medium border border-primary hover:border-primary hover:bg-primary/5 min-w-[160px] text-center transition-all duration-300 transform hover:scale-[1.02]">
                  Descargar lista
                </Button>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal variant="slide-up" once className="mb-8">
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
                  "transition-all duration-200 ease-out transform hover:scale-[1.02]",
                )}
                value={statusFilter || ""}
                onChange={(e) => setStatusFilter(e.target.value || undefined)}
              >
                <option value="">Todos los estados</option>
                <option value="pending">Pendientes</option>
                <option value="approved">Aprobados</option>
                <option value="rejected">Rechazados</option>
              </select>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal variant="fade" once>
          <div className="rounded-xl border border-border shadow-sm overflow-hidden group">
            {filteredDocuments.length > 0 ? (
              <Table striped highlight="primary" className="border-0 shadow-none">
                <TableHeader>
                  <th className="w-1/3">Título</th>
                  <th className="w-16">Tipo</th>
                  <th className="w-20">Fecha</th>
                  <th className="w-20">Tamaño</th>
                  <th className="w-24">Estado</th>
                  <th>Acciones</th>
                </TableHeader>
                {filteredDocuments.map((doc) => (
                  <TableRow
                    key={doc.id}
                    highlight={doc.status === "pending"}
                    className="transition-all duration-200 hover:bg-primary/3 group-hover:border-primary/20"
                  >
                    <TableCell className="font-medium text-text-primary group-hover:text-primary transition-colors">{doc.title}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-primary"></span>
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
                        <Button variant="ghost" size="sm" className="py-1 px-2 text-xs hover:bg-primary/5 transition-colors">Ver</Button>
                        <Button variant="destructive" size="sm" className="py-1 px-2 text-xs hover:bg-destructive/10 transition-colors">Eliminar</Button>
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
        </ScrollReveal>
      </div>
    </main>
  );
}
