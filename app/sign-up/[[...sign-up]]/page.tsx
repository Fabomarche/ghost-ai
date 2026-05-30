import { SignUp } from "@clerk/nextjs";
import { Cpu, Users, FileText } from "lucide-react";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen bg-base">
      <div className="hidden flex-col justify-between bg-surface p-12 lg:flex lg:w-1/2">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand">
              <span className="text-base font-bold text-base">G</span>
            </div>
            <span className="text-lg font-semibold text-copy-primary">Ghost AI</span>
          </div>
        </div>

        <div className="my-auto max-w-md">
          <h1 className="text-3xl font-bold leading-tight text-copy-primary">
            Design systems at the speed of thought.
          </h1>
          <p className="mt-4 text-base text-copy-secondary">
            Describe your architecture in plain English. Ghost AI maps it to a
            shared canvas your whole team can refine in real time.
          </p>

          <div className="mt-8 space-y-6">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-dim">
                <Cpu className="h-5 w-5 text-brand" />
              </div>
              <div>
                <h3 className="font-medium text-copy-primary">
                  AI Architecture Generation
                </h3>
                <p className="mt-1 text-sm text-copy-muted">
                  Describe your system, AI maps it to nodes and edges on a live
                  canvas.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-dim">
                <Users className="h-5 w-5 text-brand" />
              </div>
              <div>
                <h3 className="font-medium text-copy-primary">
                  Real-time Collaboration
                </h3>
                <p className="mt-1 text-sm text-copy-muted">
                  Live cursors, presence indicators, and shared node editing
                  across your team.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-dim">
                <FileText className="h-5 w-5 text-brand" />
              </div>
              <div>
                <h3 className="font-medium text-copy-primary">
                  Instant Spec Generation
                </h3>
                <p className="mt-1 text-sm text-copy-muted">
                  Export a complete Markdown technical spec directly from the
                  canvas graph.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-sm text-copy-faint">
          &copy; 2026 Ghost AI. All rights reserved.
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 lg:w-1/2">
        <SignUp />
      </div>
    </div>
  );
}
