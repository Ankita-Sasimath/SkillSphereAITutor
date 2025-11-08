import SkillProgress from '../SkillProgress';

export default function SkillProgressExample() {
  const skills = [
    { name: "Web Development", level: 75, category: "Frontend" },
    { name: "Data Analysis", level: 60, category: "Analytics" },
    { name: "Machine Learning", level: 45, category: "AI/ML" },
    { name: "Mobile Development", level: 30, category: "Mobile" },
  ];

  return <SkillProgress skills={skills} />;
}