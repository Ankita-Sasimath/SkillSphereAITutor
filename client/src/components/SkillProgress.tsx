import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Skill {
  name: string;
  level: number;
  category: string;
}

interface SkillProgressProps {
  skills: Skill[];
}

export default function SkillProgress({ skills }: SkillProgressProps) {
  return (
    <Card className="p-6">
      <h3 className="font-display font-semibold text-xl mb-6">Your Skills</h3>
      <div className="space-y-6">
        {skills.map((skill, index) => (
          <div key={index}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-medium text-foreground" data-testid={`skill-name-${index}`}>
                  {skill.name}
                </p>
                <p className="text-xs text-muted-foreground">{skill.category}</p>
              </div>
              <span className="text-sm font-semibold text-foreground" data-testid={`skill-level-${index}`}>
                {skill.level}%
              </span>
            </div>
            <Progress value={skill.level} className="h-2" data-testid={`skill-progress-${index}`} />
          </div>
        ))}
      </div>
    </Card>
  );
}