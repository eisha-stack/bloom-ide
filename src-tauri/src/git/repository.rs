use std::path::Path;
use std::process::Command;

use crate::fs::WorkspaceState;

use super::error::{GitError, GitResult};
use super::types::{GitChangeGroup, GitCommitResponse, GitFileChange, GitStatusResponse};

fn workspace_root(state: &WorkspaceState) -> GitResult<std::path::PathBuf> {
    state
        .get_root()
        .map_err(|_| GitError::NoWorkspace.into())
}

fn run_git(repo: &Path, args: &[&str]) -> GitResult<String> {
    let output = Command::new("git")
        .args(args)
        .current_dir(repo)
        .output()
        .map_err(|_| GitError::GitNotInstalled)?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
        Err(GitError::CommandFailed(if stderr.is_empty() {
            format!("git {} failed", args.join(" "))
        } else {
            stderr
        })
        .into())
    }
}

fn is_git_repo(repo: &Path) -> bool {
    run_git(repo, &["rev-parse", "--is-inside-work-tree"])
        .map(|value| value == "true")
        .unwrap_or(false)
}

fn current_branch(repo: &Path) -> Option<String> {
    run_git(repo, &["rev-parse", "--abbrev-ref", "HEAD"]).ok()
}

fn parse_porcelain_line(line: &str) -> Option<(String, String, String)> {
    if line.len() < 3 {
        return None;
    }

    let index_status = line.chars().next()?.to_string();
    let worktree_status = line.chars().nth(1)?.to_string();
    let mut path_part = line[3..].trim().to_string();

    if let Some((_, new_path)) = path_part.split_once(" -> ") {
        path_part = new_path.to_string();
    }

    Some((index_status, worktree_status, path_part))
}

fn push_change(group: &mut GitChangeGroup, category: &str, path: String, staged: bool) {
    let change = GitFileChange { path, staged };
    match category {
        "deleted" => group.deleted.push(change),
        "added" => group.added.push(change),
        _ => group.modified.push(change),
    }
}

fn classify_status(code: &str) -> &'static str {
    if code.contains('D') {
        "deleted"
    } else if code.contains('A') || code.contains('?') {
        "added"
    } else {
        "modified"
    }
}

fn parse_status_output(output: &str) -> (GitChangeGroup, GitChangeGroup) {
    let mut staged = GitChangeGroup::empty();
    let mut unstaged = GitChangeGroup::empty();

    for line in output.lines().filter(|line| !line.is_empty()) {
        let Some((index_status, worktree_status, path)) = parse_porcelain_line(line) else {
            continue;
        };

        if index_status != " " && index_status != "?" {
            let category = classify_status(&index_status);
            push_change(&mut staged, category, path.clone(), true);
        }

        if worktree_status != " " {
            let category = if index_status == "?" && worktree_status == "?" {
                "added"
            } else {
                classify_status(&worktree_status)
            };
            push_change(&mut unstaged, category, path, false);
        }
    }

    (staged, unstaged)
}

pub fn git_status(state: &WorkspaceState) -> GitResult<GitStatusResponse> {
    let repo = workspace_root(state)?;

    if !is_git_repo(&repo) {
        return Ok(GitStatusResponse {
            is_repo: false,
            branch: None,
            staged: GitChangeGroup::empty(),
            unstaged: GitChangeGroup::empty(),
            total_changes: 0,
        });
    }

    let branch = current_branch(&repo);
    let porcelain = run_git(&repo, &["status", "--porcelain=v1"])?;
    let (staged, unstaged) = parse_status_output(&porcelain);
    let total_changes = staged.len() + unstaged.len();

    Ok(GitStatusResponse {
        is_repo: true,
        branch,
        staged,
        unstaged,
        total_changes,
    })
}

pub fn git_stage_all(state: &WorkspaceState) -> GitResult<()> {
    let repo = workspace_root(state)?;
    if !is_git_repo(&repo) {
        return Err(GitError::NotRepo.into());
    }
    run_git(&repo, &["add", "-A"])?;
    Ok(())
}

pub fn git_commit(state: &WorkspaceState, message: String) -> GitResult<GitCommitResponse> {
    let trimmed = message.trim();
    if trimmed.is_empty() {
        return Err(GitError::EmptyMessage.into());
    }

    let repo = workspace_root(state)?;
    if !is_git_repo(&repo) {
        return Err(GitError::NotRepo.into());
    }

    run_git(&repo, &["commit", "-m", trimmed])?;
    let commit_hash = run_git(&repo, &["rev-parse", "--short", "HEAD"])?;

    Ok(GitCommitResponse {
        commit_hash,
        message: trimmed.to_string(),
    })
}

pub fn git_stage_paths(state: &WorkspaceState, paths: Vec<String>) -> GitResult<()> {
    let repo = workspace_root(state)?;
    if !is_git_repo(&repo) {
        return Err(GitError::NotRepo.into());
    }
    if paths.is_empty() {
        return Ok(());
    }

    let mut args = vec!["add"];
    for path in &paths {
        args.push(path.as_str());
    }
    run_git(&repo, &args)?;
    Ok(())
}
