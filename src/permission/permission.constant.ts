export enum PermissionList {
    // User
    UserCreate = 'UserCreate',
    UserUpdate = 'UserUpdate',
    UserRead = 'UserRead',
    UserDelete = 'UserDelete',

    // Profile
    ProfileUpdate = 'ProfileUpdate',
    ProfileRead = 'ProfileRead',

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

    // Cart
    OrderCreate = 'OrderCreate',
    OrderUpdate = 'OrderUpdate',
    OrderRead = 'OrderRead',
    OrderList = 'OrderList',

    // Payment
    PaymentCreate = 'PaymentCreate',
    PaymentRead = 'PaymentRead',
    PaymentList = 'PaymentList',
    PaymentDelete = 'PaymentDelete'
}

export const PERMISSION_KEY = 'permissions';
