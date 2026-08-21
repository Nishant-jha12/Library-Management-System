import { create } from 'zustand';
import { Book, Student, BookGenre, UserRole, ThemeMode, IssuedBookRecord, DamageReport } from '../types';
import { MOCK_BOOKS, MOCK_STUDENTS } from '../data/mockData';
import { db } from '../firebase';
import {
  collection, doc, setDoc, updateDoc, onSnapshot,
  query, writeBatch, getDoc
} from 'firebase/firestore';

const LOAN_PERIOD_DAYS = 7;
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
  const overdueDays = Math.ceil((returnDate - graceEnd) / (24 * 60 * 60 * 1000));
  if (overdueDays <= 5) return overdueDays * DAILY_FINE_RUPEES;
  return 5 * DAILY_FINE_RUPEES + (overdueDays - 5) * (DAILY_FINE_RUPEES + EXTRA_FINE_AFTER_5_DAYS);
}

function getDueDate(issuedAt: number): number {
  return issuedAt + LOAN_PERIOD_DAYS * 24 * 60 * 60 * 1000;
}

function buildInitialRecords(): IssuedBookRecord[] {
  const records: IssuedBookRecord[] = [];
  const now = Date.now();
  MOCK_STUDENTS.forEach(student => {
    student.issuedBooks.forEach((bookId, idx) => {
      const issuedAt = now - (7 + idx * 2) * 24 * 60 * 60 * 1000;
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

const booksCol = collection(db, 'books');
const studentsCol = collection(db, 'students');
const recordsCol = collection(db, 'issuedRecords');
const libNotifCol = collection(db, 'librarianNotifications');
const stuNotifCol = collection(db, 'studentNotifications');
const metaDoc = doc(db, 'meta', 'initialized');

interface LibNotification {
  id: string;
  message: string;
  timestamp: number;
  read: boolean;
}

interface StuNotification {
  id: string;
  studentId: string;
  message: string;
  read: boolean;
}

interface LibraryState {
  isAuthenticated: boolean;
  userRole: UserRole;
  loggedInStudentId: string | null;
  theme: ThemeMode;
  books: Book[];
  students: Student[];
  issuedRecords: IssuedBookRecord[];
  searchQuery: string;
  selectedGenre: BookGenre | 'All';
  pendingNotifications: LibNotification[];
  studentNotifications: StuNotification[];
  firebaseReady: boolean;

  login: (role: UserRole, studentId?: string) => void;
  logout: () => void;
  toggleTheme: () => void;

  addStudent: (student: Omit<Student, 'id' | 'fines' | 'fineWarnings'>) => void;
  updateStudentProfile: (studentId: string, updates: { phone?: string; photoUrl?: string }) => void;

  setSearchQuery: (query: string) => void;
  setSelectedGenre: (genre: BookGenre | 'All') => void;
  addBook: (book: Omit<Book, 'id'>) => void;
  deleteBook: (id: string) => void;
  updateQuantity: (id: string, newTotal: number) => void;

  issueBook: (bookId: string, studentId: string) => Promise<{ pin: string } | null>;
  initiateReturn: (bookId: string, studentId: string) => Promise<{ pin: string; estimatedFine: number } | null>;
  reissueBook: (recordId: string) => Promise<boolean>;
  verifyReturn: (recordId: string, pin: string) => boolean;
  canIssueBook: (studentId: string) => boolean;

  verifyPin: (recordId: string, pin: string) => boolean;
  getPendingVerifications: () => IssuedBookRecord[];

  submitDamageReport: (recordId: string, report: DamageReport) => void;

  payFine: (studentId: string, amount: number) => void;
  getStudentFines: (studentId: string) => number;

  addNotification: (message: string) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  addStudentNotification: (studentId: string, message: string) => void;
  dismissStudentNotification: (id: string) => void;

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
  firebaseReady: false,

  login: (role, studentId) => set({ isAuthenticated: true, userRole: role, loggedInStudentId: studentId || null }),
  logout: () => set({ isAuthenticated: false, userRole: null, loggedInStudentId: null }),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),

  addStudent: (studentData) => {
    const newStudent: Student = { ...studentData, id: `stu-${Date.now()}`, fines: 0, fineWarnings: 0 };
    set((state) => ({ students: [...state.students, newStudent] }));
    setDoc(doc(studentsCol, newStudent.id), newStudent).catch(console.error);
  },

  updateStudentProfile: (studentId, updates) => {
    set((state) => ({ students: state.students.map(s => s.id === studentId ? { ...s, ...updates } : s) }));
    updateDoc(doc(studentsCol, studentId), updates).catch(console.error);
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedGenre: (genre) => set({ selectedGenre: genre }),

  addBook: (bookData) => {
    const newBook: Book = { ...bookData, id: `book-${Date.now()}` };
    set((state) => ({ books: [newBook, ...state.books] }));
    setDoc(doc(booksCol, newBook.id), newBook).catch(console.error);
  },

  deleteBook: (id) => {
    set((state) => ({ books: state.books.filter(b => b.id !== id) }));
    updateDoc(doc(booksCol, id), { deleted: true }).catch(console.error);
  },

  updateQuantity: (id, newTotal) => {
    set((state) => ({
      books: state.books.map(b => {
        if (b.id !== id) return b;
        const diff = newTotal - b.totalCopies;
        const updated = { ...b, totalCopies: newTotal, availableCopies: Math.max(0, b.availableCopies + diff) };
        updateDoc(doc(booksCol, id), { totalCopies: updated.totalCopies, availableCopies: updated.availableCopies }).catch(console.error);
        return updated;
      }),
    }));
  },

  issueBook: async (bookId, studentId) => {
    await new Promise(r => setTimeout(r, 1000));
    const state = get();
    const book = state.books.find(b => b.id === bookId);
    if (!book || book.availableCopies <= 0) return null;
    if (!get().canIssueBook(studentId)) return null;

    const pin = generatePin();
    const now = Date.now();
    const record: IssuedBookRecord = {
      id: `rec-${now}-${Math.random().toString(36).slice(2, 6)}`,
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
      students: state.students.map(s =>
        s.id === studentId && !s.issuedBooks.includes(bookId)
          ? { ...s, issuedBooks: [...s.issuedBooks, bookId] }
          : s
      ),
      issuedRecords: [...state.issuedRecords, record],
    });

    const batch = writeBatch(db);
    batch.update(doc(booksCol, bookId), { availableCopies: book.availableCopies - 1 });
    batch.set(doc(recordsCol, record.id), record);
    if (student) {
      const updatedIssuedBooks = student.issuedBooks.includes(bookId)
        ? student.issuedBooks
        : [...student.issuedBooks, bookId];
      batch.update(doc(studentsCol, studentId), { issuedBooks: updatedIssuedBooks });
    }
    const notifId = `notif-issue-${now}`;
    batch.set(doc(libNotifCol, notifId), {
      id: notifId,
      message: `📚 ${student?.name || 'A student'} has issued "${book.title}". PIN: ${pin}`,
      timestamp: now,
      read: false,
    });
    await batch.commit().catch(console.error);
    return { pin };
  },

  initiateReturn: async (bookId, studentId) => {
    await new Promise(r => setTimeout(r, 1000));
    const state = get();
    const now = Date.now();
    const record = state.issuedRecords.find(r =>
      r.bookId === bookId && r.studentId === studentId && !r.returnedAt && !r.pendingReturn
    );
    if (!record) return null;

    const returnPin = generatePin();
    const estimatedFine = calculateFine(record.dueDate, now);

    set({
      issuedRecords: state.issuedRecords.map(r =>
        r.id === record.id ? { ...r, pendingReturn: true, returnPin } : r
      ),
    });

    const student = state.students.find(s => s.id === studentId);
    const book = state.books.find(b => b.id === bookId);

    const batch = writeBatch(db);
    batch.update(doc(recordsCol, record.id), { pendingReturn: true, returnPin });
    const notifId = `notif-return-${now}`;
    batch.set(doc(libNotifCol, notifId), {
      id: notifId,
      message: `🔄 ${student?.name || 'A student'} is returning "${book?.title}". Return PIN: ${returnPin}`,
      timestamp: now,
      read: false,
    });
    await batch.commit().catch(console.error);
    return { pin: returnPin, estimatedFine };
  },

  reissueBook: async (recordId: string) => {
    await new Promise(r => setTimeout(r, 1000));
    const state = get();
    const now = Date.now();
    const record = state.issuedRecords.find(r => r.id === recordId && !r.returnedAt);
    if (!record) return false;

    // A book can only be reissued if it's within 1 day of deadline
    const oneDayInMs = 24 * 60 * 60 * 1000;
    if (record.dueDate - now > oneDayInMs) return false;
    
    // Add 7 days to the *current* due date
    const newDueDate = record.dueDate + 7 * 24 * 60 * 60 * 1000;
    
    const student = state.students.find(s => s.id === record.studentId);
    const book = state.books.find(b => b.id === record.bookId);

    set({
      issuedRecords: state.issuedRecords.map(r =>
        r.id === recordId ? { ...r, dueDate: newDueDate } : r
      ),
    });

    const batch = writeBatch(db);
    batch.update(doc(recordsCol, recordId), { dueDate: newDueDate });
    const notifId = `notif-reissue-${now}`;
    batch.set(doc(libNotifCol, notifId), {
      id: notifId,
      message: `📅 ${student?.name || 'A student'} has reissued "${book?.title}". New due date: ${new Date(newDueDate).toLocaleDateString()}`,
      timestamp: now,
      read: false,
    });
    await batch.commit().catch(console.error);
    return true;
  },

  verifyReturn: (recordId, pin) => {
    const state = get();
    const now = Date.now();
    const record = state.issuedRecords.find(r => r.id === recordId);
    if (!record || record.returnPin !== pin || !record.pendingReturn) return false;

    const fine = calculateFine(record.dueDate, now);
    const book = state.books.find(b => b.id === record.bookId);
    const student = state.students.find(s => s.id === record.studentId);

    set({
      books: state.books.map(b =>
        b.id === record.bookId ? { ...b, availableCopies: b.availableCopies + 1 } : b
      ),
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
        r.id === recordId ? { ...r, returnedAt: now, pendingReturn: false } : r
      ),
    });

    const batch = writeBatch(db);
    batch.update(doc(recordsCol, recordId), { returnedAt: now, pendingReturn: false });
    batch.update(doc(booksCol, record.bookId), { availableCopies: (book?.availableCopies ?? 0) + 1 });
    if (student) {
      batch.update(doc(studentsCol, record.studentId), {
        issuedBooks: student.issuedBooks.filter(id => id !== record.bookId),
        fines: student.fines + fine,
        fineWarnings: fine > 0 ? student.fineWarnings + 1 : student.fineWarnings,
      });
    }
    const stuNotifId = `stunotif-${now}`;
    batch.set(doc(stuNotifCol, stuNotifId), {
      id: stuNotifId,
      studentId: record.studentId,
      message: `✅ Book "${book?.title}" has been returned successfully!`,
      read: false,
    });
    batch.commit().catch(console.error);
    return true;
  },

  canIssueBook: (studentId) => {
    const student = get().students.find(s => s.id === studentId);
    if (!student) return false;
    if (student.fines > 0 && student.fineWarnings >= MAX_WARNINGS_BEFORE_BLOCK) return false;
    
    // Check limit of 2 books
    const activeIssues = get().issuedRecords.filter(r => r.studentId === studentId && !r.returnedAt);
    if (activeIssues.length >= 2) return false;
    
    return true;
  },

  verifyPin: (recordId, pin) => {
    const record = get().issuedRecords.find(r => r.id === recordId);
    if (!record || record.pin !== pin) return false;
    set({ issuedRecords: get().issuedRecords.map(r => r.id === recordId ? { ...r, verified: true } : r) });
    updateDoc(doc(recordsCol, recordId), { verified: true }).catch(console.error);
    return true;
  },

  getPendingVerifications: () =>
    get().issuedRecords.filter(r => (!r.verified && !r.returnedAt) || r.pendingReturn),

  submitDamageReport: (recordId, report) => {
    set((state) => ({
      issuedRecords: state.issuedRecords.map(r =>
        r.id === recordId ? { ...r, damageReport: report } : r
      ),
    }));
    updateDoc(doc(recordsCol, recordId), { damageReport: report }).catch(console.error);
  },

  payFine: (studentId, amount) => {
    set((state) => ({
      students: state.students.map(s => {
        if (s.id !== studentId) return s;
        const newFines = Math.max(0, s.fines - amount);
        const updated = { ...s, fines: newFines, fineWarnings: newFines === 0 ? 0 : s.fineWarnings };
        updateDoc(doc(studentsCol, studentId), { fines: updated.fines, fineWarnings: updated.fineWarnings }).catch(console.error);
        return updated;
      }),
    }));
  },

  getStudentFines: (studentId) =>
    get().students.find(s => s.id === studentId)?.fines ?? 0,

  addNotification: (message) => {
    const id = `notif-${Date.now()}`;
    const notif: LibNotification = { id, message, timestamp: Date.now(), read: false };
    set((state) => ({ pendingNotifications: [notif, ...state.pendingNotifications] }));
    setDoc(doc(libNotifCol, id), notif).catch(console.error);
  },

  markNotificationRead: (id) => {
    set((state) => ({
      pendingNotifications: state.pendingNotifications.map(n => n.id === id ? { ...n, read: true } : n),
    }));
    updateDoc(doc(libNotifCol, id), { read: true }).catch(console.error);
  },

  clearNotifications: () => set({ pendingNotifications: [] }),

  addStudentNotification: (studentId, message) => {
    const id = `stunotif-${Date.now()}`;
    const notif: StuNotification = { id, studentId, message, read: false };
    set((state) => ({ studentNotifications: [...state.studentNotifications, notif] }));
    setDoc(doc(stuNotifCol, id), notif).catch(console.error);
  },

  dismissStudentNotification: (id) =>
    set((state) => ({ studentNotifications: state.studentNotifications.filter(n => n.id !== id) })),

  getFilteredBooks: () => {
    const { books, searchQuery, selectedGenre } = get();
    const q = searchQuery.toLowerCase();
    return books.filter(b => {
      const matchesSearch = b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || b.isbn.includes(q);
      return matchesSearch && (selectedGenre === 'All' || b.genre === selectedGenre);
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

  getStudentIssuedRecords: (studentId) =>
    get().issuedRecords.filter(r => r.studentId === studentId && !r.returnedAt),

  getOverdueRecords: () => {
    const { issuedRecords, students, books } = get();
    const now = Date.now();
    return issuedRecords
      .filter(r => !r.returnedAt && r.dueDate < now)
      .map(r => ({
        ...r,
        fine: calculateFine(r.dueDate, now),
        daysOverdue: Math.ceil((now - r.dueDate) / (24 * 60 * 60 * 1000)),
        studentName: students.find(s => s.id === r.studentId)?.name ?? 'Unknown',
        bookTitle: books.find(b => b.id === r.bookId)?.title ?? 'Unknown',
      }));
  },

  getCurrentlyIssuedDetails: () => {
    const { issuedRecords, students, books } = get();
    const now = Date.now();
    return issuedRecords
      .filter(r => !r.returnedAt)
      .map(r => ({
        ...r,
        studentName: students.find(s => s.id === r.studentId)?.name ?? 'Unknown',
        studentSid: students.find(s => s.id === r.studentId)?.studentId ?? '—',
        bookTitle: books.find(b => b.id === r.bookId)?.title ?? 'Unknown',
        daysLeft: Math.ceil((r.dueDate - now) / (24 * 60 * 60 * 1000)),
      }))
      .sort((a, b) => a.daysLeft - b.daysLeft);
  },

  getAvailableByGenre: () => {
    const { books } = get();
    const groups: Record<string, { genre: string; books: Book[]; totalAvailable: number; totalCopies: number }> = {};
    books.forEach(b => {
      if (!groups[b.genre]) groups[b.genre] = { genre: b.genre, books: [], totalAvailable: 0, totalCopies: 0 };
      groups[b.genre].books.push(b);
      groups[b.genre].totalAvailable += b.availableCopies;
      groups[b.genre].totalCopies += b.totalCopies;
    });
    return groups;
  },

  getMetrics: () => {
    const { books, issuedRecords } = get();
    const activeIssues = issuedRecords.filter(r => !r.returnedAt);
    return {
      totalBooks: books.reduce((sum, b) => sum + b.totalCopies, 0),
      availableCount: books.reduce((sum, b) => sum + b.availableCopies, 0),
      issuedCount: activeIssues.length,
      overdueCount: activeIssues.filter(r => r.dueDate < Date.now()).length,
      totalTitles: books.length,
    };
  },
}));

// Real-time Firebase Listeners
getDoc(metaDoc).then(async (snap) => {
  if (!snap.exists()) {
    const batch = writeBatch(db);
    MOCK_BOOKS.forEach(book => batch.set(doc(booksCol, book.id), book));
    MOCK_STUDENTS.forEach(student => batch.set(doc(studentsCol, student.id), student));
    buildInitialRecords().forEach(record => batch.set(doc(recordsCol, record.id), record));
    batch.set(metaDoc, { initialized: true });
    await batch.commit();
  }
});

onSnapshot(query(booksCol), (snap) => {
  const books = snap.docs.map(d => d.data() as Book).filter(b => !(b as any).deleted);
  useLibraryStore.setState({ books });
});

onSnapshot(query(studentsCol), (snap) => {
  useLibraryStore.setState({ students: snap.docs.map(d => d.data() as Student) });
});

onSnapshot(query(recordsCol), (snap) => {
  useLibraryStore.setState({ issuedRecords: snap.docs.map(d => d.data() as IssuedBookRecord) });
});

onSnapshot(query(libNotifCol), (snap) => {
  const pendingNotifications = snap.docs
    .map(d => d.data() as LibNotification)
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 50);
  useLibraryStore.setState({ pendingNotifications });
});

onSnapshot(query(stuNotifCol), (snap) => {
  useLibraryStore.setState({ studentNotifications: snap.docs.map(d => d.data() as StuNotification) });
});
