'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
} from '@spiced-dayhome/ui-kit';
import {
  ArrowLeft,
  Loader2,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Clock,
  FileText,
  Home,
  Users,
  AlertTriangle,
  Building2,
} from 'lucide-react';
import { dayhomesApi, DayhomeDetail } from '@/lib/api/dayhomes';
import { StatusBadge } from '@/components/dayhomes/status-badge';
import Link from 'next/link';

export default function DayhomeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  const id = params.id as string;

  const [dayhome, setDayhome] = useState<DayhomeDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    dayhomesApi
      .getById(id)
      .then(setDayhome)
      .catch(() => setDayhome(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!dayhome) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="mb-4 h-12 w-12 text-muted-foreground/40" />
        <h3 className="text-lg font-semibold">{t('dayhomes.notFound')}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{t('dayhomes.notFoundHint')}</p>
        <Button className="mt-4" variant="outline" onClick={() => router.push('/admin/dayhomes')}>
          {t('common.back')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/dayhomes">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{dayhome.name}</h1>
            <StatusBadge status={dayhome.status} />
          </div>
          {dayhome.addressCity && (
            <p className="mt-1 text-muted-foreground">
              {dayhome.addressLine1}, {dayhome.addressCity}, {dayhome.addressProvince} {dayhome.addressPostalCode}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t('dayhomes.educatorInfo')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium min-w-24">{t('dayhomes.educatorName')}</span>
              <span>{dayhome.educatorFirstName} {dayhome.educatorLastName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{dayhome.educatorEmail}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{dayhome.educatorPhone}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {t('dayhomes.address')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>{dayhome.addressLine1}</p>
            <p>{dayhome.addressCity}, {dayhome.addressProvince} {dayhome.addressPostalCode}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              {t('dayhomes.propertyDetails')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('dayhomes.homeType')}</span>
              <span className="font-medium capitalize">{dayhome.homeType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('dayhomes.homeOwnership')}</span>
              <span className="font-medium capitalize">{dayhome.homeOwnership}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('dayhomes.fencedBackyard')}</span>
              <span className="font-medium">{dayhome.fencedBackyard ? t('common.yes') : t('common.no')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('dayhomes.smokingStatus')}</span>
              <span className="font-medium capitalize">{dayhome.smokingStatus.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('dayhomes.hasPets')}</span>
              <span className="font-medium">{dayhome.hasPets ? t('common.yes') : t('common.no')}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {t('dayhomes.operations')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('dayhomes.capacity')}</span>
              <span className="font-medium">{dayhome.currentCapacity} / {dayhome.maximumCapacity}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{dayhome.operatingHoursStart?.slice(0, 5)} - {dayhome.operatingHoursEnd?.slice(0, 5)}</span>
            </div>
            {dayhome.childcareLevel && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('dayhomes.childcareLevel')}</span>
                <span className="font-medium">{dayhome.childcareLevel}</span>
              </div>
            )}
            {dayhome.languagesSpoken && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('dayhomes.languages')}</span>
                <span className="font-medium">{dayhome.languagesSpoken}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t('dayhomes.licenseInfo')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('dayhomes.certificateNumber')}</span>
              <span className="font-medium">{dayhome.certificateNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('dayhomes.licenseIssueDate')}</span>
              <span className="font-medium">{new Date(dayhome.licenseIssueDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('dayhomes.licenseExpiryDate')}</span>
              <span className="font-medium">{new Date(dayhome.licenseExpiryDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('dayhomes.licenseStatus')}</span>
              <span className="font-medium capitalize">{dayhome.licenseStatus}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {t('dayhomes.timeline')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('dayhomes.submittedAt')}</span>
              <span className="font-medium">{new Date(dayhome.submittedAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('dayhomes.approvedAt')}</span>
              <span className="font-medium">{new Date(dayhome.approvedAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('dayhomes.activatedAt')}</span>
              <span className="font-medium">{new Date(dayhome.activatedAt).toLocaleDateString()}</span>
            </div>
            {dayhome.nextComplianceDue && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('dayhomes.nextComplianceDue')}</span>
                <span className="font-medium">{new Date(dayhome.nextComplianceDue).toLocaleDateString()}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {dayhome.inspectionConductedAt && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              {t('dayhomes.inspectionDetails')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">{t('dayhomes.inspectionResult')}</p>
                <span className={`text-lg font-semibold ${
                  dayhome.inspectionResult === 'pass' ? 'text-green-600' :
                  dayhome.inspectionResult === 'conditional' ? 'text-orange-600' :
                  'text-red-600'
                }`}>
                  {dayhome.inspectionResult}
                </span>
              </div>
              {dayhome.inspectionScore != null && (
                <div>
                  <p className="text-sm text-muted-foreground">{t('dayhomes.inspectionScore')}</p>
                  <p className="text-lg font-semibold">{dayhome.inspectionScore}%</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">{t('dayhomes.inspectionDate')}</p>
                <p className="text-lg font-semibold">{new Date(dayhome.inspectionConductedAt).toLocaleDateString()}</p>
              </div>
            </div>
            {(dayhome.inspectionItemsPassed != null || dayhome.inspectionItemsFailed != null) && (
              <div className="mt-4 flex gap-6 text-sm">
                <div>
                  <span className="text-muted-foreground">{t('dayhomes.itemsPassed')}: </span>
                  <span className="font-medium text-green-600">{dayhome.inspectionItemsPassed}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">{t('dayhomes.itemsFailed')}: </span>
                  <span className="font-medium text-red-600">{dayhome.inspectionItemsFailed}</span>
                </div>
                {dayhome.inspectionCriticalFailures != null && (
                  <div>
                    <span className="text-muted-foreground">{t('dayhomes.criticalFailures')}: </span>
                    <span className="font-medium text-red-600">{dayhome.inspectionCriticalFailures}</span>
                  </div>
                )}
              </div>
            )}
            {dayhome.inspectionSummary && (
              <p className="mt-4 text-sm">{dayhome.inspectionSummary}</p>
            )}
            {dayhome.inspectionInspectorName && (
              <p className="mt-2 text-sm text-muted-foreground">
                {t('dayhomes.inspector')}: {dayhome.inspectionInspectorName}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
