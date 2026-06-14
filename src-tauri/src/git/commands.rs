use tauri::State;

use crate::fs::WorkspaceState;

use super::error::GitResult;
use super::repository::{git_commit, git_stage_all, git_stage_paths, git_status};
use super::types::{GitCommitResponse, GitStatusResponse};

#[tauri::command]
pub fn git_get_status(workspace: State<'_, WorkspaceState>) -> GitResult<GitStatusResponse> {
    git_status(&workspace)
}

#[tauri::command]
pub fn git_stage_all_files(workspace: State<'_, WorkspaceState>) -> GitResult<()> {
    git_stage_all(&workspace)
}

#[tauri::command]
pub fn git_stage_files(
    workspace: State<'_, WorkspaceState>,
    paths: Vec<String>,
) -> GitResult<()> {
    git_stage_paths(&workspace, paths)
}

#[tauri::command]
pub fn git_create_commit(
    workspace: State<'_, WorkspaceState>,
    message: String,
) -> GitResult<GitCommitResponse> {
    git_commit(&workspace, message)
}
