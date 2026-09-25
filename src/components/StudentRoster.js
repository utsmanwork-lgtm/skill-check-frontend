import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import { Search, Filter, Check } from 'lucide-react';
export function StudentRoster({ students, selectedStudentId, onSelectStudent, loading = false, }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [classFilter, setClassFilter] = useState('');
    const classes = useMemo(() => {
        return Array.from(new Set(students.map((s) => s.class))).sort();
    }, [students]);
    const filteredStudents = useMemo(() => {
        return students.filter((student) => {
            const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesClass = !classFilter || student.class === classFilter;
            return matchesSearch && matchesClass && student.status === 'active';
        });
    }, [students, searchTerm, classFilter]);
    return (_jsxs("div", { className: "flex flex-col h-full bg-white rounded-lg border border-gray-200", children: [_jsxs("div", { className: "p-4 border-b border-gray-200 space-y-4", children: [_jsx("h2", { className: "text-lg font-semibold", children: "Student List" }), _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-3 text-gray-400", size: 18 }), _jsx("input", { type: "text", placeholder: "Search by name or email...", className: "input-field pl-10", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), disabled: loading })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Filter, { size: 18, className: "text-gray-500" }), _jsxs("select", { className: "input-field flex-1", value: classFilter, onChange: (e) => setClassFilter(e.target.value), disabled: loading, children: [_jsx("option", { value: "", children: "All Classes" }), classes.map((cls) => (_jsx("option", { value: cls, children: cls }, cls)))] })] })] }), _jsx("div", { className: "flex-1 overflow-y-auto", children: loading ? (_jsx("div", { className: "p-4 text-center text-gray-500", children: "Loading students..." })) : filteredStudents.length === 0 ? (_jsx("div", { className: "p-4 text-center text-gray-500", children: "No students found" })) : (_jsx("div", { className: "divide-y divide-gray-200", children: filteredStudents.map((student) => (_jsx("button", { onClick: () => onSelectStudent(student.id), className: `w-full text-left p-3 hover:bg-gray-50 transition-colors ${selectedStudentId === student.id ? 'bg-primary-50 border-l-4 border-primary-600' : ''}`, children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "font-medium text-gray-900", children: student.name }), _jsx("p", { className: "text-sm text-gray-500", children: student.email }), _jsx("p", { className: "text-xs text-gray-400 mt-1", children: student.class })] }), selectedStudentId === student.id && (_jsx(Check, { size: 20, className: "text-primary-600 mt-1" }))] }) }, student.id))) })) })] }));
}
