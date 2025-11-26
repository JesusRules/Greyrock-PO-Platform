// Define the User Type
export type User = {
    _id: string; 
    firstName: string;
    lastName: string;
    // login: string;
    email: string;
    phoneNumber?: string;
    password?: string;
    signedImg?: string;
    departments?: string[];
    permissionRole?: string;
    signatureRole?: string;
    isArchived?: boolean;
    createdAt?: string;
};