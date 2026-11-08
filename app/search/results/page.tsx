"use client";

import { cn } from "@/lib/utils";
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useState } from "react";

import { Breadcrumb } from "@/components/ui/breadcrumb";

export default function SearchResultsPage() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<{ status?: string; dateRange?: string }>({});
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = () => {
    if (!query.trim()) return;
    setSearching(true);
    setTimeout(() => {
      setResults([
        { id: 1, title: "Informe trimestral Q4 2023", type: "PDF", date: "2024-01-15", status: "pending", relevance: "95%" },
        { id: 2, title: "Manual de usuario v2.1", type: "DOCX", date: "2024-01-10", status: "approved", relevance: "88%" },
        { id: 3, title: "Presupuesto anual 2024", type: "XLSX", date: "2024-01-05", status: "pending", relevance: "82%" },
        { id: 4, title: "Política de seguridad", type: "PDF", date: "2024-01-01", status: "approved", relevance: "76%" },
      ]);
      setSearching(false);
    }, 800);
  };

  const statusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending": return "primary";
      case "approved": return "success";
      case "rejected": return "destructive";
      default: return "secondary";
    }
  };

  return (
    <main className="min-h-screen bg-background py-10 px-4 sm:px-6 lg:px-8 animate-in">
      <div className="max-w-6xl mx-auto w-full">
        {/* Breadcrumb - separado */}
        <nav className="mb-12 flex items-center gap-4 text-xs uppercase tracking-wider text-text-muted">
          <Breadcrumb
            items={[
              { label: "Inicio", href: "/" },
              { label: "Búsqueda" },
            ]}
            className="gap-4"
          />
        </nav>

        {/* Section header - centrado */}
        <div className="text-center mb-8">
          <Badge variant="primary" className="mb-4 inline-block animate-in fade-in px-3 py-1.5 text-sm font-semibold">
            Búsqueda
          </Badge>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-text-primary mb-3 leading-tight">
            Resultados de búsqueda
          </h2>
          <p className="text-text-secondary text-sm max-w-2xl mx-auto leading-relaxed">
            Encuentra documentos por contenido, tipo o fecha.
          </p>
        </div>

        {/* Barra de búsqueda - input y botón unidos en una sola barra */}
        <div className="mb-8 max-w-xl mx-auto">
          <div className="flex items-center gap-0 rounded-lg border border-border bg-surface shadow-sm hover:shadow-md transition-shadow">
            <SearchInput
              placeholder="Buscar documentos, tipos, fechas…"
              value={query}
              onChange={(value: string) => setQuery(value)}
              label={undefined}
              className="w-full border-none bg-transparent rounded-l-xl pl-3 pr-10 py-2 text-sm focus-visible:outline-none focus-visible:ring-0"
            />
            <Button
              variant="primary"
              onClick={handleSearch}
              disabled={searching}
              className="px-3 py-2 text-sm rounded-r-xl shadow-none min-w-fit"
            >
              {searching ? "Buscando…" : "Buscar"}
            </Button>
          </div>
        </div>

        {/* Filtros - rediseñados como pills */}
        <div className="mb-8 flex flex-col sm:flex-row gap-2 items-center justify-center">
          <select
            className={cn(
              "rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              "bg-surface text-text-primary hover:bg-primary/5 transition-colors",
              "shadow-sm hover:shadow-md",
            )}
            value={filters.status || ""}
            onChange={e => setFilters({ ...filters, status: e.target.value || undefined })}
          >
            <option value="">Todos los estados</option>
            <option value="pending">Pendientes</option>
            <option value="approved">Aprobados</option>
            <option value="rejected">Rechazados</option>
          </select>
          <select
            className={cn(
              "rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              "bg-surface text-text-primary hover:bg-primary/5 transition-colors",
              "shadow-sm hover:shadow-md",
            )}
            value={filters.dateRange || ""}
            onChange={e => setFilters({ ...filters, dateRange: e.target.value || undefined })}
          >
            <option value="">Todos los períodos</option>
            <option value="this-month">Este mes</option>
            <option value="last-month">Mes anterior</option>
          </select>
        </div>

        {/* Resultados */}
        <div className="rounded-2xl border border-border shadow-sm overflow-hidden">
          {results.length > 0 ? (
            <>
              <div className="px-6 py-4 bg-secondary/5 border-b border-border">
                <p className="text-text-secondary text-sm font-medium">
                  {results.length} resultado{results.length !== 1 ? "s" : ""} encontrado{results.length !== 1 ? "s" : ""}
                </p>
              </div>
              <Table striped highlight="primary" className="border-0 shadow-none">
                <TableHeader>
                  <th className="w-1/3">Título</th>
                  <th className="w-16">Tipo</th>
                  <th className="w-20">Fecha</th>
                  <th className="w-20">Relevancia</th>
                  <th className="w-24">Estado</th>
                  <th>Acciones</th>
                </TableHeader>
                {results.map((item: any) => (
                  <TableRow key={item.id} className="transition-all duration-200 hover:bg-primary/3">
                    <TableCell className="font-medium text-text-primary">{item.title}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-primary"></span>
                        {item.type}
                      </span>
                    </TableCell>
                    <TableCell className="text-text-muted">{item.date}</TableCell>
                    <TableCell className="text-text-muted text-sm font-medium">{item.relevance}</TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant(item.status)} className="animate-in fade-in">{item.status}</Badge>
                    </TableCell>
                    <TableCell className="text-text-secondary text-xs">
                      <Button variant="ghost" size="sm" className="py-1 px-2 text-xs">
                        Ver documento
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </Table>
            </>
          ) : (
            <EmptyState
              title="No se encontraron resultados"
              subtitle="Prueba con otros términos de búsqueda o revisa los filtros aplicados."
              action="Buscar de nuevo"
            />
          )}
        </div>
      </div>
    </main>
  );
}
