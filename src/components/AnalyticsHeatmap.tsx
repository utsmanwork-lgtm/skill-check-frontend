import { useMemo } from 'react';
import type { AnalyticsData } from '@types';

interface AnalyticsHeatmapProps {
  data: AnalyticsData[];
  loading?: boolean;
}

export function AnalyticsHeatmap({ data, loading = false }: AnalyticsHeatmapProps) {
  const { students, skills, matrix } = useMemo(() => {
    const uniqueStudents = Array.from(
      new Map(data.map((d) => [d.studentId, d.studentName])).entries()
    ).map(([id, name]) => ({ id, name }));

    const uniqueSkills = Array.from(
      new Map(data.map((d) => [d.skillId, d.skillName])).entries()
    ).map(([id, name]) => ({ id, name }));

    const matrix = uniqueStudents.map((student) =>
      uniqueSkills.map((skill) =>
        data.find((d) => d.studentId === student.id && d.skillId === skill.id)?.completed
          ? 1
          : 0
      )
    );

    return { students: uniqueStudents, skills: uniqueSkills, matrix };
  }, [data]);

  if (loading) {
    return <div className="card p-4 text-center text-gray-500">Loading analytics...</div>;
  }

  if (students.length === 0 || skills.length === 0) {
    return <div className="card p-4 text-center text-gray-500">No data available</div>;
  }

  return (
    <div className="card overflow-x-auto">
      <h2 className="text-lg font-semibold mb-4">Student Skills Matrix</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left font-medium p-2 bg-gray-50 sticky left-0 z-10">Student</th>
            {skills.map((skill) => (
              <th
                key={skill.id}
                className="text-center font-medium p-2 bg-gray-50 min-w-16"
                title={skill.name}
              >
                <span className="text-xs">{skill.name.substring(0, 8)}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {students.map((student, studentIdx) => (
            <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="p-2 font-medium text-gray-900 sticky left-0 z-10 bg-white">
                {student.name.substring(0, 15)}
              </td>
              {matrix[studentIdx]?.map((completed, skillIdx) => (
                <td
                  key={`${student.id}-${skills[skillIdx].id}`}
                  className={`text-center p-2 ${
                    completed
                      ? 'bg-success-100 text-success-700'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {completed ? '✓' : '○'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
