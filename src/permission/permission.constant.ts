export enum PermissionList {
    // User
    UserCreate = 'UserCreate',
    UserUpdate = 'UserUpdate',
    UserRead = 'UserRead',
    UserDelete = 'UserDelete',

    // Profile
    ProfileUpdate = 'ProfileUpdate',
    ProfileRead = 'ProfileRead',

    // Role
    RoleCreate = 'RoleCreate',
    RoleUpdate = 'RoleUpdate',
    RoleRead = 'RoleRead',
    RoleDelete = 'RoleDelete',

    // Permission
    PermissionCreate = 'PermissionCreate',
    PermissionUpdate = 'PermissionUpdate',
    PermissionRead = 'PermissionRead',
    PermissionDelete = 'PermissionDelete',

    // Product
    ProductCreate = 'ProductCreate',
    ProductUpdate = 'ProductUpdate',
    ProductRead = 'ProductRead',
    ProductDelete = 'ProductDelete',
    ProductList = 'ProductList',

    // Cart
    CartCreate = 'CartCreate',
    CartUpdate = 'CartUpdate',
    CartRead = 'CartRead',
    CartDelete = 'CartDelete',

    // Cart
    OrderCreate = 'OrderCreate',
    OrderUpdate = 'OrderUpdate',
    OrderRead = 'OrderRead',
    OrderList = 'OrderList',
    OrderDelete = 'OrderDelete',

    // Payment
    PaymentCreate = 'PaymentCreate',
    PaymentUpdate = 'PaymentUpdate',
    PaymentRead = 'PaymentRead',
    PaymentList = 'PaymentList'
}

export const PERMISSION_KEY = 'permissions';
