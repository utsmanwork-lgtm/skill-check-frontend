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
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');

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
    mutationFn: (skillChecks: { skillId: string; completed: boolean }[]) =>
      assessmentService.saveAssessment(selectedStudentId, skillChecks),
    onSuccess: () => {
      alert('Assessment saved successfully!');
    },
  });

  const handleSaveAssessment = async (skillChecks: { skillId: string; completed: boolean }[]) => {
    return new Promise<void>((resolve, reject) => {
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Skill Check Assessment</h1>
            <p className="text-sm text-gray-600">Teacher Dashboard • {user?.name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 tablet:grid-cols-3 gap-4 h-screen tablet:h-auto">
          {/* Left: Student Roster */}
          <div className="tablet:col-span-1">
            <StudentRoster
              students={students}
              selectedStudentId={selectedStudentId}
              onSelectStudent={setSelectedStudentId}
              loading={studentsLoading}
            />
          </div>

          {/* Right: Assessment Form */}
          <div className="tablet:col-span-2 space-y-4">
            {selectedStudentId ? (
              <>
                <SkillStatusTabs
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  pendingCount={pendingSkills}
                  completedCount={completedSkills}
                />

                <SkillChecklistForm
                  skills={skills}
                  studentSkills={studentSkills}
                  onSubmit={handleSaveAssessment}
                  loading={isSaving || skillsLoading || studentSkillsLoading}
                />
              </>
            ) : (
              <div className="card h-96 flex items-center justify-center text-center text-gray-500">
                <div>
                  <p className="text-lg font-medium mb-2">Select a student to begin assessment</p>
                  <p className="text-sm">Choose a student from the list on the left</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
