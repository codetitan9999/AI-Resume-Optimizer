import { ResumeData } from "@/types/resume";
import { Separator } from "@/components/ui/separator";

function SectionHeading({ title }: { title: string }) {
  return (
    <div className="space-y-1">
      <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">
        {title}
      </h3>
      <Separator className="bg-slate-300" />
    </div>
  );
}

export function ResumePreview({ data }: { data: ResumeData }) {
  return (
    <article className="print-root rounded-lg border border-slate-200 bg-white p-8 text-[13px] leading-relaxed text-slate-900 shadow-soft">
      <header className="text-center">
        <h1 className="font-[var(--font-source-serif)] text-3xl font-semibold tracking-tight">
          {data.personalInfo.fullName || "Your Name"}
        </h1>
        <p className="mt-1 text-xs text-slate-600">
          {[
            data.personalInfo.email,
            data.personalInfo.phone,
            data.personalInfo.location,
            data.personalInfo.linkedin,
            data.personalInfo.website
          ]
            .filter(Boolean)
            .join(" | ")}
        </p>
      </header>

      <section className="mt-6 space-y-4">
        <SectionHeading title="Professional Summary" />
        <p>{data.summary}</p>
      </section>

      <section className="mt-6 space-y-4">
        <SectionHeading title="Experience" />
        <div className="space-y-4">
          {data.experience.map((item) => (
            <div key={item.id}>
              <div className="flex flex-wrap justify-between gap-2">
                <p className="font-semibold">{item.role}</p>
                <p className="text-slate-600">
                  {item.startDate} - {item.endDate}
                </p>
              </div>
              <p className="text-slate-700">
                {item.company}
                {item.location ? `, ${item.location}` : ""}
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {item.description.map((point) => (
                  <li key={`${item.id}-${point}`}>{point}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 space-y-4">
        <SectionHeading title="Projects" />
        <div className="space-y-4">
          {data.projects.map((project) => (
            <div key={project.id}>
              <div className="flex flex-wrap justify-between gap-2">
                <p className="font-semibold">{project.name}</p>
                <p className="text-slate-600">
                  {project.startDate} - {project.endDate}
                </p>
              </div>
              <p className="text-slate-700">{project.techStack}</p>
              {project.link ? <p className="text-slate-700">{project.link}</p> : null}
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {project.description.map((point) => (
                  <li key={`${project.id}-${point}`}>{point}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 space-y-4">
        <SectionHeading title="Skills" />
        <div className="space-y-1">
          <p>
            <span className="font-semibold">Technical:</span>{" "}
            {data.skills.technical.join(", ")}
          </p>
          <p>
            <span className="font-semibold">Tools:</span> {data.skills.tools.join(", ")}
          </p>
          <p>
            <span className="font-semibold">Soft Skills:</span> {data.skills.soft.join(", ")}
          </p>
        </div>
      </section>

      <section className="mt-6 space-y-4">
        <SectionHeading title="Education" />
        <div className="space-y-3">
          {data.education.map((entry) => (
            <div key={entry.id}>
              <div className="flex flex-wrap justify-between gap-2">
                <p className="font-semibold">
                  {entry.degree} in {entry.field}
                </p>
                <p className="text-slate-600">
                  {entry.startDate} - {entry.endDate}
                </p>
              </div>
              <p className="text-slate-700">
                {entry.institution}
                {entry.location ? `, ${entry.location}` : ""}
              </p>
            </div>
          ))}
        </div>
      </section>

      {data.certifications.length > 0 ? (
        <section className="mt-6 space-y-4">
          <SectionHeading title="Certifications" />
          <ul className="list-disc space-y-1 pl-5">
            {data.certifications.map((certification) => (
              <li key={certification}>{certification}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
