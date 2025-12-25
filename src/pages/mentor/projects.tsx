import MentorLayout from "./layout";
import { ProjectsPageContent } from "../student/projects";

export default function MentorProjects() {
  return (
    <MentorLayout>
      <ProjectsPageContent variant="mentor" />
    </MentorLayout>
  );
}
