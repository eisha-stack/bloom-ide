use serde::Serialize;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum TerminalError {
    #[error("terminal session not found: {0}")]
    NotFound(String),
    #[error("failed to spawn shell: {0}")]
    SpawnFailed(String),
    #[error("failed to write to terminal: {0}")]
    WriteFailed(String),
    #[error("failed to resize terminal: {0}")]
    ResizeFailed(String),
    #[error("unsupported shell: {0}")]
    UnsupportedShell(String),
    #[error("command execution failed: {0}")]
    ExecuteFailed(String),
}

impl From<TerminalError> for CommandError {
    fn from(err: TerminalError) -> Self {
        let code = match &err {
            TerminalError::NotFound(_) => "NOT_FOUND",
            TerminalError::SpawnFailed(_) => "SPAWN_FAILED",
            TerminalError::WriteFailed(_) => "WRITE_FAILED",
            TerminalError::ResizeFailed(_) => "RESIZE_FAILED",
            TerminalError::UnsupportedShell(_) => "UNSUPPORTED_SHELL",
            TerminalError::ExecuteFailed(_) => "EXECUTE_FAILED",
        };
        Self {
            code,
            message: err.to_string(),
        }
    }
}

pub type TerminalResult<T> = Result<T, CommandError>;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CommandError {
    pub code: &'static str,
    pub message: String,
}
