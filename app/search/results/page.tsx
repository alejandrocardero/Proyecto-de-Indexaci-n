"use client";

export const dynamic = "force-dynamic";

import { cn } from "@/lib/utils";
import { useState, useCallback } from "react";
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { Skeleton } from "@/components/ui/skeleton";

interface SearchResult {
  id: number;
  title: string;
  type: string;
  date: string;
  relevance: string;
  status: "pending" | "approved" | "rejected";
}

const MOCK_RESULTS: SearchResult[] = [
  { id: 1, title: "Informe trimestral Q4 2023", type: "PDF", date: "2024-01-15", status: "pending", relevance: "95%" },
  { id: 2, title: "Manual de usuario v2.1", type: "DOCX", date: "2024-01-10", status: "approved", relevance: "88%" },
  { id: 3, title: "Presupuesto anual 2024", type: "XLSX", date: "2024-01-05", status: "pending", relevance: "82%" },
  { id: 4, title: "Política de seguridad", type: "PDF", date: "2024-01-01", status: "approved", relevance: "76%" },
  { id: 5, title: "Manual de cumplimiento", type: "PDF", date: "2023-12-20", status: "rejected", relevance: "70%" },
];

export default function SearchResultsPage() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<{ status?: string; dateRange?: string }>({});
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setSearching(true);
    await new Promise((r) => setTimeout(r, 800));

    const filtered = MOCK_RESULTS.filter((item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) &&
      (!filters.status || item.status === filters.status)
    );
    setResults(filtered);
    setSearching(false);
  }, [query, filters]);

  const statusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending": return "primary";
      case "approved": return "success";
      case "rejected": return "destructive";
      default: return "secondary";
    }
  };

  if (searching) {
    return (
      <main className="min-h-screen bg-background py-10 px-4 sm:px-6 lg:px-8 animate-in">
        <div className="max-w-6xl mx-auto w-full">
          <nav className="mb-12 flex items-center gap-4 text-xs uppercase tracking-wider text-text-muted">
            <Breadcrumb items={[{ label: "Inicio", href: "/" }, { label: "Búsqueda" }]} className="gap-4" />
          </nav>
          <div className="text-center py-20">
            <div className="flex flex-col items-center gap-4">
              <Skeleton width="200" height="1rem" radius="full" />
              <Skeleton width="400" height="0.875rem" radius="md" />
              <Skeleton width="100%" height="4rem" radius="md" />
              <Skeleton width="100%" height="0.875rem" radius="md" />
              <Skeleton width="80" height="0.875rem" radius="full" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background py-10 px-4 sm:px-6 lg:px-8 animate-in">
      <div className="max-w-6xl mx-auto w-full">
        <ScrollReveal variant="fade" once className="mb-12">
          <nav className="mb-12 flex items-center gap-4 text-xs uppercase tracking-wider text-text-muted">
            <Breadcrumb items={[{ label: "Inicio", href: "/" }, { label: "Búsqueda" }]} className="gap-4" />
          </nav>
        </ScrollReveal>

        <ScrollReveal variant="slide-up" once className="mb-8">
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
        </ScrollReveal>

        <ScrollReveal variant="fade" once>
          <div className="mb-8 max-w-xl mx-auto">
            <div className="flex items-center gap-0 rounded-xl border border-border bg-surface shadow-sm hover:shadow-md transition-shadow duration-300">
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
                className="px-4 py-2 text-sm rounded-r-xl shadow-none min-w-fit transform hover:scale-[1.02] transition-all duration-300"
              >
                {searching ? "Buscando…" : "Buscar"}
              </Button>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal variant="fade" once>
          <div className="mb-8 flex flex-col sm:flex-row gap-2 items-center justify-center">
            <select
              className={cn(
                "rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                "bg-surface text-text-primary hover:bg-primary/5 transition-colors",
                "shadow-sm hover:shadow-md",
                "transform hover:scale-[1.02] transition-all duration-200",
              )}
              value={filters.status || ""}
              onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined })}
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
                "transform hover:scale-[1.02] transition-all duration-200",
              )}
              value={filters.dateRange || ""}
              onChange={(e) => setFilters({ ...filters, dateRange: e.target.value || undefined })}
            >
              <option value="">Todos los períodos</option>
              <option value="this-month">Este mes</option>
              <option value="last-month">Mes anterior</option>
            </select>
          </div>
        </ScrollReveal>

        <ScrollReveal variant="fade" once>
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
                  {results.map((item) => (
                    <TableRow key={item.id} className="transition-all duration-200 hover:bg-primary/3">
                      <TableCell className="font-medium text-text-primary group-hover:text-primary transition-colors">{item.title}</TableCell>
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
                        <Button variant="ghost" size="sm" className="py-1 px-2 text-xs hover:bg-primary/5 transition-colors">Ver documento</Button>
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
        </ScrollReveal>
      </div>
    </main>
  );
}
