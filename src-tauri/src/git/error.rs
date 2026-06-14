use serde::Serialize;
use thiserror::Error;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CommandError {
    pub code: &'static str,
    pub message: String,
}

#[derive(Debug, Error)]
pub enum GitError {
    #[error("No workspace folder is open")]
    NoWorkspace,
    #[error("Not a git repository")]
    NotRepo,
    #[error("Git is not installed or not on PATH")]
    GitNotInstalled,
    #[error("Git command failed: {0}")]
    CommandFailed(String),
    #[error("Invalid commit message")]
    EmptyMessage,
}

impl From<GitError> for CommandError {
    fn from(err: GitError) -> Self {
        let code = match &err {
            GitError::NoWorkspace => "NO_WORKSPACE",
            GitError::NotRepo => "NOT_REPO",
            GitError::GitNotInstalled => "GIT_NOT_INSTALLED",
            GitError::CommandFailed(_) => "GIT_COMMAND_FAILED",
            GitError::EmptyMessage => "EMPTY_MESSAGE",
        };
        Self {
            code,
            message: err.to_string(),
        }
    }
}

pub type GitResult<T> = Result<T, CommandError>;
