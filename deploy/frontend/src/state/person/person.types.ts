export interface DocumentData {
  path: string;
  name: string;
  value: string;
}
export interface RoleData {
  id: number;
  name: string;
}

export interface RoleState {
  roles: RoleData[];
  loading: boolean;
  error: string | null;
  success: string | null;
}

export interface PersonFormDataBase {
  profileImage: string;
  employeeNumber: number;
  name: string;
  address: string;
  mail: string;
  picture: string;
  additionalInfo: string;
  roles: number[];
  workplaces: number[];
  startDate: string | Date | null;
  endDate: string | Date | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  id?: string;
  documents: DocumentData[] | number[];
}

export interface PersonState {
  persons: PersonFormDataBase[];
  person: PersonFormDataBase;
  total: number;
  loading: boolean;
  error: string | null;
  success: string | null;
}

export const mimeTypes: Record<string, string> = {
  pdf: 'application/pdf',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  bmp: 'image/bmp',
  txt: 'text/plain',
  csv: 'text/csv',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  mp4: 'video/mp4',
  mp3: 'audio/mpeg',
};
