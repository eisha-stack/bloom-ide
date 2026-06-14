use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ShellInfo {
    pub id: String,
    pub name: String,
    pub available: bool,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TerminalSpawnResult {
    pub session_id: String,
    pub shell: String,
    pub cwd: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TerminalOutputEvent {
    pub session_id: String,
    pub data: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TerminalExitEvent {
    pub session_id: String,
    pub code: Option<i32>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CommandOutputEvent {
    pub execution_id: String,
    pub data: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CommandExitEvent {
    pub execution_id: String,
    pub code: Option<i32>,
    pub success: bool,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CommandExecuteResult {
    pub execution_id: String,
}
