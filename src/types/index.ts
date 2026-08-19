export type BookGenre = 
  | 'Science Fiction' | 'Computer Science' | 'Philosophy' 
  | 'Mathematics' | 'Literature' | 'History' 
  | 'Physics' | 'Biology' | 'Psychology' | 'Art & Design' 
  | 'All';

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  genre: BookGenre;
  publishYear: number;
  totalCopies: number;
  availableCopies: number;
  description: string;
  coverHue: number;
  tags: string[];
  coverImageUrl?: string; // from ISBN lookup
}

export interface Student {
  id: string;
  name: string;
  studentId: string;
  issuedBooks: string[]; // array of book IDs
  password?: string;
  fines: number;          // total unpaid fines in ₹
  fineWarnings: number;   // count of late returns (blocks at 4 if unpaid)
  phone: string;
  photoUrl: string;
}

export interface IssuedBookRecord {
  id: string;
  bookId: string;
  studentId: string;     // internal student id
  issuedAt: number;      // timestamp ms
  dueDate: number;       // timestamp ms
  returnedAt?: number;   // timestamp ms
  pin: string;           // 4-digit verification PIN for issuing
  verified: boolean;     // librarian verified issue PIN
  returnPin?: string;    // 4-digit verification PIN for returning
  pendingReturn?: boolean; // if student initiated return
  damageReport?: DamageReport;
}

export interface DamageReport {
  description: string;
  photoUrl: string;      // base64 data url from FileReader
  submittedAt: number;
}

export type ViewState = 'librarian' | 'student';
export type ButtonState = 'idle' | 'loading' | 'success' | 'error';
export type UserRole = 'librarian' | 'student' | null;
export type ThemeMode = 'light' | 'dark';
