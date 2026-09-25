import { useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import type { Skill, SkillCheck } from '@types';
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';

interface SkillChecklistFormProps {
  skills: Skill[];
  studentSkills?: SkillCheck[];
  onSubmit: (skillChecks: { skillId: string; completed: boolean }[]) => Promise<void>;
  loading?: boolean;
}

export function SkillChecklistForm({
  skills,
  studentSkills = [],
  onSubmit,
  loading = false,
}: SkillChecklistFormProps) {
  const { control, handleSubmit, watch, reset } = useForm({
    defaultValues: {
      skills: skills.map((skill) => ({
        skillId: skill.id,
        completed: studentSkills.find((ss) => ss.skillId === skill.id)?.completed || false,
      })),
    },
  });

  const formValues = watch();
  const completedCount = useMemo(
    () => formValues.skills.filter((s) => s.completed).length,
    [formValues.skills]
  );
  const lulusStatus = completedCount === skills.length;

  useEffect(() => {
    reset({
      skills: skills.map((skill) => ({
        skillId: skill.id,
        completed: studentSkills.find((ss) => ss.skillId === skill.id)?.completed || false,
      })),
    });
  }, [skills, studentSkills, reset]);

  const handleFormSubmit = async () => {
    await onSubmit(formValues.skills);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="card space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Skill Checklist</h2>
        <div
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            lulusStatus
              ? 'bg-success-100 text-success-700'
              : 'bg-warning-100 text-warning-700'
          }`}
        >
          {lulusStatus ? '✓ LULUS' : `${completedCount}/${skills.length}`}
        </div>
      </div>

      {skills.length === 0 ? (
        <div className="p-4 text-center text-gray-500">No skills available</div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {skills.map((skill, index) => (
            <Controller
              key={skill.id}
              name={`skills.${index}.completed`}
              control={control}
              render={({ field }) => (
                <label
                  className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    className="mt-1 w-5 h-5 cursor-pointer"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    disabled={loading}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{skill.name}</p>
                    <p className="text-sm text-gray-600">{skill.description}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      <span className="inline-block bg-gray-100 px-2 py-1 rounded">
                        {skill.category}
                      </span>
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    {field.value ? (
                      <CheckCircle2 className="text-success-500" size={24} />
                    ) : (
                      <Circle className="text-gray-300" size={24} />
                    )}
                  </div>
                </label>
              )}
            />
          ))}
        </div>
      )}

      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading || skills.length === 0}
        >
          {loading ? 'Saving...' : 'Save Assessment'}
        </button>
        {lulusStatus && (
          <div className="flex items-center gap-2 px-3 py-2 bg-success-50 text-success-700 rounded-lg">
            <AlertCircle size={18} />
            <span className="text-sm font-medium">Status: LULUS</span>
          </div>
        )}
      </div>
    </form>
  );
}
