export interface User {
    id: string;
    name: string;
    email: string;
    role: 'trainee' | 'admin';
    totalCredits: number;
    avatar?: string | null;
    ticketsCreated?: number;
    ticketsResolved?: number;
    createdAt: string;
    updatedAt: string;
}

export interface Ticket {
    id: string;
    title: string;
    description: string;
    status: 'open' | 'in-progress' | 'resolved';
    traineeId: string;
    redeemedBy?: string | null;
    reusedSolutionId?: string | null;
    tags?: string[];
    trainee?: Partial<User>;
    redeemer?: Partial<User>;
    attachments?: string[];
    solution?: Partial<Solution>;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
}

export interface Solution {
    id: string;
    ticketId: string;
    rootCause: string;
    fixSteps: string;
    preventionNotes?: string;
    tags: string[];
    reuseCount: number;
    createdBy: string;
    creator?: Partial<User>;
    ticket?: Partial<Ticket>;
    isActive: boolean;
    status: 'pending' | 'approved' | 'rejected';
    attachments?: string[];
    createdAt: string;
    updatedAt: string;
}

export interface UserStats {
    totalUsers: number;
    trainees: number;
    admins: number;
}

export interface TicketStats {
    totalTickets: number;
    open: number;
    inProgress: number;
    resolved: number;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    loading: boolean;
    error: string | null;
}

export interface TicketState {
    list: Ticket[];
    loading: boolean;
    error: string | null;
}

export interface AdminState {
    usersList: User[];
    pendingSolutions: Solution[];
    userStats: UserStats | null;
    ticketStats: TicketStats | null;
    loading: boolean;
    error: string | null;
}

export interface SolutionState {
    list: Solution[];
    searchResults: Ticket[];
    loading: boolean;
    error: string | null;
}

export interface CreditState {
    balance: number;
    history: any[];
    loading: boolean;
    error: string | null;
}
