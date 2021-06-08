import { RoleEntity } from './role.schema';
import { Document } from 'mongoose';
import { PermissionEntity } from 'src/permission/permission.schema';

export interface RoleDocumentFull extends Omit<RoleDocument, 'permissions'> {
    permissions: PermissionEntity[];
}

export type RoleDocument = RoleEntity & Document;
