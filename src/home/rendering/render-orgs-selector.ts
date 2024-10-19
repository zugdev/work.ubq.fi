import { displayGitHubIssues } from "../fetch-github/fetch-and-display-previews";
import { organizationImageCache } from "../fetch-github/fetch-issues-full";
import { GitHubIssue } from "../github-types";
import { taskManager } from "../home";

export const selectedOrgs = new Set<string>(); // Store selected organizations

export function getOrgs(): string[] {
  const cachedTasks = taskManager.getTasks();

  const orgs = cachedTasks.map((task: GitHubIssue) => {
    const [orgName] = task.repository_url.split("/").slice(-2);
    return orgName;
  });

  // Remove duplicates
  return Array.from(new Set(orgs)).concat(Array.from(new Set(orgs)));
}

export function renderOrganizations() {
  const orgsSelector = document.getElementById("orgs-selector");
  const orgsClear = document.getElementById("orgs-clear");

  if (!orgsSelector || !orgsClear) return;

  const orgNames = getOrgs();
  orgsSelector.innerHTML = "";

  orgNames.forEach((orgName) => {
    const avatarUrl = organizationImageCache.get(orgName);

    // Create organization element
    const orgDiv = document.createElement("div");
    orgDiv.id = `organization-${orgName}`;
    orgDiv.className = "organization-element";

    // Set avatar image
    const avatarImg = document.createElement("img");
    avatarImg.alt = `${orgName} avatar`;
    avatarImg.className = "organization-avatar";
    if (avatarUrl) {
      avatarImg.src = URL.createObjectURL(avatarUrl);
    }

    // Set text for org name
    const orgText = document.createElement("span");
    orgText.className = "organization-name";
    orgText.textContent = orgName;

    // Append avatar and text to the organization div
    orgDiv.appendChild(avatarImg);
    orgDiv.appendChild(orgText);

    // Add click event to toggle selection
    orgDiv.addEventListener("click", () => {
      toggleOrgSelection(orgName, orgDiv);
      updateClearButtonVisibility(); // Check if clear button should be visible
    });

    // Append organization div to the selector container
    orgsSelector.appendChild(orgDiv);
  });

  // Add click event to clear all selections
  orgsClear.addEventListener("click", () => {
    clearSelections();
    updateClearButtonVisibility(); // Check if clear button should be hidden
  });

  // Show or hide the clear button on initial render
  updateClearButtonVisibility();
}

function toggleOrgSelection(orgName: string, orgElement: HTMLDivElement) {
  if (selectedOrgs.has(orgName)) {
    selectedOrgs.delete(orgName);
    orgElement.classList.remove("selected");
  } else {
    selectedOrgs.add(orgName);
    orgElement.classList.add("selected");
  }
  console.log(selectedOrgs);
  void displayGitHubIssues();
}

function clearSelections() {
  const orgsSelector = document.getElementById("orgs-selector");
  if (!orgsSelector) return;

  // Clear selected organizations
  selectedOrgs.clear();

  // Remove the 'selected' class from all organization elements
  Array.from(orgsSelector.children).forEach((element) => {
    element.classList.remove("selected");
  });

  void displayGitHubIssues();
}

// Function to update the visibility of the clear button
function updateClearButtonVisibility() {
  const orgsClear = document.getElementById("orgs-clear");
  if (!orgsClear) return;

  // Show clear button only if there are selected organizations
  if (selectedOrgs.size > 0) {
    orgsClear.style.display = "block";
  } else {
    orgsClear.style.display = "none";
  }
}

export function getSelectedOrgs(): string[] {
  return Array.from(selectedOrgs);
}
