"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableHeader, TableCell, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Pagination } from "@/components/ui/pagination";

export default function AdminPage() {
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const documents = [
    { id: 1, title: "Informe trimestral Q4 2023", type: "PDF", date: "2024-01-15", uploader: "Marcos", status: "approved" },
    { id: 2, title: "Manual de usuario v2.1", type: "DOCX", date: "2024-01-10", uploader: "Sistema", status: "pending" },
    { id: 3, title: "Presupuesto anual 2024", type: "XLSX", date: "2024-01-05", uploader: "Marcos", status: "pending" },
    { id: 4, title: "Política de seguridad", type: "PDF", date: "2024-01-01", uploader: "Sistema", status: "approved" },
    { id: 5, title: "Manual de cumplimiento", type: "PDF", date: "2023-12-20", uploader: "Marcos", status: "rejected" },
  ];

  const filteredDocuments = documents.filter(
    doc => !statusFilter || doc.status === statusFilter
  );

  const pendingDocs = documents.filter(doc => doc.status === "pending");
  const approvedDocs = documents.filter(doc => doc.status === "approved");
  const rejectedDocs = documents.filter(doc => doc.status === "rejected");

  const handleApprove = (id: number) => {
    console.log(`Documento ${id} aprobado`);
  };

  const handleReject = (id: number) => {
    console.log(`Documento ${id} rechazado`);
  };

  const pendingCount = pendingDocs.length;

  return (
    <main className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8 animate-in">
      <div className="max-w-7xl mx-auto w-full">
        {/* Section header */}
        <div className="mb-8">
          <Breadcrumb
            items={[
              { label: "Inicio", href: "/" },
              { label: "Administración" },
            ]}
          />
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
            <Button variant="primary" className="w-auto">
              Subir documento
            </Button>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card variant="elevated" className="p-6 animate-in slide-up">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Total documentos</p>
                <p className="text-3xl font-display font-bold text-primary">
                  {documents.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
            </div>
          </Card>
          <Card variant="elevated" className="p-6 animate-in slide-up delay-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Pendientes de revisión</p>
                <p className="text-3xl font-display font-bold text-primary">
                  {pendingDocs.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center text-warning">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
            </div>
          </Card>
          <Card variant="elevated" className="p-6 animate-in slide-up delay-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Aprobados</p>
                <p className="text-3xl font-display font-bold text-success">
                  {approvedDocs.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center text-success">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>
          </Card>
          <Card variant="elevated" className="p-6 animate-in slide-up delay-150">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Rechazados</p>
                <p className="text-3xl font-display font-bold text-destructive">
                  {rejectedDocs.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        {/* Filtros y búsqueda */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between mb-8">
          <div className="flex-1 sm:w-auto min-w-[200px]">
            <Input
              placeholder="Buscar documentos..."
              value={searchQuery}
              onChange={(value: string) => setSearchQuery(value)}
              label="Buscar"
              disabled={false}
              className="max-w-[280px]"
            />
          </div>
          <select
            className={cn(
              "rounded-sm border border-border bg-surface px-3 py-2 text-sm font-medium",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              "bg-surface text-text-primary hover:bg-primary/5",
              "min-w-[180px]",
            )}
            value={statusFilter || ""}
            onChange={e => setStatusFilter(e.target.value || undefined)}
          >
            <option value="">Todos los estados</option>
            <option value="pending">Pendientes</option>
            <option value="approved">Aprobados</option>
            <option value="rejected">Rechazados</option>
          </select>
          <div className="flex items-center">
            <Button variant="outline" onClick={() => setStatusFilter(undefined)} size="sm" className="px-3 py-2 text-xs font-medium">
              Limpiar filtros
            </Button>
          </div>
        </div>

        {/* Tabla de documentos pendientes */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h3 className="font-semibold text-text-primary text-lg">
                Documentos pendientes de revisión ({pendingCount})
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
              {pendingDocs.map((doc: any) => (
                <TableRow key={doc.id} highlight={true}>
                  <TableCell className="font-medium text-text-primary">{doc.title}</TableCell>
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleApprove(doc.id)}
                        className="py-1 px-3 text-xs shadow-sm hover:shadow-md transition-shadow"
                      >
                        Aprobar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleReject(doc.id)}
                        className="py-1 px-3 text-xs shadow-sm hover:shadow-md transition-shadow"
                      >
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

        {/* Paginación */}
        <div className="mt-8 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={3}
            onPageChange={setCurrentPage}
            className="gap-1"
          />
        </div>
      </div>
    </main>
  );
}
