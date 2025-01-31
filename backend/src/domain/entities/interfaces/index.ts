import { User } from "../User";

export interface Entity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Searchable {
  search(query: string): Promise<any[]>;
}

export interface Auditable {
  createdBy?: User;
  createdById?: string;
  updatedBy?: User;
  updatedById?: string;
}