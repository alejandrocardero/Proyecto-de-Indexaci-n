"use client";

export const dynamic = "force-dynamic";

import { cn } from "@/lib/utils";
import { useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableHeader, TableCell, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Pagination } from "@/components/ui/pagination";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { Skeleton } from "@/components/ui/skeleton";

interface Document {
  id: number;
  title: string;
  type: string;
  date: string;
  uploader: string;
  status: "pending" | "approved" | "rejected";
}

const MOCK_DOCUMENTS: Document[] = [
  { id: 1, title: "Informe trimestral Q4 2023", type: "PDF", date: "2024-01-15", uploader: "Marcos", status: "approved" },
  { id: 2, title: "Manual de usuario v2.1", type: "DOCX", date: "2024-01-10", uploader: "Sistema", status: "pending" },
  { id: 3, title: "Presupuesto anual 2024", type: "XLSX", date: "2024-01-05", uploader: "Marcos", status: "pending" },
  { id: 4, title: "Política de seguridad", type: "PDF", date: "2024-01-01", uploader: "Sistema", status: "approved" },
  { id: 5, title: "Manual de cumplimiento", type: "PDF", date: "2023-12-20", uploader: "Marcos", status: "rejected" },
  { id: 6, title: "Contrato de proveedores", type: "PDF", date: "2023-11-28", uploader: "Ana", status: "pending" },
  { id: 7, title: "Declaración de impuestos", type: "PDF", date: "2023-11-15", uploader: "Sistema", status: "approved" },
];

export default function AdminPage() {
  const [statusFilter, setStatusFilter] = useState<string | undefined>("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const documents = MOCK_DOCUMENTS.filter(
    (doc) =>
      (!statusFilter || doc.status === statusFilter) &&
      (!searchQuery || doc.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredDocuments = documents;
  const pendingDocs = documents.filter((doc) => doc.status === "pending");
  const approvedDocs = documents.filter((doc) => doc.status === "approved");
  const rejectedDocs = documents.filter((doc) => doc.status === "rejected");

  const handleApprove = (id: number) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 600);
  };

  const handleReject = (id: number) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 600);
  };

  const totalPages = Math.ceil(filteredDocuments.length / 5) || 1;
  const paginatedDocs = filteredDocuments.slice((currentPage - 1) * 5, currentPage * 5);

  if (loading) {
    return (
      <main className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8 animate-in">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex flex-col gap-4 py-20">
            <div className="flex flex-col gap-3">
              <Skeleton width="300" height="1.5rem" radius="md" />
              <Skeleton width="600" height="0.875rem" radius="md" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} variant="elevated" className="p-6">
                  <div className="flex flex-col gap-2">
                    <Skeleton width="100" height="0.875rem" radius="md" />
                    <Skeleton width="60" height="1.5rem" radius="full" />
                  </div>
                </Card>
              ))}
            </div>
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
            <Breadcrumb items={[{ label: "Inicio", href: "/" }, { label: "Administración" }]} />
            <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="primary">Administración</Badge>
                </div>
                <h2 className="font-display text-3xl font-bold text-text-primary">
                  Panel de administración
                </h2>
                <p className="text-text-secondary text-sm">
                  Gestiona los documentos y usuarios del sistema
                </p>
              </div>
              <Button variant="primary" className="w-auto" onClick={() => {}}>
                Subir documento
              </Button>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal variant="slide-up" once className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card variant="elevated" className="p-6 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm">Total documentos</p>
                  <p className="text-3xl font-display font-bold text-primary group-hover:text-primary-hover transition-colors">
                    {documents.length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
              </div>
            </Card>
            <Card variant="elevated" className="p-6 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm">Pendientes de revisión</p>
                  <p className="text-3xl font-display font-bold text-primary group-hover:text-primary-hover transition-colors">
                    {pendingDocs.length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center text-warning group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
              </div>
            </Card>
            <Card variant="elevated" className="p-6 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm">Aprobados</p>
                  <p className="text-3xl font-display font-bold text-success group-hover:text-success/90 transition-colors">
                    {approvedDocs.length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center text-success group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              </div>
            </Card>
            <Card variant="elevated" className="p-6 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm">Rechazados</p>
                  <p className="text-3xl font-display font-bold text-destructive group-hover:text-destructive-hover transition-colors">
                    {rejectedDocs.length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                </div>
              </div>
            </Card>
          </div>
        </ScrollReveal>

        <ScrollReveal variant="fade" once className="mb-8">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between mb-8">
            <div className="flex-1 sm:w-auto min-w-[200px]">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary block mb-1">Buscar</label>
                <input
                  type="text"
                  placeholder="Buscar documentos…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] max-w-[280px]"
                />
              </div>
            </div>
            <select
              className={cn(
                "rounded-sm border border-border bg-surface px-3 py-2 text-sm font-medium",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                "bg-surface text-text-primary hover:bg-primary/5",
                "min-w-[180px] transform hover:scale-[1.02] transition-all duration-200",
              )}
              value={statusFilter || ""}
              onChange={(e) => {
                setStatusFilter(e.target.value || undefined);
                setCurrentPage(1);
              }}
            >
              <option value="">Todos los estados</option>
              <option value="pending">Pendientes</option>
              <option value="approved">Aprobados</option>
              <option value="rejected">Rechazados</option>
            </select>
            <div className="flex items-center">
              <Button variant="outline" onClick={() => setStatusFilter(undefined)} size="sm" className="px-3 py-2 text-xs font-medium hover:bg-primary/5 transition-colors">
                Limpiar filtros
              </Button>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal variant="slide-up" once>
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h3 className="font-semibold text-text-primary text-lg">
                  Documentos pendientes de revisión ({pendingDocs.length})
                </h3>
                <p className="text-text-secondary text-sm">
                  Revisa y aprueba o rechaza los documentos subidos.
                </p>
              </div>
            </div>

            {pendingDocs.length > 0 ? (
              <Table striped highlight="primary" className="shadow-md border border-border overflow-hidden">
                <TableHeader>
                  <th className="w-48">Título</th>
                  <th className="w-32">Tipo</th>
                  <th className="w-40">Fecha</th>
                  <th className="w-32">Subidor</th>
                  <th className="w-32">Estado</th>
                  <th>Acciones</th>
                </TableHeader>
                {paginatedDocs.filter((doc) => doc.status === "pending").map((doc: any) => (
                  <TableRow key={doc.id} highlight={true} className="transition-all duration-200 hover:bg-primary/3">
                    <TableCell className="font-medium text-text-primary group-hover:text-primary transition-colors">{doc.title}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-primary"></span>
                        {doc.type}
                      </span>
                    </TableCell>
                    <TableCell className="text-text-muted">{doc.date}</TableCell>
                    <TableCell className="text-text-muted">{doc.uploader}</TableCell>
                    <TableCell>
                      <Badge variant="surface-on-primary">Pendiente</Badge>
                    </TableCell>
                    <TableCell className="text-text-muted text-xs">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleApprove(doc.id)} className="py-1 px-3 text-xs shadow-sm hover:shadow-md transition-shadow hover:bg-primary/5">
                          Aprobar
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleReject(doc.id)} className="py-1 px-3 text-xs shadow-sm hover:shadow-md hover:bg-destructive/10">
                          Rechazar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </Table>
            ) : (
              <EmptyState
                title="Sin documentos pendientes"
                subtitle="Todos los documentos han sido revisados. Sube uno nuevo para continuar."
                action="Subir documento"
              />
            )}
          </div>
        </ScrollReveal>

        <div className="mt-8 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            className="gap-1"
          />
        </div>
      </div>
    </main>
  );
}
