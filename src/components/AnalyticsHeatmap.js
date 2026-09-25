import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
export function AnalyticsHeatmap({ data, loading = false }) {
    const { students, skills, matrix } = useMemo(() => {
        const uniqueStudents = Array.from(new Map(data.map((d) => [d.studentId, d.studentName])).entries()).map(([id, name]) => ({ id, name }));
        const uniqueSkills = Array.from(new Map(data.map((d) => [d.skillId, d.skillName])).entries()).map(([id, name]) => ({ id, name }));
        const matrix = uniqueStudents.map((student) => uniqueSkills.map((skill) => data.find((d) => d.studentId === student.id && d.skillId === skill.id)?.completed
            ? 1
            : 0));
        return { students: uniqueStudents, skills: uniqueSkills, matrix };
    }, [data]);
    if (loading) {
        return _jsx("div", { className: "card p-4 text-center text-gray-500", children: "Loading analytics..." });
    }
    if (students.length === 0 || skills.length === 0) {
        return _jsx("div", { className: "card p-4 text-center text-gray-500", children: "No data available" });
    }
    return (_jsxs("div", { className: "card overflow-x-auto", children: [_jsx("h2", { className: "text-lg font-semibold mb-4", children: "Student Skills Matrix" }), _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-gray-200", children: [_jsx("th", { className: "text-left font-medium p-2 bg-gray-50 sticky left-0 z-10", children: "Student" }), skills.map((skill) => (_jsx("th", { className: "text-center font-medium p-2 bg-gray-50 min-w-16", title: skill.name, children: _jsx("span", { className: "text-xs", children: skill.name.substring(0, 8) }) }, skill.id)))] }) }), _jsx("tbody", { children: students.map((student, studentIdx) => (_jsxs("tr", { className: "border-b border-gray-100 hover:bg-gray-50", children: [_jsx("td", { className: "p-2 font-medium text-gray-900 sticky left-0 z-10 bg-white", children: student.name.substring(0, 15) }), matrix[studentIdx]?.map((completed, skillIdx) => (_jsx("td", { className: `text-center p-2 ${completed
                                        ? 'bg-success-100 text-success-700'
                                        : 'bg-gray-100 text-gray-400'}`, children: completed ? '✓' : '○' }, `${student.id}-${skills[skillIdx].id}`)))] }, student.id))) })] })] }));
}
