'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  Button,
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@spiced-dayhome/ui-kit';
import {
  Home,
  Building2,
  AlertTriangle,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { dayhomesApi, DayhomeListItem, DayhomePagination } from '@/lib/api/dayhomes';
import { StatusBadge } from '@/components/dayhomes/status-badge';
import Link from 'next/link';

const capacityPercent = (current: number, max: number): number => {
  if (max <= 0) return 0;
  return Math.round((current / max) * 100);
};

const capacityColor = (pct: number): string => {
  if (pct >= 95) return 'bg-red-500';
  if (pct >= 80) return 'bg-yellow-500';
  return 'bg-green-500';
};

export default function DayhomesPage() {
  const { t } = useTranslation();

  const [data, setData] = useState<DayhomeListItem[]>([]);
  const [pagination, setPagination] = useState<DayhomePagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchDayhomes = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 20 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (statusFilter) params.status = statusFilter;
      const res = await dayhomesApi.list(params);
      setData(res.data);
      setPagination(res.pagination);
    } catch {
      setData([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchDayhomes();
  }, [fetchDayhomes]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('dayhomes.pageTitle')}</h1>
          <p className="mt-1 text-muted-foreground">{t('dayhomes.pageDescription')}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-600">
              <Home className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('dayhomes.activeCount')}</p>
              <p className="text-2xl font-bold">
                {loading ? '-' : data.filter((d) => d.status === 'ACTIVE').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('dayhomes.suspendedCount')}</p>
              <p className="text-2xl font-bold">
                {loading ? '-' : data.filter((d) => d.status === 'SUSPENDED').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('dayhomes.totalCount')}</p>
              <p className="text-2xl font-bold">
                {loading ? '-' : pagination?.total ?? '-'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('dayhomes.search')}
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={(v: string) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder={t('dayhomes.allStatuses')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">{t('dayhomes.allStatuses')}</SelectItem>
            <SelectItem value="ACTIVE">{t('dayhomes.statusActive')}</SelectItem>
            <SelectItem value="SUSPENDED">{t('dayhomes.statusSuspended')}</SelectItem>
            <SelectItem value="CLOSED">{t('dayhomes.statusClosed')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Home className="mb-4 h-12 w-12 text-muted-foreground/40" />
          <h3 className="text-lg font-semibold">{t('dayhomes.noDayhomes')}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {debouncedSearch || statusFilter ? t('dayhomes.noDayhomesFilter') : t('dayhomes.noDayhomesHint')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((dayhome) => (
            <Link key={dayhome.id} href={`/admin/dayhomes/${dayhome.id}`}>
              <Card className="transition-colors hover:bg-muted/50 cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold leading-none">{dayhome.name}</h3>
                        <StatusBadge status={dayhome.status} />
                      </div>
                      <p className="mt-1.5 text-sm text-muted-foreground">
                        {dayhome.educatorFirstName} {dayhome.educatorLastName}
                        {dayhome.addressCity ? ` \u00B7 ${dayhome.addressCity}, ${dayhome.addressProvince}` : ''}
                      </p>
                      <div className="mt-3 flex items-center gap-6 text-sm">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-muted-foreground">{t('dayhomes.capacity')}</span>
                            <span className="font-medium">
                              {dayhome.currentCapacity} / {dayhome.maximumCapacity}
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-muted">
                            <div
                              className={`h-2 rounded-full transition-all ${capacityColor(capacityPercent(dayhome.currentCapacity, dayhome.maximumCapacity))}`}
                              style={{ width: `${Math.min(capacityPercent(dayhome.currentCapacity, dayhome.maximumCapacity), 100)}%` }}
                            />
                          </div>
                        </div>
                        {dayhome.inspectionResult && (
                          <div className="shrink-0 text-right">
                            <p className="text-muted-foreground">{t('dayhomes.inspection')}</p>
                            <span className={`font-medium ${
                              dayhome.inspectionResult === 'pass' ? 'text-green-600' :
                              dayhome.inspectionResult === 'conditional' ? 'text-orange-600' :
                              'text-red-600'
                            }`}>
                              {dayhome.inspectionResult}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t pt-4">
          <p className="text-sm text-muted-foreground">
            {t('common.showingPage', { page: pagination.page, total: pagination.totalPages })}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasPrev}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              {pagination.page} / {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasNext}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
