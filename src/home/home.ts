import { grid } from "../the-grid";
import { authentication } from "./authentication";
import { initiateDevRelTracking } from "./devrel-tracker";
import { displayGitHubIssues } from "./fetch-github/fetch-and-display-previews";
import { readyToolbar } from "./ready-toolbar";
import { registerServiceWorker } from "./register-service-worker";
import { renderServiceMessage } from "./render-service-message";
import { renderErrorInModal } from "./rendering/display-popup-modal";
import { renderGitRevision } from "./rendering/render-github-login-button";
import { renderOrgsSelector } from "./rendering/render-orgs-selector";
import { generateSortingToolbar } from "./sorting/generate-sorting-buttons";
import { TaskManager } from "./task-manager";

// All unhandled errors are caught and displayed in a modal
window.addEventListener("error", (event: ErrorEvent) => renderErrorInModal(event.error));

// All unhandled promise rejections are caught and displayed in a modal
window.addEventListener("unhandledrejection", (event: PromiseRejectionEvent) => {
  renderErrorInModal(event.reason as Error);
  event.preventDefault();
});

renderGitRevision();
initiateDevRelTracking();
generateSortingToolbar();
renderServiceMessage();

grid(document.getElementById("grid") as HTMLElement, () => document.body.classList.add("grid-loaded")); // @DEV: display grid background
const container = document.getElementById("issues-container") as HTMLDivElement;

if (!container) {
  throw new Error("Could not find issues container");
}

export const taskManager = new TaskManager(container);

void (async function home() {
  void authentication();
  void readyToolbar();
  await taskManager.syncTasks(); // Sync tasks on load
  void displayGitHubIssues();
  void renderOrgsSelector();
  if ("serviceWorker" in navigator) {
    registerServiceWorker();
  }
})();
