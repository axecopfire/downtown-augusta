import * as fs from "fs";
import * as path from "path";
import type { Persona } from "./persona";

export type ReportKind = "bug" | "feature-request";

export interface Report {
  kind: ReportKind;
  persona: Persona;
  title: string;
  description: string;
  stepsToReproduce?: string[];
  expectedBehavior?: string;
  actualBehavior?: string;
  userImpact: string;
  priority: "critical" | "high" | "medium" | "low";
  pageUrl?: string;
}

const REPORTS_DIR = path.join(__dirname, "..", "reports");

let reportCounter = 0;

function ensureReportsDir() {
  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

export function fileReport(report: Report): string {
  ensureReportsDir();
  reportCounter++;
  const prefix = report.kind === "bug" ? "BUG" : "FEATURE";
  const filename = `${prefix}-${String(reportCounter).padStart(3, "0")}-${slugify(report.title)}.md`;
  const filepath = path.join(REPORTS_DIR, filename);

  const kindLabel = report.kind === "bug" ? "Bug Report" : "Feature Request";
  const priorityEmoji =
    report.priority === "critical"
      ? "🔴"
      : report.priority === "high"
        ? "🟠"
        : report.priority === "medium"
          ? "🟡"
          : "🟢";

  let md = `# ${kindLabel}: ${report.title}\n\n`;
  md += `| Field | Value |\n|-------|-------|\n`;
  md += `| **Reporter** | ${report.persona.name} (${report.persona.role}) |\n`;
  md += `| **Priority** | ${priorityEmoji} ${report.priority.toUpperCase()} |\n`;
  md += `| **Type** | ${kindLabel} |\n`;
  if (report.pageUrl) {
    md += `| **Page** | \`${report.pageUrl}\` |\n`;
  }
  md += `\n`;

  md += `## Description\n\n${report.description}\n\n`;

  if (report.stepsToReproduce && report.stepsToReproduce.length > 0) {
    md += `## Steps to Reproduce\n\n`;
    report.stepsToReproduce.forEach((step, i) => {
      md += `${i + 1}. ${step}\n`;
    });
    md += `\n`;
  }

  if (report.expectedBehavior) {
    md += `## Expected Behavior\n\n${report.expectedBehavior}\n\n`;
  }

  if (report.actualBehavior) {
    md += `## Actual Behavior\n\n${report.actualBehavior}\n\n`;
  }

  md += `## User Impact\n\n${report.userImpact}\n\n`;

  md += `## Persona Context\n\n`;
  md += `> **${report.persona.name}** — ${report.persona.backstory}\n`;

  fs.writeFileSync(filepath, md, "utf-8");
  return filepath;
}

export function clearReports() {
  ensureReportsDir();
  const files = fs.readdirSync(REPORTS_DIR);
  for (const file of files) {
    if (file.endsWith(".md")) {
      fs.unlinkSync(path.join(REPORTS_DIR, file));
    }
  }
  reportCounter = 0;
}
