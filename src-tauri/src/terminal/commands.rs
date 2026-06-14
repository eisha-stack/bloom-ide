use tauri::{AppHandle, State};

use crate::fs::WorkspaceState;

use super::error::{CommandError, TerminalResult};
use super::state::TerminalManager;
use super::types::{
    CommandExecuteResult, ShellInfo, TerminalSpawnResult,
};

#[tauri::command]
pub fn terminal_list_shells() -> Vec<ShellInfo> {
    TerminalManager::list_shells()
}

#[tauri::command]
pub fn terminal_spawn(
    app: AppHandle,
    state: State<'_, TerminalManager>,
    workspace: State<'_, WorkspaceState>,
    shell: Option<String>,
    cwd: Option<String>,
    cols: Option<u16>,
    rows: Option<u16>,
) -> TerminalResult<TerminalSpawnResult> {
    let workspace_cwd = cwd.or_else(|| {
        workspace
            .get_root()
            .ok()
            .and_then(|path| path.to_str().map(str::to_string))
    });

    state
        .spawn(
            app,
            shell,
            workspace_cwd,
            cols.unwrap_or(80),
            rows.unwrap_or(24),
        )
        .map_err(CommandError::from)
}

#[tauri::command]
pub fn terminal_write(
    state: State<'_, TerminalManager>,
    session_id: String,
    data: String,
) -> TerminalResult<()> {
    state.write(&session_id, &data).map_err(CommandError::from)
}

#[tauri::command]
pub fn terminal_resize(
    state: State<'_, TerminalManager>,
    session_id: String,
    cols: u16,
    rows: u16,
) -> TerminalResult<()> {
    state
        .resize(&session_id, cols, rows)
        .map_err(CommandError::from)
}

#[tauri::command]
pub fn terminal_kill(
    state: State<'_, TerminalManager>,
    session_id: String,
) -> TerminalResult<()> {
    state.kill(&session_id).map_err(CommandError::from)
}

#[tauri::command]
pub fn terminal_execute(
    app: AppHandle,
    state: State<'_, TerminalManager>,
    workspace: State<'_, WorkspaceState>,
    command: String,
    shell: Option<String>,
    cwd: Option<String>,
) -> TerminalResult<CommandExecuteResult> {
    let workspace_cwd = cwd.or_else(|| {
        workspace
            .get_root()
            .ok()
            .and_then(|path| path.to_str().map(str::to_string))
    });

    state
        .execute(app, command, shell, workspace_cwd)
        .map_err(CommandError::from)
}
