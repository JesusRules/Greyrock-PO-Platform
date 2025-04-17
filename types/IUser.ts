// Define the User Type
export interface IUser {
    _id: string; 
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    password: string;
    role: string;
};