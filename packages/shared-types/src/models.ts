import {
  UserRole,
  DayhomeStatus,
  RoomAgeGroup,
  EducatorStatus,
  EnrollmentStatus,
  AttendanceStatus,
  InvoiceStatus,
  DocumentType,
  DocumentStatus,
  Gender,
  OrganizationStatus,
} from './enums';

export interface IUser {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  permissions?: string[];
  organizationId?: string;
  dayhomeId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrganization {
  id: string;
  name: string;
  email: string;
  status: OrganizationStatus;
  dayhomes?: IDayhome[];
  families?: IFamily[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IDayhome {
  id: string;
  organizationId: string;
  name: string;
  address?: string;
  capacity?: number;
  status: DayhomeStatus;
  licenseNumber?: string;
  licenseExpiry?: Date;
  rooms?: IRoom[];
  educators?: IEducator[];
  documents?: IDocument[];
  enrollments?: IEnrollment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IRoom {
  id: string;
  dayhomeId: string;
  name: string;
  capacity: number;
  ageGroup: RoomAgeGroup;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEducator {
  id: string;
  dayhomeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status: EducatorStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFamily {
  id: string;
  organizationId: string;
  primaryContactName: string;
  email: string;
  phone?: string;
  children?: IChild[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IChild {
  id: string;
  familyId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender?: Gender;
  allergies?: string[];
  medicalNotes?: string;
  enrollments?: IEnrollment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IEnrollment {
  id: string;
  childId: string;
  dayhomeId: string;
  roomId?: string;
  startDate: string;
  endDate?: string;
  status: EnrollmentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAttendance {
  id: string;
  childId: string;
  checkedInBy: string;
  checkInTime: Date;
  checkedOutBy?: string;
  checkOutTime?: Date;
  status: AttendanceStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface IInvoice {
  id: string;
  familyId: string;
  dayhomeId: string;
  totalAmount: number;
  subsidyAmount: number;
  paidAmount: number;
  dueDate: string;
  status: InvoiceStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDocument {
  id: string;
  dayhomeId?: string;
  educatorId?: string;
  documentType: DocumentType;
  fileUrl: string;
  expiryDate?: string;
  status: DocumentStatus;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMessage {
  id: string;
  threadId: string;
  senderEducatorId?: string;
  senderFamilyId?: string;
  body: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAuditLog {
  id: string;
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
