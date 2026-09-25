import { useState, useMemo } from 'react';
import type { Student } from '@types';
import { Search, Filter, Check } from 'lucide-react';

interface StudentRosterProps {
  students: Student[];
  selectedStudentId?: string;
  onSelectStudent: (studentId: string) => void;
  loading?: boolean;
}

export function StudentRoster({
  students,
  selectedStudentId,
  onSelectStudent,
  loading = false,
}: StudentRosterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState<string>('');

  const classes = useMemo(() => {
    return Array.from(new Set(students.map((s) => s.class))).sort();
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesClass = !classFilter || student.class === classFilter;
      return matchesSearch && matchesClass && student.status === 'active';
    });
  }, [students, searchTerm, classFilter]);

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200 space-y-4">
        <h2 className="text-lg font-semibold">Student List</h2>

        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name or email..."
            className="input-field pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-500" />
          <select
            className="input-field flex-1"
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            disabled={loading}
          >
            <option value="">All Classes</option>
            {classes.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500">Loading students...</div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No students found</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredStudents.map((student) => (
              <button
                key={student.id}
                onClick={() => onSelectStudent(student.id)}
                className={`w-full text-left p-3 hover:bg-gray-50 transition-colors ${
                  selectedStudentId === student.id ? 'bg-primary-50 border-l-4 border-primary-600' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{student.name}</p>
                    <p className="text-sm text-gray-500">{student.email}</p>
                    <p className="text-xs text-gray-400 mt-1">{student.class}</p>
                  </div>
                  {selectedStudentId === student.id && (
                    <Check size={20} className="text-primary-600 mt-1" />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
