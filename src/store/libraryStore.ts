import { create } from 'zustand';
import { Book, Student, BookGenre, UserRole, ThemeMode, IssuedBookRecord, DamageReport } from '../types';
import { MOCK_BOOKS, MOCK_STUDENTS } from '../data/mockData';

// Constants
const LOAN_PERIOD_DAYS = 14;
const GRACE_PERIOD_HOURS = 1;
const DAILY_FINE_RUPEES = 10;
const EXTRA_FINE_AFTER_5_DAYS = 5;
const MAX_WARNINGS_BEFORE_BLOCK = 4;

function generatePin(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

function calculateFine(dueDate: number, returnDate: number): number {
  const graceEnd = dueDate + GRACE_PERIOD_HOURS * 60 * 60 * 1000;
  if (returnDate <= graceEnd) return 0;
  
  const overdueMs = returnDate - graceEnd;
  const overdueDays = Math.ceil(overdueMs / (24 * 60 * 60 * 1000));
  
  if (overdueDays <= 5) {
    return overdueDays * DAILY_FINE_RUPEES;
  } else {
    const first5 = 5 * DAILY_FINE_RUPEES;
    const remaining = (overdueDays - 5) * (DAILY_FINE_RUPEES + EXTRA_FINE_AFTER_5_DAYS);
    return first5 + remaining;
  }
}

function getDueDate(issuedAt: number): number {
  return issuedAt + LOAN_PERIOD_DAYS * 24 * 60 * 60 * 1000;
}

// Build initial issued records from mock data
function buildInitialRecords(): IssuedBookRecord[] {
  const records: IssuedBookRecord[] = [];
  const now = Date.now();
  MOCK_STUDENTS.forEach(student => {
    student.issuedBooks.forEach((bookId, idx) => {
      const issuedAt = now - (7 + idx * 2) * 24 * 60 * 60 * 1000; // issued 7-9 days ago
      records.push({
        id: `rec-init-${student.id}-${bookId}`,
        bookId,
        studentId: student.id,
        issuedAt,
        dueDate: getDueDate(issuedAt),
        pin: generatePin(),
        verified: true,
      });
    });
  });
  return records;
}

interface LibraryState {
  // Auth
  isAuthenticated: boolean;
  userRole: UserRole;
  loggedInStudentId: string | null;
  theme: ThemeMode;
  
  // Data
  books: Book[];
  students: Student[];
  issuedRecords: IssuedBookRecord[];
  searchQuery: string;
  selectedGenre: BookGenre | 'All';

  // Notifications
  pendingNotifications: Array<{ id: string; message: string; timestamp: number; read: boolean }>;
  studentNotifications: Array<{ id: string; studentId: string; message: string; read: boolean }>;

  // Auth actions
  login: (role: UserRole, studentId?: string) => void;
  logout: () => void;
  toggleTheme: () => void;

  // Student management
  addStudent: (student: Omit<Student, 'id' | 'fines' | 'fineWarnings'>) => void;
  updateStudentProfile: (studentId: string, updates: { phone?: string; photoUrl?: string }) => void;

  // Book actions
  setSearchQuery: (query: string) => void;
  setSelectedGenre: (genre: BookGenre | 'All') => void;
  addBook: (book: Omit<Book, 'id'>) => void;
  deleteBook: (id: string) => void;
  updateQuantity: (id: string, newTotal: number) => void;
  
  // Issue/Return
  issueBook: (bookId: string, studentId: string) => Promise<{ pin: string } | null>;
  initiateReturn: (bookId: string, studentId: string) => Promise<{ pin: string; estimatedFine: number } | null>;
  verifyReturn: (recordId: string, pin: string) => boolean;
  canIssueBook: (studentId: string) => boolean;
  
  // PIN verification
  verifyPin: (recordId: string, pin: string) => boolean;
  getPendingVerifications: () => IssuedBookRecord[];
  
  // Damage reports
  submitDamageReport: (recordId: string, report: DamageReport) => void;

  // Fines
  payFine: (studentId: string, amount: number) => void;
  getStudentFines: (studentId: string) => number;

  // Notifications
  addNotification: (message: string) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  addStudentNotification: (studentId: string, message: string) => void;
  dismissStudentNotification: (id: string) => void;

  // Selectors
  getFilteredBooks: () => Book[];
  getStudentIssuedBooks: (studentId: string) => Book[];
  getStudentIssuedRecords: (studentId: string) => IssuedBookRecord[];
  getOverdueRecords: () => (IssuedBookRecord & { fine: number; daysOverdue: number; studentName: string; bookTitle: string })[];
  getCurrentlyIssuedDetails: () => (IssuedBookRecord & { studentName: string; studentSid: string; bookTitle: string; daysLeft: number })[];
  getAvailableByGenre: () => Record<string, { genre: string; books: Book[]; totalAvailable: number; totalCopies: number }>;
  getMetrics: () => { totalBooks: number; availableCount: number; issuedCount: number; overdueCount: number; totalTitles: number };
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  isAuthenticated: false,
  userRole: null,
  loggedInStudentId: null,
  theme: 'light',

  books: MOCK_BOOKS,
  students: MOCK_STUDENTS,
  issuedRecords: buildInitialRecords(),
  searchQuery: '',
  selectedGenre: 'All',
  pendingNotifications: [],
  studentNotifications: [],

  login: (role, studentId) => set({ 
    isAuthenticated: true, 
    userRole: role, 
    loggedInStudentId: studentId || null 
  }),
  
  logout: () => set({ 
    isAuthenticated: false, 
    userRole: null, 
    loggedInStudentId: null 
  }),

  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),

  // ── Student Management ──
  addStudent: (studentData) => set((state) => ({
    students: [...state.students, {
      ...studentData,
      id: `stu-${Date.now()}`,
      fines: 0,
      fineWarnings: 0,
    }]
  })),

  updateStudentProfile: (studentId, updates) => set((state) => ({
    students: state.students.map(s => s.id === studentId ? { ...s, ...updates } : s)
  })),

  // ── Book Actions ──
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedGenre: (genre) => set({ selectedGenre: genre }),

  addBook: (bookData) => set((state) => ({
    books: [{ ...bookData, id: `book-${Date.now()}` }, ...state.books]
  })),

  deleteBook: (id) => set((state) => ({
    books: state.books.filter(b => b.id !== id)
  })),

  updateQuantity: (id, newTotal) => set((state) => ({
    books: state.books.map(b => {
      if (b.id !== id) return b;
      const diff = newTotal - b.totalCopies;
      return { ...b, totalCopies: newTotal, availableCopies: Math.max(0, b.availableCopies + diff) };
    })
  })),

  // ── Issue Book ──
  issueBook: async (bookId, studentId) => {
    await new Promise(r => setTimeout(r, 1200));
    const state = get();
    const book = state.books.find(b => b.id === bookId);
    if (!book || book.availableCopies <= 0) return null;
    if (!get().canIssueBook(studentId)) return null;

    const pin = generatePin();
    const now = Date.now();
    const record: IssuedBookRecord = {
      id: `rec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      bookId,
      studentId,
      issuedAt: now,
      dueDate: getDueDate(now),
      pin,
      verified: false,
    };

    const student = state.students.find(s => s.id === studentId);
    
    set({
      books: state.books.map(b => b.id === bookId ? { ...b, availableCopies: b.availableCopies - 1 } : b),
      students: state.students.map(s => s.id === studentId && !s.issuedBooks.includes(bookId)
        ? { ...s, issuedBooks: [...s.issuedBooks, bookId] } : s),
      issuedRecords: [...state.issuedRecords, record],
    });

    // Add notification for librarian
    get().addNotification(`📚 ${student?.name || 'A student'} has issued "${book.title}". PIN: ${pin}`);

    return { pin };
  },

  // ── Initiate Return ──
  initiateReturn: async (bookId, studentId) => {
    await new Promise(r => setTimeout(r, 1200));
    const state = get();
    const now = Date.now();

    const record = state.issuedRecords.find(r => 
      r.bookId === bookId && r.studentId === studentId && !r.returnedAt && !r.pendingReturn
    );

    if (!record) return null;

    const returnPin = generatePin();
    let estimatedFine = calculateFine(record.dueDate, now);

    set({
      issuedRecords: state.issuedRecords.map(r => 
        r.id === record.id
          ? { ...r, pendingReturn: true, returnPin }
          : r
      ),
    });

    const student = state.students.find(s => s.id === studentId);
    const book = state.books.find(b => b.id === bookId);
    get().addNotification(`📚 ${student?.name || 'A student'} is returning "${book?.title}". Return PIN: ${returnPin}`);

    return { pin: returnPin, estimatedFine };
  },

  // ── Verify Return ──
  verifyReturn: (recordId, pin) => {
    const state = get();
    const now = Date.now();
    const record = state.issuedRecords.find(r => r.id === recordId);
    
    if (!record || record.returnPin !== pin || !record.pendingReturn) return false;

    let fine = calculateFine(record.dueDate, now);

    set({
      books: state.books.map(b => b.id === record.bookId ? { ...b, availableCopies: b.availableCopies + 1 } : b),
      students: state.students.map(s => {
        if (s.id !== record.studentId) return s;
        return {
          ...s,
          issuedBooks: s.issuedBooks.filter(id => id !== record.bookId),
          fines: s.fines + fine,
          fineWarnings: fine > 0 ? s.fineWarnings + 1 : s.fineWarnings,
        };
      }),
      issuedRecords: state.issuedRecords.map(r => 
        r.id === recordId
          ? { ...r, returnedAt: now, pendingReturn: false }
          : r
      ),
    });

    const book = state.books.find(b => b.id === record.bookId);
    get().addStudentNotification(record.studentId, `Book "${book?.title}" returned successfully!`);

    return true;
  },

  canIssueBook: (studentId) => {
    const { students } = get();
    const student = students.find(s => s.id === studentId);
    if (!student) return false;
    if (student.fines > 0 && student.fineWarnings >= MAX_WARNINGS_BEFORE_BLOCK) return false;
    return true;
  },

  // ── PIN Verification ──
  verifyPin: (recordId, pin) => {
    const { issuedRecords } = get();
    const record = issuedRecords.find(r => r.id === recordId);
    if (!record || record.pin !== pin) return false;

    set({
      issuedRecords: get().issuedRecords.map(r => 
        r.id === recordId ? { ...r, verified: true } : r
      ),
    });
    return true;
  },

  getPendingVerifications: () => {
    return get().issuedRecords.filter(r => (!r.verified && !r.returnedAt) || r.pendingReturn);
  },

  // ── Damage Reports ──
  submitDamageReport: (recordId, report) => set((state) => ({
    issuedRecords: state.issuedRecords.map(r =>
      r.id === recordId ? { ...r, damageReport: report } : r
    ),
  })),

  // ── Fines ──
  payFine: (studentId, amount) => set((state) => ({
    students: state.students.map(s => {
      if (s.id !== studentId) return s;
      const newFines = Math.max(0, s.fines - amount);
      return {
        ...s,
        fines: newFines,
        fineWarnings: newFines === 0 ? 0 : s.fineWarnings,
      };
    })
  })),

  getStudentFines: (studentId) => {
    const student = get().students.find(s => s.id === studentId);
    return student?.fines ?? 0;
  },

  // ── Notifications ──
  addNotification: (message) => set((state) => ({
    pendingNotifications: [
      { id: `notif-${Date.now()}`, message, timestamp: Date.now(), read: false },
      ...state.pendingNotifications,
    ]
  })),

  markNotificationRead: (id) => set((state) => ({
    pendingNotifications: state.pendingNotifications.map(n => n.id === id ? { ...n, read: true } : n)
  })),

  clearNotifications: () => set({ pendingNotifications: [] }),

  addStudentNotification: (studentId, message) => set((state) => ({
    studentNotifications: [
      ...state.studentNotifications,
      { id: `s-notif-${Date.now()}`, studentId, message, read: false }
    ]
  })),

  dismissStudentNotification: (id) => set((state) => ({
    studentNotifications: state.studentNotifications.filter(n => n.id !== id)
  })),

  // ── Selectors ──
  getFilteredBooks: () => {
    const { books, searchQuery, selectedGenre } = get();
    const query = searchQuery.toLowerCase();
    return books.filter(b => {
      const matchesSearch = b.title.toLowerCase().includes(query) || 
                            b.author.toLowerCase().includes(query) || 
                            b.isbn.includes(query);
      const matchesGenre = selectedGenre === 'All' || b.genre === selectedGenre;
      return matchesSearch && matchesGenre;
    });
  },

  getStudentIssuedBooks: (studentId) => {
    const { books, students } = get();
    const student = students.find(s => s.id === studentId);
    if (!student) return [];
    return student.issuedBooks
      .map(bookId => books.find(b => b.id === bookId))
      .filter((b): b is Book => b !== undefined);
  },

  getStudentIssuedRecords: (studentId) => {
    return get().issuedRecords.filter(r => r.studentId === studentId && !r.returnedAt);
  },

  getOverdueRecords: () => {
    const { issuedRecords, students, books } = get();
    const now = Date.now();
    return issuedRecords
      .filter(r => !r.returnedAt && r.dueDate < now)
      .map(r => {
        const fine = calculateFine(r.dueDate, now);
        const overdueMs = now - r.dueDate;
        const daysOverdue = Math.ceil(overdueMs / (24 * 60 * 60 * 1000));
        const student = students.find(s => s.id === r.studentId);
        const book = books.find(b => b.id === r.bookId);
        return {
          ...r,
          fine,
          daysOverdue,
          studentName: student?.name ?? 'Unknown',
          bookTitle: book?.title ?? 'Unknown',
        };
      });
  },

  getCurrentlyIssuedDetails: () => {
    const { issuedRecords, students, books } = get();
    const now = Date.now();
    return issuedRecords
      .filter(r => !r.returnedAt)
      .map(r => {
        const student = students.find(s => s.id === r.studentId);
        const book = books.find(b => b.id === r.bookId);
        const daysLeft = Math.ceil((r.dueDate - now) / (24 * 60 * 60 * 1000));
        return {
          ...r,
          studentName: student?.name ?? 'Unknown',
          studentSid: student?.studentId ?? '—',
          bookTitle: book?.title ?? 'Unknown',
          daysLeft,
        };
      })
      .sort((a, b) => a.daysLeft - b.daysLeft); // most urgent first
  },

  getAvailableByGenre: () => {
    const { books } = get();
    const groups: Record<string, { genre: string; books: Book[]; totalAvailable: number; totalCopies: number }> = {};
    books.forEach(b => {
      if (!groups[b.genre]) {
        groups[b.genre] = { genre: b.genre, books: [], totalAvailable: 0, totalCopies: 0 };
      }
      groups[b.genre].books.push(b);
      groups[b.genre].totalAvailable += b.availableCopies;
      groups[b.genre].totalCopies += b.totalCopies;
    });
    return groups;
  },

  getMetrics: () => {
    const { books, issuedRecords } = get();
    const now = Date.now();
    const totalTitles = books.length;
    const totalBooks = books.reduce((sum, b) => sum + b.totalCopies, 0);
    const availableCount = books.reduce((sum, b) => sum + b.availableCopies, 0);
    const activeRecords = issuedRecords.filter(r => !r.returnedAt);
    const issuedCount = activeRecords.length;
    const overdueCount = activeRecords.filter(r => r.dueDate < now).length;
    return { totalTitles, totalBooks, availableCount, issuedCount, overdueCount };
  }
}));
