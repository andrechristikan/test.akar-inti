import { RoleEntity } from './role.schema';
import { Document } from 'mongoose';
import { PermissionEntity } from 'src/permission/permission.schema';
import { PermissionDocument } from 'src/permission/permission.interface';

export interface RoleDocumentFull extends Omit<RoleDocument, 'permissions'> {
    permissions: PermissionDocument[];
}

export type RoleDocument = RoleEntity & Document;
