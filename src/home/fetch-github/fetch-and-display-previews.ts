import { GitHubIssue } from "../github-types";
import { taskManager } from "../home";
import { applyAvatarsToIssues, renderGitHubIssues } from "../rendering/render-github-issues";
import { selectedOrgs } from "../rendering/render-orgs-selector";
import { Sorting } from "../sorting/generate-sorting-buttons";
import { sortIssuesController } from "../sorting/sort-issues-controller";
import { checkCacheIntegrityAndSyncTasks } from "./cache-integrity";

export type Options = {
  ordering: "normal" | "reverse";
};

// start at Directory view
let isProposalOnlyViewer = false;

// if the Directory/Proposals toggle is clicked re-render the issues
export const viewToggle = document.getElementById("view-toggle") as HTMLInputElement;
if (!viewToggle) {
  throw new Error("Could not find view toggle");
}
viewToggle.addEventListener("click", () => {
  isProposalOnlyViewer = !isProposalOnlyViewer;
  void displayGitHubIssues();
});

function getProposalsOnlyFilter(getProposals: boolean) {
  return (issue: GitHubIssue) => {
    if (!issue?.labels) return false;

    const hasPriceLabel = issue.labels.some((label) => {
      if (typeof label === "string") return false;
      return label.name?.startsWith("Price: ") || label.name?.startsWith("Price: ");
    });

    return getProposals ? !hasPriceLabel : hasPriceLabel;
  };
}

function filterIssuesBySelectedOrgs() {
  return (issue: GitHubIssue) => {
    if (!selectedOrgs.size) return true;
    const orgName = issue.repository_url.split("/").slice(-2, -1)[0];
    console.log(orgName);
    return selectedOrgs.has(orgName);
  };
}

// checks the cache's integrity, sorts issues, checks Directory/Proposals toggle, renders them and applies avatars
export async function displayGitHubIssues(sorting?: Sorting, options = { ordering: "normal" }) {
  await checkCacheIntegrityAndSyncTasks();
  const cachedTasks = taskManager.getTasks();
  const sortedIssues = sortIssuesController(cachedTasks, sorting, options);
  const sortedAndFiltered = sortedIssues.filter(getProposalsOnlyFilter(isProposalOnlyViewer)).filter(filterIssuesBySelectedOrgs());
  renderGitHubIssues(sortedAndFiltered);
  applyAvatarsToIssues();
}
