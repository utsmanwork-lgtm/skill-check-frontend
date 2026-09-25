import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { assessmentService } from '@services/assessmentService';
import { StudentRoster } from '@components/StudentRoster';
import { SkillChecklistForm } from '@components/SkillChecklistForm';
import { SkillStatusTabs } from '@components/SkillStatusTabs';
import { LogOut } from 'lucide-react';
import { useAuth } from '@contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
export function GuruDashboardPage() {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [activeTab, setActiveTab] = useState('pending');
    const { data: students = [], isLoading: studentsLoading } = useQuery({
        queryKey: ['students'],
        queryFn: () => assessmentService.getStudents(),
    });
    const { data: skills = [], isLoading: skillsLoading } = useQuery({
        queryKey: ['skills'],
        queryFn: () => assessmentService.getSkills(),
    });
    const { data: studentSkills = [], isLoading: studentSkillsLoading } = useQuery({
        queryKey: ['studentSkills', selectedStudentId],
        queryFn: () => assessmentService.getStudentSkills(selectedStudentId),
        enabled: !!selectedStudentId,
    });
    const { mutate: saveAssessment, isPending: isSaving } = useMutation({
        mutationFn: (skillChecks) => assessmentService.saveAssessment(selectedStudentId, skillChecks),
        onSuccess: () => {
            alert('Assessment saved successfully!');
        },
    });
    const handleSaveAssessment = async (skillChecks) => {
        return new Promise((resolve, reject) => {
            saveAssessment(skillChecks, {
                onSuccess: () => resolve(),
                onError: (error) => reject(error),
            });
        });
    };
    const completedSkills = studentSkills.filter((s) => s.completed).length;
    const pendingSkills = studentSkills.filter((s) => !s.completed).length;
    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx("header", { className: "bg-white border-b border-gray-200 sticky top-0 z-50", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 py-4 flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Skill Check Assessment" }), _jsxs("p", { className: "text-sm text-gray-600", children: ["Teacher Dashboard \u2022 ", user?.name] })] }), _jsxs("button", { onClick: handleLogout, className: "flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors", children: [_jsx(LogOut, { size: 20 }), "Logout"] })] }) }), _jsx("main", { className: "max-w-7xl mx-auto p-4", children: _jsxs("div", { className: "grid grid-cols-1 tablet:grid-cols-3 gap-4 h-screen tablet:h-auto", children: [_jsx("div", { className: "tablet:col-span-1", children: _jsx(StudentRoster, { students: students, selectedStudentId: selectedStudentId, onSelectStudent: setSelectedStudentId, loading: studentsLoading }) }), _jsx("div", { className: "tablet:col-span-2 space-y-4", children: selectedStudentId ? (_jsxs(_Fragment, { children: [_jsx(SkillStatusTabs, { activeTab: activeTab, onTabChange: setActiveTab, pendingCount: pendingSkills, completedCount: completedSkills }), _jsx(SkillChecklistForm, { skills: skills, studentSkills: studentSkills, onSubmit: handleSaveAssessment, loading: isSaving || skillsLoading || studentSkillsLoading })] })) : (_jsx("div", { className: "card h-96 flex items-center justify-center text-center text-gray-500", children: _jsxs("div", { children: [_jsx("p", { className: "text-lg font-medium mb-2", children: "Select a student to begin assessment" }), _jsx("p", { className: "text-sm", children: "Choose a student from the list on the left" })] }) })) })] }) })] }));
}
