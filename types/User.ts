// Define the User Type
export type User = {
    _id: string; 
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    password: string;
    role: string;
};