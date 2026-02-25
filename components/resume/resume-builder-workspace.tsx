"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Printer, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { useFieldArray, useForm } from "react-hook-form";

import { useAppToast } from "@/hooks/use-app-toast";
import { useResumeStore } from "@/store/use-resume-store";
import { formValuesToResumeData, resumeDataToFormValues } from "@/utils/resume-transformers";
import {
  ResumeBuilderFormValues,
  resumeBuilderSchema
} from "@/utils/schemas";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ResumePreview } from "@/components/resume/resume-preview";

const emptyExperience = {
  role: "",
  company: "",
  location: "",
  startDate: "",
  endDate: "",
  bullets: ""
};

const emptyProject = {
  name: "",
  techStack: "",
  startDate: "",
  endDate: "",
  link: "",
  bullets: ""
};

const emptyEducation = {
  institution: "",
  degree: "",
  field: "",
  startDate: "",
  endDate: "",
  location: ""
};

function SectionTitle({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-4">
      <h3 className="text-base font-semibold">{title}</h3>
      {description ? (
        <p className="text-sm text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}

export function ResumeBuilderWorkspace() {
  const { resumeData, setResumeData } = useResumeStore((state) => state);
  const toast = useAppToast();

  const defaultValues = useMemo(() => resumeDataToFormValues(resumeData), [resumeData]);

  const form = useForm<ResumeBuilderFormValues>({
    resolver: zodResolver(resumeBuilderSchema),
    defaultValues,
    mode: "onBlur"
  });

  const experienceFields = useFieldArray({
    control: form.control,
    name: "experience"
  });

  const projectFields = useFieldArray({
    control: form.control,
    name: "projects"
  });

  const educationFields = useFieldArray({
    control: form.control,
    name: "education"
  });

  const watchedValues = form.watch() as ResumeBuilderFormValues;
  const previewData = formValuesToResumeData(watchedValues);

  const submitHandler = form.handleSubmit(
    (values) => {
      setResumeData(formValuesToResumeData(values));
      toast.success("Resume saved", "Builder content synced to app state.");
    },
    () => {
      toast.error(
        "Validation required",
        "Complete required fields before saving your resume."
      );
    }
  );

  return (
    <section className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
      <form className="space-y-5" onSubmit={submitHandler}>
        <Card className="animate-enter">
          <CardHeader>
            <CardTitle>Create New Resume</CardTitle>
            <CardDescription>
              Section-based ATS-friendly editor with live preview.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-7">
            <section>
              <SectionTitle title="Personal Information" />
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" {...form.register("personalInfo.fullName")} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" {...form.register("personalInfo.email")} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" {...form.register("personalInfo.phone")} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" {...form.register("personalInfo.location")} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input id="linkedin" {...form.register("personalInfo.linkedin")} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" {...form.register("personalInfo.website")} />
                </div>
              </div>
            </section>

            <section>
              <SectionTitle title="Professional Summary" />
              <Textarea
                className="min-h-[120px]"
                {...form.register("summary")}
                placeholder="Write a concise summary tailored to the role."
              />
            </section>

            <section>
              <SectionTitle
                title="Experience"
                description="Add roles and 1 bullet per line for ATS parsing."
              />
              <div className="space-y-3">
                {experienceFields.fields.map((field, index) => (
                  <Card key={field.id} className="border-border/70 bg-background/70 shadow-none">
                    <CardContent className="space-y-3 p-4 pt-4">
                      <div className="grid gap-3 md:grid-cols-2">
                        <Input
                          placeholder="Role"
                          {...form.register(`experience.${index}.role`)}
                        />
                        <Input
                          placeholder="Company"
                          {...form.register(`experience.${index}.company`)}
                        />
                        <Input
                          placeholder="Location"
                          {...form.register(`experience.${index}.location`)}
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            placeholder="Start"
                            {...form.register(`experience.${index}.startDate`)}
                          />
                          <Input
                            placeholder="End"
                            {...form.register(`experience.${index}.endDate`)}
                          />
                        </div>
                      </div>
                      <Textarea
                        placeholder="One accomplishment per line"
                        className="min-h-[90px]"
                        {...form.register(`experience.${index}.bullets`)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => experienceFields.remove(index)}
                        disabled={experienceFields.fields.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove Role
                      </Button>
                    </CardContent>
                  </Card>
                ))}
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => experienceFields.append(emptyExperience)}
                >
                  <Plus className="h-4 w-4" />
                  Add Role
                </Button>
              </div>
            </section>

            <section>
              <SectionTitle title="Projects" />
              <div className="space-y-3">
                {projectFields.fields.map((field, index) => (
                  <Card key={field.id} className="border-border/70 bg-background/70 shadow-none">
                    <CardContent className="space-y-3 p-4 pt-4">
                      <div className="grid gap-3 md:grid-cols-2">
                        <Input
                          placeholder="Project Name"
                          {...form.register(`projects.${index}.name`)}
                        />
                        <Input
                          placeholder="Tech Stack"
                          {...form.register(`projects.${index}.techStack`)}
                        />
                        <Input
                          placeholder="Project Link"
                          {...form.register(`projects.${index}.link`)}
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            placeholder="Start"
                            {...form.register(`projects.${index}.startDate`)}
                          />
                          <Input
                            placeholder="End"
                            {...form.register(`projects.${index}.endDate`)}
                          />
                        </div>
                      </div>
                      <Textarea
                        placeholder="One project outcome per line"
                        className="min-h-[90px]"
                        {...form.register(`projects.${index}.bullets`)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => projectFields.remove(index)}
                        disabled={projectFields.fields.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove Project
                      </Button>
                    </CardContent>
                  </Card>
                ))}
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => projectFields.append(emptyProject)}
                >
                  <Plus className="h-4 w-4" />
                  Add Project
                </Button>
              </div>
            </section>

            <section>
              <SectionTitle title="Skills" description="Use comma or new line separated values." />
              <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-1">
                  <Label>Technical</Label>
                  <Textarea
                    className="min-h-[90px]"
                    {...form.register("skills.technical")}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Tools</Label>
                  <Textarea className="min-h-[90px]" {...form.register("skills.tools")} />
                </div>
                <div className="space-y-1">
                  <Label>Soft Skills</Label>
                  <Textarea className="min-h-[90px]" {...form.register("skills.soft")} />
                </div>
              </div>
            </section>

            <section>
              <SectionTitle title="Education" />
              <div className="space-y-3">
                {educationFields.fields.map((field, index) => (
                  <Card key={field.id} className="border-border/70 bg-background/70 shadow-none">
                    <CardContent className="space-y-3 p-4 pt-4">
                      <div className="grid gap-3 md:grid-cols-2">
                        <Input
                          placeholder="Institution"
                          {...form.register(`education.${index}.institution`)}
                        />
                        <Input
                          placeholder="Degree"
                          {...form.register(`education.${index}.degree`)}
                        />
                        <Input
                          placeholder="Field"
                          {...form.register(`education.${index}.field`)}
                        />
                        <Input
                          placeholder="Location"
                          {...form.register(`education.${index}.location`)}
                        />
                        <Input
                          placeholder="Start"
                          {...form.register(`education.${index}.startDate`)}
                        />
                        <Input
                          placeholder="End"
                          {...form.register(`education.${index}.endDate`)}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => educationFields.remove(index)}
                        disabled={educationFields.fields.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove Entry
                      </Button>
                    </CardContent>
                  </Card>
                ))}
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => educationFields.append(emptyEducation)}
                >
                  <Plus className="h-4 w-4" />
                  Add Education
                </Button>
              </div>
            </section>

            <section>
              <SectionTitle title="Certifications" />
              <Textarea
                className="min-h-[90px]"
                placeholder="One certification per line"
                {...form.register("certifications")}
              />
            </section>

            <div className="flex flex-wrap gap-3">
              <Button type="submit">Save Resume</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  window.print();
                }}
              >
                <Printer className="h-4 w-4" />
                Export as PDF
              </Button>
            </div>
            {Object.keys(form.formState.errors).length > 0 ? (
              <p className="text-xs text-red-500">
                Some required fields are incomplete. Review highlighted sections.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </form>

      <aside className="space-y-3">
        <div className="print-hide flex items-center justify-between">
          <h2 className="text-lg font-semibold">Live Resume Preview</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setResumeData(previewData);
              toast.info("Preview synced", "Current editor state saved to store.");
            }}
          >
            Sync Preview
          </Button>
        </div>
        <ResumePreview data={previewData} />
      </aside>
    </section>
  );
}
